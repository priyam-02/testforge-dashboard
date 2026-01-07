import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageToolCall } from "groq-sdk/resources/chat/completions";
import { loadTestSetMetrics, loadTestCaseMetrics } from "@/lib/data/load-csv";
import { executeQuery } from "@/lib/chat/data-queries";
import { getSystemPrompt } from "@/lib/chat/prompts";
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
  ).min(1).max(10), // Max 10 messages in history
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

// Zod validation schemas for function results
const comparePromptsSchema = z.array(z.object({
  prompt_type: z.string(),
  fc_percentage: z.number().min(0).max(100),
  O4_percentage: z.number().min(0).max(100),
  O1_percentage: z.number().min(0).max(100).optional(),
  O2_percentage: z.number().min(0).max(100).optional(),
  O3_percentage: z.number().min(0).max(100).optional(),
  csr_percentage: z.number().optional(),
  rsr_percentage: z.number().optional(),
  svr_percentage: z.number().optional(),
  avg_line_coverage: z.number().optional(),
}));

const compareComplexitySchema = z.array(z.object({
  complexity: z.string(),
  fc_percentage: z.number().min(0).max(100),
  O4_percentage: z.number().min(0).max(100),
  O1_percentage: z.number().min(0).max(100).optional(),
  O2_percentage: z.number().min(0).max(100).optional(),
  O3_percentage: z.number().min(0).max(100).optional(),
  csr_percentage: z.number().optional(),
  rsr_percentage: z.number().optional(),
  svr_percentage: z.number().optional(),
  avg_line_coverage: z.number().optional(),
}));

const compareTestTypeSchema = z.array(z.object({
  test_type: z.string(),
  fc_percentage: z.number().min(0).max(100),
  O4_percentage: z.number().min(0).max(100),
  O1_percentage: z.number().min(0).max(100).optional(),
  O2_percentage: z.number().min(0).max(100).optional(),
  O3_percentage: z.number().min(0).max(100).optional(),
  csr_percentage: z.number().optional(),
  rsr_percentage: z.number().optional(),
  svr_percentage: z.number().optional(),
  avg_line_coverage: z.number().optional(),
}));

const metricsByLLMSchema = z.array(z.object({
  llm: z.string(),
  fc_percentage: z.number().min(0).max(100),
  avg_line_coverage: z.number().min(0).max(100),
}));

const outcomeMetricsSchema = z.array(z.object({
  llm: z.string(),
  O1_percentage: z.number().min(0).max(100),
  O2_percentage: z.number().min(0).max(100),
  O3_percentage: z.number().min(0).max(100),
  O4_percentage: z.number().min(0).max(100),
  total_expected: z.number(),
}));

// Define function declarations for Groq (OpenAI-compatible format)
const tools = [
  {
    type: "function" as const,
    function: {
      name: "get_metrics_by_llm",
      description:
        "Get functional correctness (FC) and coverage values by LLM. REQUIRED for: 'Which is best?', 'Compare performance', 'Interesting observations', 'Overall analysis'. Use this FIRST to get FC values - the deciding factor for performance evaluation.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description:
              'Optional array of LLM names to filter (e.g., ["Llama3.3:70b", "Qwen2.5-coder:14b"]). If omitted, returns data for all LLMs.',
            items: {
              type: "string",
            },
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_outcome_metrics",
      description:
        "Get O1-O4 outcome percentages by LLM. O4 is the semantic validity rate. REQUIRED for: 'Interesting observations', 'Overall analysis', performance comparisons. Use this SECOND (after get_metrics_by_llm) to get O4 values for context.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compare_complexity",
      description:
        "Compare metrics across complexity levels (Easy, Moderate, Hard) for specified LLMs.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter",
            items: {
              type: "string",
            },
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compare_test_type",
      description:
        "Compare metrics across test types (standard, boundary, mixed) for specified LLMs.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter",
            items: {
              type: "string",
            },
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compare_prompts",
      description:
        "Compare prompt strategy effectiveness (zero_shot, few_shot, chain_of_thought) for specified LLMs.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter",
            items: {
              type: "string",
            },
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_summary_stats",
      description: "Get overall summary statistics across all data.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_filtered_metrics",
      description: "Get raw metrics with specific filters applied.",
      parameters: {
        type: "object",
        properties: {
          llm: {
            type: "string",
            description: 'LLM name (e.g., "Llama3.3:70b")',
          },
          promptStrategy: {
            type: "string",
            description:
              "Prompt strategy: zero_shot, few_shot, or chain_of_thought",
          },
          complexity: {
            type: "string",
            description: "Complexity level: Easy, Moderate, or Hard",
          },
          testType: {
            type: "string",
            description: "Test type: standard, boundary, or mix",
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
      return NextResponse.json(
        { error: "Invalid request format" },
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

    // Build conversation history
    const systemPrompt = getSystemPrompt(context);

    // Convert messages to Groq format (last 5 messages)
    const groqMessages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...messages.slice(-5).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // First call: Let model decide if it needs to call functions
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Fast and powerful model with function calling
      messages: groqMessages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
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

    // Execute all function calls with validation
    const functionMessages = responseMessage.tool_calls.map(
      (toolCall: ChatCompletionMessageToolCall) => {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Execute the query
        const queryResult = executeQuery(
          functionName,
          functionArgs,
          testSetData,
          testCaseData
        );

        // Validate query result with Zod
        try {
          let validated = queryResult;
          switch (functionName) {
            case 'compare_prompts':
              validated = comparePromptsSchema.parse(queryResult);
              break;
            case 'compare_complexity':
              validated = compareComplexitySchema.parse(queryResult);
              break;
            case 'compare_test_type':
              validated = compareTestTypeSchema.parse(queryResult);
              break;
            case 'get_metrics_by_llm':
              validated = metricsByLLMSchema.parse(queryResult);
              break;
            case 'get_outcome_metrics':
              validated = outcomeMetricsSchema.parse(queryResult);
              break;
          }

          console.log(`✓ Validation passed for ${functionName}`);

          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(validated),
          };
        } catch (error) {
          console.error(`✗ Validation failed for ${functionName}:`, error);
          // Still return result but log the error for monitoring
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(queryResult),
          };
        }
      }
    );

    console.log(
      "Sending function responses:",
      JSON.stringify(functionMessages, null, 2)
    );

    // Second call: Send function results back to model
    // Use 70B model for accurate number interpretation and insightful analysis
    const secondCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [...groqMessages, responseMessage, ...functionMessages],
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
