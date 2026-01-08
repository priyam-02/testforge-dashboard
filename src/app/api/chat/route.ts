import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageToolCall } from "groq-sdk/resources/chat/completions";
import { loadTestSetMetrics, loadTestCaseMetrics } from "@/lib/data/load-csv";
import { queryMetrics } from "@/lib/chat/data-queries";
import { getFunctionCallingPrompt, getAnalysisPrompt } from "@/lib/chat/prompts";
import type { FilterState } from "@/types/metrics";
import { z } from "zod";
import { checkRateLimit as checkRateLimitLib, getClientIP } from "@/lib/rate-limit";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Input validation schema
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000), // Max 4K chars per message
    })
  ).min(1).max(50), // Max 50 messages in history (we only use last message - both stages are stateless)
  context: z.object({
    sourceLanguage: z.enum(['Java']).nullable(),
    llm: z.enum(['Llama3.3:70b', 'Qwen2.5-coder:14b', 'Qwen3:4b', 'Qwen3:32b']).nullable(),
    promptStrategy: z.enum(['zero_shot', 'few_shot', 'chain_of_thought']).nullable(),
    complexity: z.enum(['Easy', 'Moderate', 'Hard']).nullable(),
    testType: z.enum(['standard', 'boundary', 'mix']).nullable(),
    metricView: z.enum(['test-set', 'test-case', 'outcomes']),
  }),
});

type ChatRequest = z.infer<typeof chatRequestSchema>;

// Define function declaration for Groq (OpenAI-compatible format)
// Unified query interface replaces 8 specialized functions with 1 semantic extraction approach
const tools = [
  {
    type: "function" as const,
    function: {
      name: "query_metrics",
      description:
        "Universal metrics query with semantic parameter extraction. Use this for ANY question about LLM test generation metrics. Extract what dimension to compare (group_by) and what filters to apply from the user's question.",
      parameters: {
        type: "object",
        required: ["group_by"],
        properties: {
          group_by: {
            type: "array",
            description:
              "Dimension(s) to group/compare by. Extract from user question: 'Which LLM is best?' → ['llm'], 'Best prompt for Llama?' → ['prompt'], 'How does complexity affect results?' → ['complexity'], 'Are boundary tests harder?' → ['test_type']",
            items: {
              type: "string",
              enum: ["llm", "prompt", "complexity", "test_type"],
            },
          },
          filter: {
            type: "object",
            description:
              "Optional filters to narrow results. Only include filters explicitly mentioned in the question. If no filter mentioned, omit entirely.",
            properties: {
              llms: {
                type: "array",
                description:
                  'Specific LLM names to include (e.g., ["Llama3.3:70b"]). Extract from questions like "for Llama", "with Qwen", "Llama3.3:70b performance".',
                items: {
                  type: "string",
                  enum: ["Llama3.3:70b", "Qwen2.5-coder:14b", "Qwen3:4b", "Qwen3:32b"],
                },
              },
              prompt: {
                type: "string",
                description:
                  'Specific prompt strategy (e.g., "zero_shot"). Extract from questions like "with zero-shot", "using few-shot", "chain-of-thought performance".',
                enum: ["zero_shot", "few_shot", "chain_of_thought"],
              },
              complexity: {
                type: "string",
                description:
                  'Specific complexity level (e.g., "Hard"). Extract from questions like "on hard problems", "for easy tasks", "moderate difficulty".',
                enum: ["Easy", "Moderate", "Hard"],
              },
              test_type: {
                type: "string",
                description:
                  'Specific test type (e.g., "boundary"). Extract from questions like "boundary tests", "standard test cases", "mix test type".',
                enum: ["standard", "boundary", "mix"],
              },
            },
          },
          include_outcomes: {
            type: "boolean",
            description:
              "Include O1-O4 outcome metrics in results. Default: true. Set to false only if user explicitly asks to exclude outcome data.",
            default: true,
          },
        },
      },
    },
  },
];

export async function POST(request: Request) {
  try {
    // Rate limiting with proper IP extraction
    const ip = getClientIP(request);
    const rateLimitResult = checkRateLimitLib(ip, {
      max: 30, // requests per minute (Groq free tier)
      windowMs: 60 * 1000, // 1 minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error("❌ Request validation failed:", validation.error.format());
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: process.env.NODE_ENV === 'development' ? validation.error.format() : undefined
        },
        { status: 400 }
      );
    }

    const { messages, context } = validation.data;

    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Groq API key not configured. Please add GROQ_API_KEY to .env.local. Get a free key at https://console.groq.com/keys",
        },
        { status: 500 }
      );
    }

    // Load data
    const [testSetData, testCaseData] = await Promise.all([
      loadTestSetMetrics("full_config"),
      loadTestCaseMetrics("full_config"),
    ]);

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // Build Stage 1 messages (function calling) - STATELESS
    // Note: Context is NOT passed to prompts - chatbot always analyzes complete dataset
    // Stage 1 is stateless - only receives current question (no chat history)
    const functionCallingPrompt = getFunctionCallingPrompt();

    // Convert to Groq format (current question only, no history)
    const groqMessages = [
      {
        role: "system" as const,
        content: functionCallingPrompt,
      },
      {
        role: "user" as const,
        content: lastMessage.content,
      },
    ];

    // First call: Let model decide if it needs to call functions
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Fast and powerful model with function calling
      messages: groqMessages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0,  // Deterministic extraction - same question → same parameters
      max_tokens: 768,
    });

    const responseMessage = completion.choices[0].message;

    // Check if model wants to call functions
    if (
      !responseMessage.tool_calls ||
      responseMessage.tool_calls.length === 0
    ) {
      // No function call needed, return direct response
      return NextResponse.json({
        success: true,
        message: responseMessage.content || "No response from model",
        usedQuery: false,
      });
    }

    // Maximum result size (prevent memory/token issues)
    const MAX_RESULT_SIZE = 100; // Max 100 rows per query result

    // Helper to truncate oversized results
    function truncateQueryResult(result: unknown): unknown {
      if (!Array.isArray(result)) {
        return result; // Not an array, can't truncate
      }

      if (result.length > MAX_RESULT_SIZE) {
        console.warn(`⚠️ Query returned ${result.length} rows, truncating to ${MAX_RESULT_SIZE}`);
        return result.slice(0, MAX_RESULT_SIZE);
      }

      return result;
    }

    // Execute all function calls with validation
    const functionMessages = responseMessage.tool_calls.map(
      (toolCall: ChatCompletionMessageToolCall) => {
        const functionName = toolCall.function.name;

        // Security check: only allow query_metrics
        if (functionName !== 'query_metrics') {
          console.warn(`⚠️ SECURITY: Blocked unsafe query: ${functionName}`);
          console.warn(`⚠️ SECURITY: Tool call ID: ${toolCall.id}`);
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "Query not allowed" }),
          };
        }

        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Execute the unified query function
        let queryResult = queryMetrics(
          testSetData,
          testCaseData,
          functionArgs
        );

        // Truncate oversized results for safety
        queryResult = truncateQueryResult(queryResult);

        // Log query execution for monitoring
        const resultSize = Array.isArray(queryResult) ? queryResult.length : 'single object';
        console.log(`✓ Query executed: query_metrics`);
        console.log(`  - group_by: ${JSON.stringify(functionArgs.group_by)}`);
        console.log(`  - filter: ${JSON.stringify(functionArgs.filter || {})}`);
        console.log(`  - result size: ${resultSize}`);

        // Basic validation: ensure result is not null/undefined
        if (queryResult === null || queryResult === undefined) {
          console.error(`✗ Query returned null/undefined`);
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "Query returned no data" }),
          };
        }

        return {
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify(queryResult),
        };
      }
    );

    console.log(
      "Sending function responses:",
      JSON.stringify(functionMessages, null, 2)
    );

    // Detect response mode based on data structure (comparison vs lookup)
    const isComparison = functionMessages.some(msg => {
      try {
        const result = JSON.parse(msg.content);
        // Array with 2+ items = comparing multiple things
        return Array.isArray(result) && result.length > 1;
      } catch {
        return false;
      }
    });

    const responseMode = isComparison ? "COMPARISON" : "LOOKUP";
    console.log(`Response mode detected: ${responseMode}`);

    // Generate explicit guidance for Stage 2 based on detected mode
    const modeGuidance = isComparison
      ? "COMPARISON MODE: The data contains multiple items to compare. Provide 4-8 sentences with analysis explaining WHY patterns exist, WHAT they mean, who leads, and notable insights (especially O4 context)."
      : "LOOKUP MODE: The data is a single result. Provide 1-2 sentences with exact numbers only. No analysis needed.";

    // Second call: Send function results back to model
    // Use 70B model for accurate number interpretation and insightful analysis
    // Build new messages array with Stage 2 (analysis) prompt
    // Note: Context is NOT passed to prompts - chatbot always analyzes complete dataset
    // Both stages are stateless - only receive current question + tool JSON (no conversation history)
    const analysisPrompt = getAnalysisPrompt();
    const secondCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system" as const, content: analysisPrompt },
        { role: "system" as const, content: modeGuidance }, // Explicit mode instruction
        { role: "user" as const, content: lastMessage.content }, // Only current question
        responseMessage,
        ...functionMessages
      ],
      temperature: 0.3,  // Lower temperature = more deterministic, accurate with numbers
      max_tokens: 768,
    });

    const finalResponse = secondCompletion.choices[0].message;

    return NextResponse.json({
      success: true,
      message: finalResponse.content || "No response from model",
      usedQuery: true,
      queriesUsed: responseMessage.tool_calls.map(
        (tc: ChatCompletionMessageToolCall) => tc.function.name
      ),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Return generic error messages to clients (security best practice)
    // Detailed errors are logged server-side for debugging
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("401")) {
        return NextResponse.json(
          { error: "API service unavailable. Please try again later." },
          { status: 500 }
        );
      }
      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit") ||
        error.message.includes("429") ||
        error.message.includes("Too Many Requests")
      ) {
        return NextResponse.json(
          { error: "Service temporarily unavailable. Please try again in a few minutes." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Unable to process your request. Please try again later." },
      { status: 500 }
    );
  }
}
