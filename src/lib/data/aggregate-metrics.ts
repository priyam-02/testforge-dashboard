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
  OutcomeMetrics,
  AggregatedOutcomesByComplexity,
  AggregatedOutcomesByTestType,
  AggregatedOutcomesByPrompt,
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

  // Calculate O1-O4 outcome metrics
  const O1_count = totalExpected - totalCompiled;
  const O2_count = totalCompiled - totalRuntimeSuccess;
  const O3_count = totalRuntimeSuccess - totalSemanticallyValid;
  const O4_count = totalSemanticallyValid;

  const avgO1 = totalExpected > 0 ? (O1_count / totalExpected) * 100 : 0;
  const avgO2 = totalExpected > 0 ? (O2_count / totalExpected) * 100 : 0;
  const avgO3 = totalExpected > 0 ? (O3_count / totalExpected) * 100 : 0;
  const avgO4 = totalExpected > 0 ? (O4_count / totalExpected) * 100 : 0;

  const [normalizedO1, normalizedO2, normalizedO3, normalizedO4] =
    normalizeToSum100(avgO1, avgO2, avgO3, avgO4);

  return {
    totalTests,
    uniqueProblems,
    avgCSR,
    avgRSR,
    avgSVR,
    avgFC,
    avgCoverage,
    avgO1: normalizedO1,
    avgO2: normalizedO2,
    avgO3: normalizedO3,
    avgO4: normalizedO4,
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

/**
 * Normalize four percentages to sum exactly to 100%
 * Handles rounding errors by adjusting the largest value
 */
function normalizeToSum100(
  v1: number,
  v2: number,
  v3: number,
  v4: number
): [number, number, number, number] {
  // Round to 2 decimal places
  const rounded = [
    Math.round(v1 * 100) / 100,
    Math.round(v2 * 100) / 100,
    Math.round(v3 * 100) / 100,
    Math.round(v4 * 100) / 100,
  ];

  const sum = rounded.reduce((acc, val) => acc + val, 0);
  const diff = 100 - sum;

  // If there's a rounding error, adjust the largest value
  if (Math.abs(diff) > 0.01) {
    const maxIndex = rounded.indexOf(Math.max(...rounded));
    rounded[maxIndex] = Math.round((rounded[maxIndex] + diff) * 100) / 100;
  }

  return [rounded[0], rounded[1], rounded[2], rounded[3]];
}

/**
 * Calculate O1-O4 outcome metrics from test set data
 * O1-O4 form a complete partition (sum to 100%) with total_expected as denominator
 *
 * Formulas:
 * - O1 = (total_expected - compiled) / total_expected × 100
 * - O2 = (compiled - runtime_success) / total_expected × 100
 * - O3 = (runtime_success - semantically_valid) / total_expected × 100
 * - O4 = semantically_valid / total_expected × 100
 */
export function calculateOutcomeMetrics(
  testSetData: TestSetMetrics[]
): OutcomeMetrics[] {
  // Group by LLM
  const byLLM = new Map<string, TestSetMetrics[]>();
  testSetData.forEach((row) => {
    if (!byLLM.has(row.llm)) {
      byLLM.set(row.llm, []);
    }
    byLLM.get(row.llm)!.push(row);
  });

  const outcomes: OutcomeMetrics[] = [];

  byLLM.forEach((rows, llm) => {
    // Sum counts across all rows for this LLM
    const totalExpected = rows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalCompiled = rows.reduce((sum, row) => sum + row.compiled, 0);
    const totalRuntimeSuccess = rows.reduce((sum, row) => sum + row.runtime_success, 0);
    const totalSemanticallyValid = rows.reduce((sum, row) => sum + row.semantically_valid, 0);

    // Calculate counts for each outcome
    const O1_count = totalExpected - totalCompiled;
    const O2_count = totalCompiled - totalRuntimeSuccess;
    const O3_count = totalRuntimeSuccess - totalSemanticallyValid;
    const O4_count = totalSemanticallyValid;

    // Calculate percentages (all use total_expected as denominator)
    const O1_percentage = totalExpected > 0 ? (O1_count / totalExpected) * 100 : 0;
    const O2_percentage = totalExpected > 0 ? (O2_count / totalExpected) * 100 : 0;
    const O3_percentage = totalExpected > 0 ? (O3_count / totalExpected) * 100 : 0;
    const O4_percentage = totalExpected > 0 ? (O4_count / totalExpected) * 100 : 0;

    const [normalizedO1, normalizedO2, normalizedO3, normalizedO4] =
      normalizeToSum100(O1_percentage, O2_percentage, O3_percentage, O4_percentage);

    outcomes.push({
      llm,
      total_expected: totalExpected,
      O1_percentage: normalizedO1,
      O2_percentage: normalizedO2,
      O3_percentage: normalizedO3,
      O4_percentage: normalizedO4,
      O1_count,
      O2_count,
      O3_count,
      O4_count,
    });
  });

  // Sort by O4 (best to worst)
  return outcomes.sort((a, b) => b.O4_percentage - a.O4_percentage);
}

/**
 * Aggregate outcome metrics by complexity
 * Always returns all three complexity levels (Easy, Moderate, Hard) with 0 values for missing data
 */
export function aggregateOutcomesByComplexity(
  testSetData: TestSetMetrics[]
): AggregatedOutcomesByComplexity[] {
  const withComplexity = testSetData.filter((row) => 'complexity' in row);
  const byComplexity = new Map<string, TestSetMetrics[]>();

  withComplexity.forEach((row) => {
    const complexity = 'complexity' in row ? row.complexity : '';
    if (!byComplexity.has(complexity)) {
      byComplexity.set(complexity, []);
    }
    byComplexity.get(complexity)!.push(row);
  });

  // Define all complexity levels to ensure complete line chart
  const allComplexities = ['Easy', 'Moderate', 'Hard'];
  const aggregated: AggregatedOutcomesByComplexity[] = [];

  allComplexities.forEach((complexity) => {
    const rows = byComplexity.get(complexity) || [];

    if (rows.length > 0) {
      // Calculate metrics from actual data
      const totalExpected = rows.reduce((sum, row) => sum + row.total_expected, 0);
      const totalCompiled = rows.reduce((sum, row) => sum + row.compiled, 0);
      const totalRuntimeSuccess = rows.reduce((sum, row) => sum + row.runtime_success, 0);
      const totalSemanticallyValid = rows.reduce((sum, row) => sum + row.semantically_valid, 0);

      const O1_count = totalExpected - totalCompiled;
      const O2_count = totalCompiled - totalRuntimeSuccess;
      const O3_count = totalRuntimeSuccess - totalSemanticallyValid;
      const O4_count = totalSemanticallyValid;

      const O1_pct = totalExpected > 0 ? (O1_count / totalExpected) * 100 : 0;
      const O2_pct = totalExpected > 0 ? (O2_count / totalExpected) * 100 : 0;
      const O3_pct = totalExpected > 0 ? (O3_count / totalExpected) * 100 : 0;
      const O4_pct = totalExpected > 0 ? (O4_count / totalExpected) * 100 : 0;

      const [O1, O2, O3, O4] = normalizeToSum100(O1_pct, O2_pct, O3_pct, O4_pct);

      aggregated.push({
        complexity,
        O1_percentage: O1,
        O2_percentage: O2,
        O3_percentage: O3,
        O4_percentage: O4,
        total_expected: totalExpected,
      });
    } else {
      // Return zeros for missing complexity levels
      aggregated.push({
        complexity,
        O1_percentage: 0,
        O2_percentage: 0,
        O3_percentage: 0,
        O4_percentage: 0,
        total_expected: 0,
      });
    }
  });

  // Already sorted by complexity order (Easy, Moderate, Hard)
  return aggregated;
}

/**
 * Aggregate outcome metrics by test type
 */
export function aggregateOutcomesByTestType(
  testSetData: TestSetMetrics[]
): AggregatedOutcomesByTestType[] {
  const withTestType = testSetData.filter((row) => 'test_type' in row);
  const byTestType = new Map<string, TestSetMetrics[]>();

  withTestType.forEach((row) => {
    const testType = 'test_type' in row ? row.test_type : '';
    if (!byTestType.has(testType)) {
      byTestType.set(testType, []);
    }
    byTestType.get(testType)!.push(row);
  });

  const aggregated: AggregatedOutcomesByTestType[] = [];

  byTestType.forEach((rows, testType) => {
    const totalExpected = rows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalCompiled = rows.reduce((sum, row) => sum + row.compiled, 0);
    const totalRuntimeSuccess = rows.reduce((sum, row) => sum + row.runtime_success, 0);
    const totalSemanticallyValid = rows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const O1_count = totalExpected - totalCompiled;
    const O2_count = totalCompiled - totalRuntimeSuccess;
    const O3_count = totalRuntimeSuccess - totalSemanticallyValid;
    const O4_count = totalSemanticallyValid;

    const O1_pct = totalExpected > 0 ? (O1_count / totalExpected) * 100 : 0;
    const O2_pct = totalExpected > 0 ? (O2_count / totalExpected) * 100 : 0;
    const O3_pct = totalExpected > 0 ? (O3_count / totalExpected) * 100 : 0;
    const O4_pct = totalExpected > 0 ? (O4_count / totalExpected) * 100 : 0;

    const [O1, O2, O3, O4] = normalizeToSum100(O1_pct, O2_pct, O3_pct, O4_pct);

    aggregated.push({
      test_type: testType,
      O1_percentage: O1,
      O2_percentage: O2,
      O3_percentage: O3,
      O4_percentage: O4,
      total_expected: totalExpected,
    });
  });

  // Sort by O4 percentage (best to worst)
  return aggregated.sort((a, b) => b.O4_percentage - a.O4_percentage);
}

/**
 * Aggregate outcome metrics by prompt strategy
 */
export function aggregateOutcomesByPrompt(
  testSetData: TestSetMetrics[]
): AggregatedOutcomesByPrompt[] {
  const withPrompt = testSetData.filter((row) => 'prompt_type' in row);
  const byPrompt = new Map<string, TestSetMetrics[]>();

  withPrompt.forEach((row) => {
    const promptType = 'prompt_type' in row ? row.prompt_type : '';
    if (!byPrompt.has(promptType)) {
      byPrompt.set(promptType, []);
    }
    byPrompt.get(promptType)!.push(row);
  });

  const aggregated: AggregatedOutcomesByPrompt[] = [];

  byPrompt.forEach((rows, promptType) => {
    const totalExpected = rows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalCompiled = rows.reduce((sum, row) => sum + row.compiled, 0);
    const totalRuntimeSuccess = rows.reduce((sum, row) => sum + row.runtime_success, 0);
    const totalSemanticallyValid = rows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const O1_count = totalExpected - totalCompiled;
    const O2_count = totalCompiled - totalRuntimeSuccess;
    const O3_count = totalRuntimeSuccess - totalSemanticallyValid;
    const O4_count = totalSemanticallyValid;

    const O1_pct = totalExpected > 0 ? (O1_count / totalExpected) * 100 : 0;
    const O2_pct = totalExpected > 0 ? (O2_count / totalExpected) * 100 : 0;
    const O3_pct = totalExpected > 0 ? (O3_count / totalExpected) * 100 : 0;
    const O4_pct = totalExpected > 0 ? (O4_count / totalExpected) * 100 : 0;

    const [O1, O2, O3, O4] = normalizeToSum100(O1_pct, O2_pct, O3_pct, O4_pct);

    aggregated.push({
      prompt_type: promptType,
      O1_percentage: O1,
      O2_percentage: O2,
      O3_percentage: O3,
      O4_percentage: O4,
      total_expected: totalExpected,
    });
  });

  // Sort by O4 percentage (best to worst)
  return aggregated.sort((a, b) => b.O4_percentage - a.O4_percentage);
}

/**
 * Aggregate O4 outcome metrics by LLM × Test Type
 * For grouped bar visualization showing O4 (valid suite) performance
 */
export function aggregateO4ByLLMAndTestType(
  testSetData: TestSetMetrics[]
): Array<{llm: string; testType: string; O4_percentage: number; total_expected: number}> {
  const withBoth = testSetData.filter((row) => 'test_type' in row);
  const byLLMAndTestType = new Map<string, TestSetMetrics[]>();

  withBoth.forEach((row) => {
    const testType = 'test_type' in row ? row.test_type : '';
    const key = `${row.llm}|||${testType}`;

    if (!byLLMAndTestType.has(key)) {
      byLLMAndTestType.set(key, []);
    }
    byLLMAndTestType.get(key)!.push(row);
  });

  const aggregated: Array<{llm: string; testType: string; O4_percentage: number; total_expected: number}> = [];

  byLLMAndTestType.forEach((rows, key) => {
    const [llm, testType] = key.split('|||');

    const totalExpected = rows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalSemanticallyValid = rows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const O4_percentage = totalExpected > 0 ? (totalSemanticallyValid / totalExpected) * 100 : 0;

    aggregated.push({
      llm,
      testType,
      O4_percentage: Math.round(O4_percentage * 100) / 100,
      total_expected: totalExpected,
    });
  });

  return aggregated;
}

/**
 * Aggregate O4 (valid suite) percentage by LLM and Complexity
 */
export function aggregateO4ByLLMAndComplexity(
  testSetData: TestSetMetrics[]
): Array<{llm: string; complexity: string; O4_percentage: number; total_expected: number}> {
  const withBoth = testSetData.filter((row) => 'complexity' in row);
  const byLLMAndComplexity = new Map<string, TestSetMetrics[]>();

  withBoth.forEach((row) => {
    const complexity = 'complexity' in row ? row.complexity : '';
    const key = `${row.llm}|||${complexity}`;

    if (!byLLMAndComplexity.has(key)) {
      byLLMAndComplexity.set(key, []);
    }
    byLLMAndComplexity.get(key)!.push(row);
  });

  const aggregated: Array<{llm: string; complexity: string; O4_percentage: number; total_expected: number}> = [];

  byLLMAndComplexity.forEach((rows, key) => {
    const [llm, complexity] = key.split('|||');

    const totalExpected = rows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalSemanticallyValid = rows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const O4_percentage = totalExpected > 0 ? (totalSemanticallyValid / totalExpected) * 100 : 0;

    aggregated.push({
      llm,
      complexity,
      O4_percentage: Math.round(O4_percentage * 100) / 100,
      total_expected: totalExpected,
    });
  });

  return aggregated;
}

/**
 * Aggregate FC% and Coverage by LLM and Complexity
 */
export function aggregateFCCoverageByLLMAndComplexity(
  testCaseData: TestCaseMetrics[]
): Array<{llm: string; complexity: string; fc_percentage: number; avg_line_coverage: number}> {
  const withBoth = testCaseData.filter((row) => 'complexity' in row);
  const byLLMAndComplexity = new Map<string, TestCaseMetrics[]>();

  withBoth.forEach((row) => {
    const complexity = 'complexity' in row ? row.complexity : '';
    const key = `${row.llm}|||${complexity}`;

    if (!byLLMAndComplexity.has(key)) {
      byLLMAndComplexity.set(key, []);
    }
    byLLMAndComplexity.get(key)!.push(row);
  });

  const aggregated: Array<{llm: string; complexity: string; fc_percentage: number; avg_line_coverage: number}> = [];

  byLLMAndComplexity.forEach((rows, key) => {
    const [llm, complexity] = key.split('|||');

    const totalTestCases = rows.reduce((sum, row) => sum + row.total_test_cases, 0);
    const totalFunctionallyCorrect = rows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const fc_percentage = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

    // Coverage is weighted average by functionally correct cases
    const totalFCCases = rows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const weightedCoverage = rows.reduce((sum, row) =>
      sum + (row.avg_line_coverage * row.functionally_correct_cases), 0
    );
    const avg_line_coverage = totalFCCases > 0 ? weightedCoverage / totalFCCases : 0;

    aggregated.push({
      llm,
      complexity,
      fc_percentage: Math.round(fc_percentage * 100) / 100,
      avg_line_coverage: Math.round(avg_line_coverage * 100) / 100,
    });
  });

  return aggregated;
}

/**
 * Aggregate O4 (valid suite) percentage by LLM and Prompt Strategy
 */
export function aggregateO4ByLLMAndPrompt(
  testSetData: TestSetMetrics[]
): Array<{llm: string; prompt_type: string; O4_percentage: number; total_expected: number}> {
  const withBoth = testSetData.filter((row) => 'prompt_type' in row);
  const byLLMAndPrompt = new Map<string, TestSetMetrics[]>();

  withBoth.forEach((row) => {
    const promptType = 'prompt_type' in row ? row.prompt_type : '';
    const key = `${row.llm}|||${promptType}`;

    if (!byLLMAndPrompt.has(key)) {
      byLLMAndPrompt.set(key, []);
    }
    byLLMAndPrompt.get(key)!.push(row);
  });

  const aggregated: Array<{llm: string; prompt_type: string; O4_percentage: number; total_expected: number}> = [];

  byLLMAndPrompt.forEach((rows, key) => {
    const [llm, promptType] = key.split('|||');

    const totalExpected = rows.reduce((sum, row) => sum + row.total_expected, 0);
    const totalSemanticallyValid = rows.reduce((sum, row) => sum + row.semantically_valid, 0);

    const O4_percentage = totalExpected > 0 ? (totalSemanticallyValid / totalExpected) * 100 : 0;

    aggregated.push({
      llm,
      prompt_type: promptType,
      O4_percentage: Math.round(O4_percentage * 100) / 100,
      total_expected: totalExpected,
    });
  });

  return aggregated;
}

/**
 * Aggregate FC% by LLM and Prompt Strategy
 */
export function aggregateFCByLLMAndPrompt(
  testCaseData: TestCaseMetrics[]
): Array<{llm: string; prompt_type: string; fc_percentage: number}> {
  const withBoth = testCaseData.filter((row) => 'prompt_type' in row);
  const byLLMAndPrompt = new Map<string, TestCaseMetrics[]>();

  withBoth.forEach((row) => {
    const promptType = 'prompt_type' in row ? row.prompt_type : '';
    const key = `${row.llm}|||${promptType}`;

    if (!byLLMAndPrompt.has(key)) {
      byLLMAndPrompt.set(key, []);
    }
    byLLMAndPrompt.get(key)!.push(row);
  });

  const aggregated: Array<{llm: string; prompt_type: string; fc_percentage: number}> = [];

  byLLMAndPrompt.forEach((rows, key) => {
    const [llm, promptType] = key.split('|||');

    const totalTestCases = rows.reduce((sum, row) => sum + row.total_test_cases, 0);
    const totalFunctionallyCorrect = rows.reduce((sum, row) => sum + row.functionally_correct_cases, 0);
    const fc_percentage = totalTestCases > 0 ? (totalFunctionallyCorrect / totalTestCases) * 100 : 0;

    aggregated.push({
      llm,
      prompt_type: promptType,
      fc_percentage: Math.round(fc_percentage * 100) / 100,
    });
  });

  return aggregated;
}
