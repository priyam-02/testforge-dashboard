import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';
import type { TestSetMetrics, TestCaseMetrics } from '@/types/metrics';

export type TestSetAggregation = 'llm' | 'llm_prompt' | 'llm_test' | 'llm_prompt_comp' | 'llm_prompt_test' | 'full_config';
export type TestCaseAggregation = 'llm' | 'llm_prompt' | 'llm_test' | 'llm_prompt_comp' | 'llm_prompt_test' | 'full_config';

/**
 * Normalize prompt type from any format to canonical snake_case
 * Handles: "Chain-of-Thought" → "chain_of_thought", "Few-Shot" → "few_shot", etc.
 */
function normalizePromptType(value: string): string {
  return value.toLowerCase().replace(/-/g, '_');
}

/**
 * Normalize test type from any format to canonical lowercase
 * Handles: "Boundary" → "boundary", "Mixed" → "mix", "Mix" → "mix", etc.
 */
function normalizeTestType(value: string): string {
  const normalized = value.toLowerCase();
  // Normalize "Mixed" to "mix" for consistency across files
  return normalized === 'mixed' ? 'mix' : normalized;
}

/**
 * Normalize a single row of metrics data to ensure consistent format
 * Applies normalization to prompt_type and test_type fields if present
 */
function normalizeMetricsRow<T extends Record<string, any>>(row: T): T {
  const normalized = { ...row };

  // Normalize prompt_type if present (handles TSM Title-Case vs TCM snake_case)
  if ('prompt_type' in normalized && typeof normalized.prompt_type === 'string') {
    normalized.prompt_type = normalizePromptType(normalized.prompt_type);
  }

  // Normalize test_type if present (handles TSM Title-Case vs TCM lowercase, and Mix/Mixed inconsistency)
  if ('test_type' in normalized && typeof normalized.test_type === 'string') {
    normalized.test_type = normalizeTestType(normalized.test_type);
  }

  return normalized;
}

/**
 * Load Test Set Metrics from CSV file
 * @param aggregation - The aggregation level to load
 * @returns Parsed CSV data as TestSetMetrics array
 */
export async function loadTestSetMetrics(aggregation: TestSetAggregation): Promise<TestSetMetrics[]> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/Test set metrics', `tsm_${aggregation}.csv`);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const parsed = Papa.parse<TestSetMetrics>(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
      throw new Error(`Failed to parse CSV: ${parsed.errors[0].message}`);
    }

    // Apply normalization to all rows to ensure consistent format
    return parsed.data.map(normalizeMetricsRow);
  } catch (error) {
    console.error(`Error loading test set metrics (${aggregation}):`, error);
    throw error;
  }
}

/**
 * Load Test Case Metrics from CSV file
 * @param aggregation - The aggregation level to load
 * @returns Parsed CSV data as TestCaseMetrics array
 */
export async function loadTestCaseMetrics(aggregation: TestCaseAggregation): Promise<TestCaseMetrics[]> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/Test case metrics', `tcm_${aggregation}.csv`);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const parsed = Papa.parse<TestCaseMetrics>(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.error('CSV parsing errors:', parsed.errors);
      throw new Error(`Failed to parse CSV: ${parsed.errors[0].message}`);
    }

    // Apply normalization to all rows to ensure consistent format
    return parsed.data.map(normalizeMetricsRow);
  } catch (error) {
    console.error(`Error loading test case metrics (${aggregation}):`, error);
    throw error;
  }
}

/**
 * Load all Test Set Metrics files
 * @returns Object containing all test set metrics at different aggregation levels
 */
export async function loadAllTestSetMetrics() {
  const [llm, llmPrompt, llmTest, llmPromptComp, llmPromptTest, fullConfig] = await Promise.all([
    loadTestSetMetrics('llm'),
    loadTestSetMetrics('llm_prompt'),
    loadTestSetMetrics('llm_test'),
    loadTestSetMetrics('llm_prompt_comp'),
    loadTestSetMetrics('llm_prompt_test'),
    loadTestSetMetrics('full_config'),
  ]);

  return {
    llm,
    llmPrompt,
    llmTest,
    llmPromptComp,
    llmPromptTest,
    fullConfig,
  };
}

/**
 * Load all Test Case Metrics files
 * @returns Object containing all test case metrics at different aggregation levels
 */
export async function loadAllTestCaseMetrics() {
  const [llm, llmPrompt, llmTest, llmPromptComp, llmPromptTest, fullConfig] = await Promise.all([
    loadTestCaseMetrics('llm'),
    loadTestCaseMetrics('llm_prompt'),
    loadTestCaseMetrics('llm_test'),
    loadTestCaseMetrics('llm_prompt_comp'),
    loadTestCaseMetrics('llm_prompt_test'),
    loadTestCaseMetrics('full_config'),
  ]);

  return {
    llm,
    llmPrompt,
    llmTest,
    llmPromptComp,
    llmPromptTest,
    fullConfig,
  };
}
