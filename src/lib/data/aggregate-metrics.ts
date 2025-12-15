import type {
  TestSetMetrics,
  TestCaseMetrics,
  CombinedMetrics,
  AggregatedByComplexity,
  AggregatedByTestType,
  AggregatedByPrompt,
  HeatmapData,
  SummaryMetrics,
  DegradationMetrics,
} from '@/types/metrics';

/**
 * Calculate summary metrics from full dataset
 * Recalculates percentages from counts to match database aggregation exactly
 */
export function calculateSummaryMetrics(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
): SummaryMetrics {
  // Calculate total tests from test set data
  const totalTests = testSetData.reduce((sum, row) => sum + row.total_expected, 0);

  // Unique problems count (489 total in dataset)
  const uniqueProblems = 489;

  // Recalculate CSR, RSR, SVR from counts (not averaging percentages)
  const totalExpected = testSetData.reduce((sum, row) => sum + row.total_expected, 0);
  const totalCompiled = testSetData.reduce((sum, row) => sum + row.compiled, 0);
  const totalRuntimeSuccess = testSetData.reduce((sum, row) => sum + row.runtime_success, 0);
  const totalSemanticallyValid = testSetData.reduce((sum, row) => sum + row.semantically_valid, 0);

  const avgCSR = totalExpected > 0 ? (totalCompiled / totalExpected) * 100 : 0;
  const avgRSR = totalCompiled > 0 ? (totalRuntimeSuccess / totalCompiled) * 100 : 0;
  const avgSVR = totalRuntimeSuccess > 0 ? (totalSemanticallyValid / totalRuntimeSuccess) * 100 : 0;

  // Recalculate FC from counts (not averaging percentages)
  const totalTestCases = testCaseData.reduce((sum, row) => sum + row.total_test_cases, 0);
  const totalFunctionallyCorrect = testCaseData.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
  const avgFC = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

  // Calculate coverage as weighted average by functionally correct cases
  const totalFCCases = testCaseData.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
  const weightedCoverage = testCaseData.reduce((sum, row) =>
    sum + (row.avg_line_coverage * row.functionally_correct_cases), 0
  );
  const avgCoverage = totalFCCases > 0 ? weightedCoverage / totalFCCases : 0;

  return {
    totalTests,
    uniqueProblems,
    avgCSR,
    avgRSR,
    avgSVR,
    avgFC,
    avgCoverage,
  };
}

/**
 * Combine test set + test case metrics by LLM
 * Recalculates percentages from counts to match database aggregation exactly
 */
export function combineMetricsByLLM(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
): CombinedMetrics[] {
  // Group test set metrics by LLM
  const testSetByLLM = new Map<string, TestSetMetrics[]>();
  testSetData.forEach((row) => {
    if (!testSetByLLM.has(row.llm)) {
      testSetByLLM.set(row.llm, []);
    }
    testSetByLLM.get(row.llm)!.push(row);
  });

  // Group test case metrics by LLM
  const testCaseByLLM = new Map<string, TestCaseMetrics[]>();
  testCaseData.forEach((row) => {
    if (!testCaseByLLM.has(row.llm)) {
      testCaseByLLM.set(row.llm, []);
    }
    testCaseByLLM.get(row.llm)!.push(row);
  });

  // Combine metrics for each LLM
  const combined: CombinedMetrics[] = [];
  const allLLMs = new Set([...testSetByLLM.keys(), ...testCaseByLLM.keys()]);

  allLLMs.forEach((llm) => {
    const testSetRows = testSetByLLM.get(llm) || [];
    const testCaseRows = testCaseByLLM.get(llm) || [];

    // Recalculate test set metrics from counts
    const totalExpected = testSetRows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalCompiled = testSetRows.reduce((sum, row) => sum + row.compiled, 0);
    const totalRuntimeSuccess = testSetRows.reduce((sum, row) => sum + row.runtime_success, 0);
    const totalSemanticallyValid = testSetRows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const avgCSR = totalExpected > 0 ? (totalCompiled / totalExpected) * 100 : 0;
    const avgRSR = totalCompiled > 0 ? (totalRuntimeSuccess / totalCompiled) * 100 : 0;
    const avgSVR = totalRuntimeSuccess > 0 ? (totalSemanticallyValid / totalRuntimeSuccess) * 100 : 0;

    // Recalculate test case metrics from counts
    const totalTestCases = testCaseRows.reduce((sum, row) => sum + row.total_test_cases, 0);
    const totalFunctionallyCorrect = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const avgFC = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

    // Coverage is a weighted average by functionally correct cases
    const totalFCCases = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const weightedCoverage = testCaseRows.reduce((sum, row) =>
      sum + (row.avg_line_coverage * row.functionally_correct_cases), 0
    );
    const avgLineCoverage = totalFCCases > 0 ? weightedCoverage / totalFCCases : 0;

    combined.push({
      llm,
      csr_percentage: avgCSR,
      rsr_percentage: avgRSR,
      svr_percentage: avgSVR,
      fc_percentage: avgFC,
      avg_line_coverage: avgLineCoverage,
      functionally_correct_cases: totalFunctionallyCorrect,
      total_test_cases: totalTestCases,
    });
  });

  // Sort by FC percentage (best to worst)
  return combined.sort((a, b) => b.fc_percentage - a.fc_percentage);
}

/**
 * Aggregate by complexity level
 * Recalculates percentages from counts to match database aggregation exactly
 */
export function aggregateByComplexity(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
): AggregatedByComplexity[] {
  // Filter rows that have complexity field
  const testSetWithComplexity = testSetData.filter((row) => 'complexity' in row);
  const testCaseWithComplexity = testCaseData.filter((row) => 'complexity' in row);

  // Group by complexity
  const testSetByComplexity = new Map<string, TestSetMetrics[]>();
  testSetWithComplexity.forEach((row) => {
    const complexity = 'complexity' in row ? row.complexity : '';
    if (!testSetByComplexity.has(complexity)) {
      testSetByComplexity.set(complexity, []);
    }
    testSetByComplexity.get(complexity)!.push(row);
  });

  const testCaseByComplexity = new Map<string, TestCaseMetrics[]>();
  testCaseWithComplexity.forEach((row) => {
    const complexity = 'complexity' in row ? row.complexity : '';
    if (!testCaseByComplexity.has(complexity)) {
      testCaseByComplexity.set(complexity, []);
    }
    testCaseByComplexity.get(complexity)!.push(row);
  });

  // Combine metrics for each complexity level
  const aggregated: AggregatedByComplexity[] = [];
  const allComplexities = new Set([...testSetByComplexity.keys(), ...testCaseByComplexity.keys()]);

  allComplexities.forEach((complexity) => {
    const testSetRows = testSetByComplexity.get(complexity) || [];
    const testCaseRows = testCaseByComplexity.get(complexity) || [];

    // Recalculate test set metrics from counts
    const totalExpected = testSetRows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalCompiled = testSetRows.reduce((sum, row) => sum + row.compiled, 0);
    const totalRuntimeSuccess = testSetRows.reduce((sum, row) => sum + row.runtime_success, 0);
    const totalSemanticallyValid = testSetRows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const avgCSR = totalExpected > 0 ? (totalCompiled / totalExpected) * 100 : 0;
    const avgRSR = totalCompiled > 0 ? (totalRuntimeSuccess / totalCompiled) * 100 : 0;
    const avgSVR = totalRuntimeSuccess > 0 ? (totalSemanticallyValid / totalRuntimeSuccess) * 100 : 0;

    // Recalculate test case metrics from counts
    const totalTestCases = testCaseRows.reduce((sum, row) => sum + row.total_test_cases, 0);
    const totalFunctionallyCorrect = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const avgFC = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

    // Coverage is a weighted average by functionally correct cases
    const totalFCCases = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const weightedCoverage = testCaseRows.reduce((sum, row) =>
      sum + (row.avg_line_coverage * row.functionally_correct_cases), 0
    );
    const avgLineCoverage = totalFCCases > 0 ? weightedCoverage / totalFCCases : 0;

    aggregated.push({
      complexity,
      csr_percentage: avgCSR,
      rsr_percentage: avgRSR,
      svr_percentage: avgSVR,
      fc_percentage: avgFC,
      avg_line_coverage: avgLineCoverage,
    });
  });

  // Sort by complexity order: Easy, Moderate, Hard
  const order: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3 };
  return aggregated.sort((a, b) => (order[a.complexity] || 99) - (order[b.complexity] || 99));
}

/**
 * Aggregate by test type
 * Recalculates percentages from counts to match database aggregation exactly
 */
export function aggregateByTestType(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
): AggregatedByTestType[] {
  // Filter rows that have test_type field
  const testSetWithTestType = testSetData.filter((row) => 'test_type' in row);
  const testCaseWithTestType = testCaseData.filter((row) => 'test_type' in row);

  // Group by test type
  const testSetByTestType = new Map<string, TestSetMetrics[]>();
  testSetWithTestType.forEach((row) => {
    const testType = 'test_type' in row ? row.test_type : '';
    if (!testSetByTestType.has(testType)) {
      testSetByTestType.set(testType, []);
    }
    testSetByTestType.get(testType)!.push(row);
  });

  const testCaseByTestType = new Map<string, TestCaseMetrics[]>();
  testCaseWithTestType.forEach((row) => {
    const testType = 'test_type' in row ? row.test_type : '';
    if (!testCaseByTestType.has(testType)) {
      testCaseByTestType.set(testType, []);
    }
    testCaseByTestType.get(testType)!.push(row);
  });

  // Combine metrics for each test type
  const aggregated: AggregatedByTestType[] = [];
  const allTestTypes = new Set([...testSetByTestType.keys(), ...testCaseByTestType.keys()]);

  allTestTypes.forEach((testType) => {
    const testSetRows = testSetByTestType.get(testType) || [];
    const testCaseRows = testCaseByTestType.get(testType) || [];

    // Recalculate test set metrics from counts
    const totalExpected = testSetRows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalCompiled = testSetRows.reduce((sum, row) => sum + row.compiled, 0);
    const totalRuntimeSuccess = testSetRows.reduce((sum, row) => sum + row.runtime_success, 0);
    const totalSemanticallyValid = testSetRows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const avgCSR = totalExpected > 0 ? (totalCompiled / totalExpected) * 100 : 0;
    const avgRSR = totalCompiled > 0 ? (totalRuntimeSuccess / totalCompiled) * 100 : 0;
    const avgSVR = totalRuntimeSuccess > 0 ? (totalSemanticallyValid / totalRuntimeSuccess) * 100 : 0;

    // Recalculate test case metrics from counts
    const totalTestCases = testCaseRows.reduce((sum, row) => sum + row.total_test_cases, 0);
    const totalFunctionallyCorrect = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const avgFC = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

    // Coverage is a weighted average by functionally correct cases
    const totalFCCases = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const weightedCoverage = testCaseRows.reduce((sum, row) =>
      sum + (row.avg_line_coverage * row.functionally_correct_cases), 0
    );
    const avgLineCoverage = totalFCCases > 0 ? weightedCoverage / totalFCCases : 0;

    aggregated.push({
      test_type: testType,
      csr_percentage: avgCSR,
      rsr_percentage: avgRSR,
      svr_percentage: avgSVR,
      fc_percentage: avgFC,
      avg_line_coverage: avgLineCoverage,
    });
  });

  // Sort by FC percentage (best to worst)
  return aggregated.sort((a, b) => b.fc_percentage - a.fc_percentage);
}

/**
 * Aggregate by prompt strategy
 * Recalculates percentages from counts to match database aggregation exactly
 */
export function aggregateByPrompt(
  testSetData: TestSetMetrics[],
  testCaseData: TestCaseMetrics[]
): AggregatedByPrompt[] {
  // Filter rows that have prompt_type field
  const testSetWithPrompt = testSetData.filter((row) => 'prompt_type' in row);
  const testCaseWithPrompt = testCaseData.filter((row) => 'prompt_type' in row);

  // Group by prompt type
  const testSetByPrompt = new Map<string, TestSetMetrics[]>();
  testSetWithPrompt.forEach((row) => {
    const promptType = 'prompt_type' in row ? row.prompt_type : '';
    if (!testSetByPrompt.has(promptType)) {
      testSetByPrompt.set(promptType, []);
    }
    testSetByPrompt.get(promptType)!.push(row);
  });

  const testCaseByPrompt = new Map<string, TestCaseMetrics[]>();
  testCaseWithPrompt.forEach((row) => {
    const promptType = 'prompt_type' in row ? row.prompt_type : '';
    if (!testCaseByPrompt.has(promptType)) {
      testCaseByPrompt.set(promptType, []);
    }
    testCaseByPrompt.get(promptType)!.push(row);
  });

  // Combine metrics for each prompt type
  const aggregated: AggregatedByPrompt[] = [];
  const allPrompts = new Set([...testSetByPrompt.keys(), ...testCaseByPrompt.keys()]);

  allPrompts.forEach((promptType) => {
    const testSetRows = testSetByPrompt.get(promptType) || [];
    const testCaseRows = testCaseByPrompt.get(promptType) || [];

    // Recalculate test set metrics from counts
    const totalExpected = testSetRows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalCompiled = testSetRows.reduce((sum, row) => sum + row.compiled, 0);
    const totalRuntimeSuccess = testSetRows.reduce((sum, row) => sum + row.runtime_success, 0);
    const totalSemanticallyValid = testSetRows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const avgCSR = totalExpected > 0 ? (totalCompiled / totalExpected) * 100 : 0;
    const avgRSR = totalCompiled > 0 ? (totalRuntimeSuccess / totalCompiled) * 100 : 0;
    const avgSVR = totalRuntimeSuccess > 0 ? (totalSemanticallyValid / totalRuntimeSuccess) * 100 : 0;

    // Recalculate test case metrics from counts
    const totalTestCases = testCaseRows.reduce((sum, row) => sum + row.total_test_cases, 0);
    const totalFunctionallyCorrect = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const avgFC = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

    // Coverage is a weighted average by functionally correct cases
    const totalFCCases = testCaseRows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const weightedCoverage = testCaseRows.reduce((sum, row) =>
      sum + (row.avg_line_coverage * row.functionally_correct_cases), 0
    );
    const avgLineCoverage = totalFCCases > 0 ? weightedCoverage / totalFCCases : 0;

    aggregated.push({
      prompt_type: promptType,
      csr_percentage: avgCSR,
      rsr_percentage: avgRSR,
      svr_percentage: avgSVR,
      fc_percentage: avgFC,
      avg_line_coverage: avgLineCoverage,
    });
  });

  // Sort by FC percentage (best to worst)
  return aggregated.sort((a, b) => b.fc_percentage - a.fc_percentage);
}

/**
 * Transform data for heatmap visualization
 * Recalculates FC percentages from counts to match database aggregation exactly
 */
export function transformToHeatmap(
  testCaseData: TestCaseMetrics[]
): HeatmapData[] {
  // Filter rows that have test_type field
  const dataWithTestType = testCaseData.filter((row) => 'test_type' in row);

  // Group by LLM and test type - store entire rows for count-based calculation
  const grouped = new Map<string, Map<string, TestCaseMetrics[]>>();

  dataWithTestType.forEach((row) => {
    const llm = row.llm;
    const testType = 'test_type' in row ? row.test_type : '';

    if (!grouped.has(llm)) {
      grouped.set(llm, new Map());
    }
    if (!grouped.get(llm)!.has(testType)) {
      grouped.get(llm)!.set(testType, []);
    }
    grouped.get(llm)!.get(testType)!.push(row);
  });

  // Create heatmap data with recalculated FC percentages
  const heatmapData: HeatmapData[] = [];

  grouped.forEach((testTypes, llm) => {
    testTypes.forEach((rows, testType) => {
      // Recalculate FC from counts instead of averaging percentages
      const totalTestCases = rows.reduce((sum, row) => sum + row.total_test_cases, 0);
      const totalFunctionallyCorrect = rows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
      const avgFC = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

      heatmapData.push({
        llm,
        test_type: testType,
        value: avgFC,
      });
    });
  });

  return heatmapData;
}

/**
 * Calculate performance degradation from Easy to Hard problems
 * Returns absolute percentage point drops and severity assessment
 */
export function calculateDegradationMetrics(
  complexityData: AggregatedByComplexity[]
): DegradationMetrics | null {
  const easyMetrics = complexityData.find(m => m.complexity === 'Easy');
  const hardMetrics = complexityData.find(m => m.complexity === 'Hard');

  if (!easyMetrics || !hardMetrics) {
    return null;
  }

  // Round to 2 decimal places to match displayed values and avoid floating-point precision errors
  const csrDrop = Math.round((easyMetrics.csr_percentage - hardMetrics.csr_percentage) * 100) / 100;
  const rsrDrop = Math.round((easyMetrics.rsr_percentage - hardMetrics.rsr_percentage) * 100) / 100;
  const svrDrop = Math.round((easyMetrics.svr_percentage - hardMetrics.svr_percentage) * 100) / 100;
  const fcDrop = Math.round((easyMetrics.fc_percentage - hardMetrics.fc_percentage) * 100) / 100;
  const coverageDrop = Math.round((easyMetrics.avg_line_coverage - hardMetrics.avg_line_coverage) * 100) / 100;

  // Determine severity based on largest drop
  const maxDrop = Math.max(Math.abs(csrDrop), Math.abs(fcDrop));
  const severity: 'low' | 'medium' | 'high' =
    maxDrop > 20 ? 'high' : maxDrop > 10 ? 'medium' : 'low';

  return {
    csrDrop,
    rsrDrop,
    svrDrop,
    fcDrop,
    coverageDrop,
    severity,
  };
}
