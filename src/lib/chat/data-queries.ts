import type {
  TestSetMetrics,
  TestCaseMetrics,
  LLMType,
  PromptType,
  Complexity,
  TestType,
} from '@/types/metrics';
import {
  calculateSummaryMetrics,
  combineMetricsByLLM,
  aggregateByComplexity,
  aggregateByTestType,
  aggregateByPrompt,
  calculateOutcomeMetrics,
} from '@/lib/data/aggregate-metrics';

/**
 * Data query functions exposed to LLM for answering questions
 */

export function getMetricsByLLM(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters?: {
    llms?: LLMType[];
    promptStrategy?: PromptType;
    complexity?: Complexity;
    testType?: TestType;
  }
) {
  // Apply filters to raw data first
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (filters?.llms && filters.llms.length > 0) {
    filteredTestSet = filteredTestSet.filter((row) => filters.llms!.includes(row.llm as LLMType));
    filteredTestCase = filteredTestCase.filter((row) => filters.llms!.includes(row.llm as LLMType));
  }

  if (filters?.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters?.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  if (filters?.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  return combineMetricsByLLM(filteredTestSet, filteredTestCase);
}

export function compareByComplexity(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters?: {
    llms?: LLMType[];
    promptStrategy?: PromptType;
    testType?: TestType;
  }
) {
  // Filter data by all dimensions before aggregating
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (filters?.llms && filters.llms.length > 0) {
    filteredTestSet = filteredTestSet.filter((row) => filters.llms!.includes(row.llm as LLMType));
    filteredTestCase = filteredTestCase.filter((row) => filters.llms!.includes(row.llm as LLMType));
  }

  if (filters?.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters?.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  return aggregateByComplexity(filteredTestSet, filteredTestCase);
}

export function compareByTestType(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters?: {
    llms?: LLMType[];
    promptStrategy?: PromptType;
    complexity?: Complexity;
  }
) {
  // Filter data by all dimensions before aggregating
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (filters?.llms && filters.llms.length > 0) {
    filteredTestSet = filteredTestSet.filter((row) => filters.llms!.includes(row.llm as LLMType));
    filteredTestCase = filteredTestCase.filter((row) => filters.llms!.includes(row.llm as LLMType));
  }

  if (filters?.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters?.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  return aggregateByTestType(filteredTestSet, filteredTestCase);
}

export function compareByPrompt(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters?: {
    llms?: LLMType[];
    complexity?: Complexity;
    testType?: TestType;
  }
) {
  // Filter data by all dimensions before aggregating
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (filters?.llms && filters.llms.length > 0) {
    filteredTestSet = filteredTestSet.filter((row) => filters.llms!.includes(row.llm as LLMType));
    filteredTestCase = filteredTestCase.filter((row) => filters.llms!.includes(row.llm as LLMType));
  }

  if (filters?.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  if (filters?.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  return aggregateByPrompt(filteredTestSet, filteredTestCase);
}

export function getSummaryStats(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters?: {
    llms?: LLMType[];
    promptStrategy?: PromptType;
    complexity?: Complexity;
    testType?: TestType;
  }
) {
  // Apply filters if provided
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (filters?.llms && filters.llms.length > 0) {
    filteredTestSet = filteredTestSet.filter((row) => filters.llms!.includes(row.llm as LLMType));
    filteredTestCase = filteredTestCase.filter((row) => filters.llms!.includes(row.llm as LLMType));
  }

  if (filters?.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters?.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  if (filters?.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  return calculateSummaryMetrics(filteredTestSet, filteredTestCase);
}

export function getOutcomeMetrics(
  testSetData: TestSetMetrics[],
  filters?: {
    llms?: LLMType[];
    promptStrategy?: PromptType;
    complexity?: Complexity;
    testType?: TestType;
  }
) {
  // Apply filters if provided
  let filteredTestSet = testSetData;

  if (filters?.llms && filters.llms.length > 0) {
    filteredTestSet = filteredTestSet.filter((row) => filters.llms!.includes(row.llm as LLMType));
  }

  if (filters?.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters?.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  if (filters?.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  return calculateOutcomeMetrics(filteredTestSet);
}

/**
 * Get comprehensive comparison across all dimensions
 * Combines FC, Coverage, and O1-O4 metrics in a single response
 * Reduces hallucination risk by providing pre-joined data
 */
export function getComprehensiveComparison(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters?: {
    llms?: LLMType[];
    promptStrategy?: PromptType;
    complexity?: Complexity;
    testType?: TestType;
  }
) {
  // Apply filters if provided
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (filters?.llms && filters.llms.length > 0) {
    filteredTestSet = filteredTestSet.filter((row) => filters.llms!.includes(row.llm as LLMType));
    filteredTestCase = filteredTestCase.filter((row) => filters.llms!.includes(row.llm as LLMType));
  }

  if (filters?.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters?.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  if (filters?.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  // Get FC and coverage by LLM (already filtered)
  const fcMetrics = combineMetricsByLLM(filteredTestSet, filteredTestCase);

  // Get O1-O4 outcomes by LLM (already filtered)
  const outcomeMetrics = calculateOutcomeMetrics(filteredTestSet);

  // Merge into comprehensive view
  return fcMetrics.map(fc => {
    const outcome = outcomeMetrics.find(o => o.llm === fc.llm);
    return {
      llm: fc.llm,
      fc_percentage: fc.fc_percentage,
      avg_line_coverage: fc.avg_line_coverage,
      O1_percentage: outcome?.O1_percentage || 0,
      O2_percentage: outcome?.O2_percentage || 0,
      O3_percentage: outcome?.O3_percentage || 0,
      O4_percentage: outcome?.O4_percentage || 0,
      total_expected: outcome?.total_expected || 0,
    };
  });
}

/**
 * Get aggregated metrics for specific filter combination
 * SAFE: Returns only aggregated summary, not raw data rows
 * Recalculates percentages from counts to match database aggregation exactly
 */
export function getSpecificMetrics(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters: {
    llm?: LLMType | null;
    promptStrategy?: PromptType | null;
    complexity?: Complexity | null;
    testType?: TestType | null;
  }
) {
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  // Apply filters
  if (filters.llm) {
    filteredTestSet = filteredTestSet.filter((row) => row.llm === filters.llm);
    filteredTestCase = filteredTestCase.filter((row) => row.llm === filters.llm);
  }

  if (filters.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  if (filters.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  // Return empty result if no data matches
  if (filteredTestSet.length === 0 || filteredTestCase.length === 0) {
    return {
      fc_percentage: 0,
      avg_line_coverage: 0,
      O4_percentage: 0,
      count: 0,
      filters: filters
    };
  }

  // Recalculate O4 from counts (same pattern as aggregateByComplexity)
  const totalExpected = filteredTestSet.reduce((sum, row) => sum + row.total_expected, 0);
  const totalSemanticallyValid = filteredTestSet.reduce((sum, row) => sum + row.semantically_valid, 0);
  const o4Percentage = totalExpected > 0 ? (totalSemanticallyValid / totalExpected) * 100 : 0;

  // Recalculate FC from counts (same pattern as aggregateByComplexity)
  const totalTestCases = filteredTestCase.reduce((sum, row) => sum + row.total_test_cases, 0);
  const totalFunctionallyCorrect = filteredTestCase.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
  const fcPercentage = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

  // Coverage is weighted average by functionally correct cases (same pattern as aggregateByComplexity)
  const totalFCCases = filteredTestCase.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
  const weightedCoverage = filteredTestCase.reduce((sum, row) =>
    sum + (row.avg_line_coverage * row.functionally_correct_cases), 0
  );
  const avgLineCoverage = totalFCCases > 0 ? weightedCoverage / totalFCCases : 0;

  return {
    fc_percentage: fcPercentage,
    avg_line_coverage: avgLineCoverage,
    O4_percentage: o4Percentage,
    count: filteredTestSet.length,
    filters: filters
  };
}

/**
 * DEPRECATED: Use getSpecificMetrics instead
 * Kept for backwards compatibility but not exposed via executeQuery
 */
export function getFilteredMetrics(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  filters: {
    llm?: LLMType | null;
    promptStrategy?: PromptType | null;
    complexity?: Complexity | null;
    testType?: TestType | null;
  }
) {
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  // Apply filters
  if (filters.llm) {
    filteredTestSet = filteredTestSet.filter((row) => row.llm === filters.llm);
    filteredTestCase = filteredTestCase.filter((row) => row.llm === filters.llm);
  }

  if (filters.promptStrategy) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'prompt_type' in row && row.prompt_type === filters.promptStrategy
    );
  }

  if (filters.complexity) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'complexity' in row && row.complexity === filters.complexity
    );
  }

  if (filters.testType) {
    filteredTestSet = filteredTestSet.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
    filteredTestCase = filteredTestCase.filter((row) =>
      'test_type' in row && row.test_type === filters.testType
    );
  }

  return {
    testSet: filteredTestSet,
    testCase: filteredTestCase,
    combined: combineMetricsByLLM(filteredTestSet, filteredTestCase),
  };
}

/**
 * Execute a data query based on query name and parameters
 */
export function executeQuery(
  queryName: string,
  params: Record<string, unknown> | null,
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
): unknown {
  switch (queryName) {
    case 'get_metrics_by_llm':
      return getMetricsByLLM(
        testSetData,
        testCaseData,
        params ? {
          llms: params.llms as LLMType[] | undefined,
          promptStrategy: params.promptStrategy as PromptType | undefined,
          complexity: params.complexity as Complexity | undefined,
          testType: params.testType as TestType | undefined,
        } : undefined
      );

    case 'compare_complexity':
      return compareByComplexity(
        testSetData,
        testCaseData,
        params ? {
          llms: params.llms as LLMType[] | undefined,
          promptStrategy: params.promptStrategy as PromptType | undefined,
          testType: params.testType as TestType | undefined,
        } : undefined
      );

    case 'compare_test_type':
      return compareByTestType(
        testSetData,
        testCaseData,
        params ? {
          llms: params.llms as LLMType[] | undefined,
          promptStrategy: params.promptStrategy as PromptType | undefined,
          complexity: params.complexity as Complexity | undefined,
        } : undefined
      );

    case 'compare_prompts':
      return compareByPrompt(
        testSetData,
        testCaseData,
        params ? {
          llms: params.llms as LLMType[] | undefined,
          complexity: params.complexity as Complexity | undefined,
          testType: params.testType as TestType | undefined,
        } : undefined
      );

    case 'get_summary_stats':
      return getSummaryStats(
        testSetData,
        testCaseData,
        params ? {
          llms: params.llms as LLMType[] | undefined,
          promptStrategy: params.promptStrategy as PromptType | undefined,
          complexity: params.complexity as Complexity | undefined,
          testType: params.testType as TestType | undefined,
        } : undefined
      );

    case 'get_outcome_metrics':
      return getOutcomeMetrics(
        testSetData,
        params ? {
          llms: params.llms as LLMType[] | undefined,
          promptStrategy: params.promptStrategy as PromptType | undefined,
          complexity: params.complexity as Complexity | undefined,
          testType: params.testType as TestType | undefined,
        } : undefined
      );

    case 'get_comprehensive_comparison':
      return getComprehensiveComparison(
        testSetData,
        testCaseData,
        params ? {
          llms: params.llms as LLMType[] | undefined,
          promptStrategy: params.promptStrategy as PromptType | undefined,
          complexity: params.complexity as Complexity | undefined,
          testType: params.testType as TestType | undefined,
        } : undefined
      );

    case 'get_specific_metrics':
      return getSpecificMetrics(testSetData, testCaseData, params as {
        llm?: LLMType | null;
        promptStrategy?: PromptType | null;
        complexity?: Complexity | null;
        testType?: TestType | null;
      });

    // get_filtered_metrics intentionally not exposed via executeQuery (security)
    // Use get_specific_metrics instead (returns aggregated data only)

    default:
      throw new Error(`Unknown query: ${queryName}`);
  }
}
