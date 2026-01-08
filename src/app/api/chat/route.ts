import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageToolCall } from "groq-sdk/resources/chat/completions";
import { loadTestSetMetrics, loadTestCaseMetrics } from "@/lib/data/load-csv";
import { executeQuery } from "@/lib/chat/data-queries";
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
  ).min(1).max(50), // Max 50 messages in history (we only use last 5 for Stage 1)
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

const comprehensiveComparisonSchema = z.array(z.object({
  llm: z.string(),
  fc_percentage: z.number().min(0).max(100),
  avg_line_coverage: z.number().min(0).max(100),
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
        "Get functional correctness (FC) and coverage values by LLM. REQUIRED for: 'Which is best?', 'Compare performance', 'Interesting observations', 'Overall analysis'. Use this FIRST to get FC values - the deciding factor for performance evaluation. Supports filtering by prompt strategy, complexity, and test type.",
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
          promptStrategy: {
            type: "string",
            description: "Optional prompt strategy to filter (e.g., 'zero_shot', 'few_shot', 'chain_of_thought')",
          },
          complexity: {
            type: "string",
            description: "Optional complexity level to filter (e.g., 'Easy', 'Moderate', 'Hard')",
          },
          testType: {
            type: "string",
            description: "Optional test type to filter (e.g., 'standard', 'boundary', 'mix')",
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
        "Get O1-O4 outcome percentages by LLM. O4 is the semantic validity rate. REQUIRED for: 'Interesting observations', 'Overall analysis', performance comparisons. Use this SECOND (after get_metrics_by_llm) to get O4 values for context. Supports filtering by LLMs, prompt strategy, complexity, and test type.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter (e.g., ['Llama3.3:70b', 'Qwen3:32b'])",
            items: {
              type: "string",
            },
          },
          promptStrategy: {
            type: "string",
            description: "Optional prompt strategy to filter (e.g., 'zero_shot', 'few_shot', 'chain_of_thought')",
          },
          complexity: {
            type: "string",
            description: "Optional complexity level to filter (e.g., 'Easy', 'Moderate', 'Hard')",
          },
          testType: {
            type: "string",
            description: "Optional test type to filter (e.g., 'standard', 'boundary', 'mix')",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compare_complexity",
      description:
        "Compare metrics across complexity levels (Easy, Moderate, Hard). Supports filtering by LLMs, prompt strategy, and test type.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter (e.g., ['Llama3.3:70b', 'Qwen3:32b'])",
            items: {
              type: "string",
            },
          },
          promptStrategy: {
            type: "string",
            description: "Optional prompt strategy to filter (e.g., 'zero_shot', 'few_shot', 'chain_of_thought')",
          },
          testType: {
            type: "string",
            description: "Optional test type to filter (e.g., 'standard', 'boundary', 'mix')",
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
        "Compare metrics across test types (standard, boundary, mix). Supports filtering by LLMs, prompt strategy, and complexity.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter (e.g., ['Llama3.3:70b', 'Qwen3:32b'])",
            items: {
              type: "string",
            },
          },
          promptStrategy: {
            type: "string",
            description: "Optional prompt strategy to filter (e.g., 'zero_shot', 'few_shot', 'chain_of_thought')",
          },
          complexity: {
            type: "string",
            description: "Optional complexity level to filter (e.g., 'Easy', 'Moderate', 'Hard')",
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
        "Compare prompt strategy effectiveness (zero_shot, few_shot, chain_of_thought). Supports filtering by LLMs, complexity, and test type.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter (e.g., ['Llama3.3:70b', 'Qwen3:32b'])",
            items: {
              type: "string",
            },
          },
          complexity: {
            type: "string",
            description: "Optional complexity level to filter (e.g., 'Easy', 'Moderate', 'Hard')",
          },
          testType: {
            type: "string",
            description: "Optional test type to filter (e.g., 'standard', 'boundary', 'mix')",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_summary_stats",
      description: "Get overall summary statistics. Supports filtering by LLMs, prompt strategy, complexity, and test type.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter (e.g., ['Llama3.3:70b', 'Qwen3:32b'])",
            items: {
              type: "string",
            },
          },
          promptStrategy: {
            type: "string",
            description: "Optional prompt strategy to filter (e.g., 'zero_shot', 'few_shot', 'chain_of_thought')",
          },
          complexity: {
            type: "string",
            description: "Optional complexity level to filter (e.g., 'Easy', 'Moderate', 'Hard')",
          },
          testType: {
            type: "string",
            description: "Optional test type to filter (e.g., 'standard', 'boundary', 'mix')",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_specific_metrics",
      description: "Get aggregated metrics for a specific filter combination (llm + prompt + complexity + test type). SAFE: Returns only aggregated summary, not raw data.",
      parameters: {
        type: "object",
        properties: {
          llm: {
            type: "string",
            description: "LLM name (e.g., 'Qwen3:32b', 'Llama3.3:70b')",
          },
          promptStrategy: {
            type: "string",
            description: "Prompt strategy (e.g., 'zero_shot', 'few_shot', 'chain_of_thought')",
          },
          complexity: {
            type: "string",
            description: "Problem complexity (e.g., 'Easy', 'Moderate', 'Hard')",
          },
          testType: {
            type: "string",
            description: "Test type (e.g., 'standard', 'boundary', 'mix')",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_comprehensive_comparison",
      description:
        "Get comprehensive LLM comparison including FC, Coverage, and O1-O4 outcomes. RECOMMENDED for: 'Which is best?', 'Compare all models', 'Interesting observations'. Returns complete picture in one call to reduce hallucination. Supports filtering by LLMs, prompt strategy, complexity, and test type.",
      parameters: {
        type: "object",
        properties: {
          llms: {
            type: "array",
            description: "Optional array of LLM names to filter (e.g., ['Llama3.3:70b', 'Qwen3:32b'])",
            items: {
              type: "string",
            },
          },
          promptStrategy: {
            type: "string",
            description: "Optional prompt strategy to filter (e.g., 'zero_shot', 'few_shot', 'chain_of_thought')",
          },
          complexity: {
            type: "string",
            description: "Optional complexity level to filter (e.g., 'Easy', 'Moderate', 'Hard')",
          },
          testType: {
            type: "string",
            description: "Optional test type to filter (e.g., 'standard', 'boundary', 'mix')",
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

    // Build conversation history for Stage 1 (function calling)
    // Note: Context is NOT passed to prompts - chatbot always analyzes complete dataset
    const functionCallingPrompt = getFunctionCallingPrompt();

    // Convert messages to Groq format (last 5 messages)
    const groqMessages = [
      {
        role: "system" as const,
        content: functionCallingPrompt,
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

    // Allowlist of safe queries (prevents raw data dumping)
    const SAFE_QUERIES = new Set([
      'get_metrics_by_llm',
      'get_outcome_metrics',
      'compare_prompts',
      'compare_test_type',
      'compare_complexity',
      'get_summary_stats',
      'get_specific_metrics',
      'get_comprehensive_comparison',
    ]);

    // Maximum result size (prevent memory/token issues)
    const MAX_RESULT_SIZE = 100; // Max 100 rows per query result

    // Helper to truncate oversized results
    function truncateQueryResult(result: unknown, queryName: string): unknown {
      if (!Array.isArray(result)) {
        return result; // Not an array, can't truncate
      }

      if (result.length > MAX_RESULT_SIZE) {
        console.warn(`⚠️ Query ${queryName} returned ${result.length} rows, truncating to ${MAX_RESULT_SIZE}`);
        return result.slice(0, MAX_RESULT_SIZE);
      }

      return result;
    }

    /**
     * Validates and auto-corrects function parameters from Stage 1 LLM
     * Handles common mistakes like passing "all" as string or wrong types
     */
    function validateAndCorrectParams(
      functionName: string,
      params: Record<string, unknown>
    ): Record<string, unknown> {
      const corrected = { ...params };

      // Auto-correct "all" string values → omit parameter
      if (corrected.llms === "all" || corrected.llms === "All") {
        delete corrected.llms;
      }
      if (corrected.promptStrategy === "all" || corrected.promptStrategy === "All") {
        delete corrected.promptStrategy;
      }
      if (corrected.complexity === "all" || corrected.complexity === "All") {
        delete corrected.complexity;
      }
      if (corrected.testType === "all" || corrected.testType === "All") {
        delete corrected.testType;
      }

      // Ensure llms is array if provided (handle single string)
      if (corrected.llms && !Array.isArray(corrected.llms)) {
        corrected.llms = [corrected.llms];
      }

      // Log corrections for monitoring
      if (JSON.stringify(params) !== JSON.stringify(corrected)) {
        console.warn('⚠️ Auto-corrected function params:', {
          function: functionName,
          original: params,
          corrected
        });
      }

      return corrected;
    }

    // Execute all function calls with validation
    const functionMessages = responseMessage.tool_calls.map(
      (toolCall: ChatCompletionMessageToolCall) => {
        const functionName = toolCall.function.name;

        // Security check: reject unknown/unsafe queries
        if (!SAFE_QUERIES.has(functionName)) {
          console.warn(`⚠️ SECURITY: Blocked unsafe query: ${functionName}`);
          console.warn(`⚠️ SECURITY: Tool call ID: ${toolCall.id}`);
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "Query not allowed" }),
          };
        }

        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Validate and auto-correct parameters
        const correctedArgs = validateAndCorrectParams(functionName, functionArgs);

        // Execute the query with corrected parameters
        let queryResult = executeQuery(
          functionName,
          correctedArgs,
          testSetData,
          testCaseData
        );

        // Truncate oversized results for safety
        queryResult = truncateQueryResult(queryResult, functionName);

        // Log query execution for monitoring
        console.log(`✓ Query executed: ${functionName}, result rows: ${Array.isArray(queryResult) ? queryResult.length : 'N/A'}`);

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
            case 'get_comprehensive_comparison':
              validated = comprehensiveComparisonSchema.parse(queryResult);
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
    // Stage 2 is stateless - only receives current question + tool JSON (no conversation history)
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
