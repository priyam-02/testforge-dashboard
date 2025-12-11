import type { FilterState, TestSetMetrics, TestCaseMetrics } from '@/types/metrics';

/**
 * Filter test set metrics based on active filters
 */
export function filterTestSetMetrics(
  data: TestSetMetrics[],
  filters: FilterState
): TestSetMetrics[] {
  return data.filter((row) => {
    // Filter by LLM if specified
    if (filters.llm && row.llm !== filters.llm) {
      return false;
    }

    // Filter by prompt strategy if specified
    if (filters.promptStrategy && 'prompt_type' in row && row.prompt_type !== filters.promptStrategy) {
      return false;
    }

    // Filter by complexity if specified
    if (filters.complexity && 'complexity' in row && row.complexity !== filters.complexity) {
      return false;
    }

    // Filter by test type if specified
    if (filters.testType && 'test_type' in row && row.test_type !== filters.testType) {
      return false;
    }

    return true;
  });
}

/**
 * Filter test case metrics based on active filters
 */
export function filterTestCaseMetrics(
  data: TestCaseMetrics[],
  filters: FilterState
): TestCaseMetrics[] {
  return data.filter((row) => {
    // Filter by LLM if specified
    if (filters.llm && row.llm !== filters.llm) {
      return false;
    }

    // Filter by prompt strategy if specified
    if (filters.promptStrategy && 'prompt_type' in row && row.prompt_type !== filters.promptStrategy) {
      return false;
    }

    // Filter by complexity if specified
    if (filters.complexity && 'complexity' in row && row.complexity !== filters.complexity) {
      return false;
    }

    // Filter by test type if specified
    if (filters.testType && 'test_type' in row && row.test_type !== filters.testType) {
      return false;
    }

    return true;
  });
}

/**
 * Determine which CSV aggregation level to load based on active filters
 * This optimizes data loading by choosing the most appropriate pre-aggregated file
 */
export function determineAggregationLevel(filters: FilterState):
  'llm' | 'llm_prompt' | 'llm_test' | 'llm_prompt_comp' | 'llm_prompt_test' | 'full_config' {

  const hasPrompt = !!filters.promptStrategy;
  const hasTest = !!filters.testType;
  const hasComplexity = !!filters.complexity;

  // Full configuration: all dimensions
  if (hasPrompt && hasTest && hasComplexity) {
    return 'full_config';
  }

  // LLM × Prompt × Test Type
  if (hasPrompt && hasTest) {
    return 'llm_prompt_test';
  }

  // LLM × Prompt × Complexity
  if (hasPrompt && hasComplexity) {
    return 'llm_prompt_comp';
  }

  // LLM × Prompt
  if (hasPrompt) {
    return 'llm_prompt';
  }

  // LLM × Test Type
  if (hasTest) {
    return 'llm_test';
  }

  // Default: LLM only (smallest aggregation)
  return 'llm';
}
