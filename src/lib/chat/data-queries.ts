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
  llms?: LLMType[]
) {
  const combined = combineMetricsByLLM(testSetData, testCaseData);

  if (llms && llms.length > 0) {
    return combined.filter((row) => llms.includes(row.llm as LLMType));
  }

  return combined;
}

export function compareByComplexity(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  llms?: LLMType[]
) {
  // Filter data by LLMs before aggregating
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (llms && llms.length > 0) {
    filteredTestSet = testSetData.filter((row) => llms.includes(row.llm as LLMType));
    filteredTestCase = testCaseData.filter((row) => llms.includes(row.llm as LLMType));
  }

  return aggregateByComplexity(filteredTestSet, filteredTestCase);
}

export function compareByTestType(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  llms?: LLMType[]
) {
  // Filter data by LLMs before aggregating
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (llms && llms.length > 0) {
    filteredTestSet = testSetData.filter((row) => llms.includes(row.llm as LLMType));
    filteredTestCase = testCaseData.filter((row) => llms.includes(row.llm as LLMType));
  }

  return aggregateByTestType(filteredTestSet, filteredTestCase);
}

export function compareByPrompt(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[],
  llms?: LLMType[]
) {
  // Filter data by LLMs before aggregating
  let filteredTestSet = testSetData;
  let filteredTestCase = testCaseData;

  if (llms && llms.length > 0) {
    filteredTestSet = testSetData.filter((row) => llms.includes(row.llm as LLMType));
    filteredTestCase = testCaseData.filter((row) => llms.includes(row.llm as LLMType));
  }

  return aggregateByPrompt(filteredTestSet, filteredTestCase);
}

export function getSummaryStats(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
) {
  return calculateSummaryMetrics(testSetData, testCaseData);
}

export function getOutcomeMetrics(testSetData: TestSetMetrics[]) {
  return calculateOutcomeMetrics(testSetData);
}

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
  params: Record<string, unknown>,
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
): unknown {
  switch (queryName) {
    case 'get_metrics_by_llm':
      return getMetricsByLLM(
        testSetData,
        testCaseData,
        params.llms as LLMType[] | undefined
      );

    case 'compare_complexity':
      return compareByComplexity(
        testSetData,
        testCaseData,
        params.llms as LLMType[] | undefined
      );

    case 'compare_test_type':
      return compareByTestType(
        testSetData,
        testCaseData,
        params.llms as LLMType[] | undefined
      );

    case 'compare_prompts':
      return compareByPrompt(
        testSetData,
        testCaseData,
        params.llms as LLMType[] | undefined
      );

    case 'get_summary_stats':
      return getSummaryStats(testSetData, testCaseData);

    case 'get_outcome_metrics':
      return getOutcomeMetrics(testSetData);

    case 'get_filtered_metrics':
      return getFilteredMetrics(testSetData, testCaseData, params as {
        llm?: LLMType | null;
        promptStrategy?: PromptType | null;
        complexity?: Complexity | null;
        testType?: TestType | null;
      });

    default:
      throw new Error(`Unknown query: ${queryName}`);
  }
}
