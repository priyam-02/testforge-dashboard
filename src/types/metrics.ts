// Source Language Types
export type SourceLanguage = 'Java'; // Expandable for future languages

// LLM Types
export type LLMType = 'Llama3.3:70b' | 'Qwen2.5-coder:14b' | 'Qwen3:4b' | 'Qwen3:32b';

// Prompt Types (matching CSV format)
export type PromptType = 'zero_shot' | 'few_shot' | 'chain_of_thought';

// Test Types (matching CSV format)
export type TestType = 'standard' | 'boundary' | 'mix';

// Complexity Types
export type Complexity = 'Easy' | 'Moderate' | 'Hard';

// Metric View Types
export type MetricView = 'test-set' | 'test-case' | 'outcomes';

// Filter State Interface
export interface FilterState {
  sourceLanguage: SourceLanguage | null;
  llm: LLMType | null;
  promptStrategy: PromptType | null;
  complexity: Complexity | null;
  testType: TestType | null;
  metricView: MetricView;
}

// Test Set Metrics Interfaces
export interface TestSetMetricsBase {
  llm: string;
  total_expected: number;
  compiled: number;
  csr_percentage: number;
  runtime_success: number;
  rsr_percentage: number;
  semantically_valid: number;
  svr_percentage: number;
}

export interface TestSetMetricsWithPrompt extends TestSetMetricsBase {
  prompt_type: string;
}

export interface TestSetMetricsWithTest extends TestSetMetricsBase {
  test_type: string;
}

export interface TestSetMetricsWithPromptAndComplexity extends TestSetMetricsBase {
  prompt_type: string;
  complexity: string;
}

export interface TestSetMetricsWithPromptAndTest extends TestSetMetricsBase {
  prompt_type: string;
  test_type: string;
}

export interface TestSetMetricsFull extends TestSetMetricsBase {
  prompt_type: string;
  test_type: string;
  complexity: string;
}

// Test Case Metrics Interfaces
export interface TestCaseMetricsBase {
  llm: string;
  total_test_cases: number;
  functionally_correct_cases: number;
  fc_percentage: number;
  avg_line_coverage: number;
}

export interface TestCaseMetricsWithPrompt extends TestCaseMetricsBase {
  prompt_type: string;
}

export interface TestCaseMetricsWithTest extends TestCaseMetricsBase {
  test_type: string;
}

export interface TestCaseMetricsWithPromptAndComplexity extends TestCaseMetricsBase {
  prompt_type: string;
  complexity: string;
}

export interface TestCaseMetricsWithPromptAndTest extends TestCaseMetricsBase {
  prompt_type: string;
  test_type: string;
}

export interface TestCaseMetricsFull extends TestCaseMetricsBase {
  prompt_type: string;
  test_type: string;
  complexity: string;
}

// Union Types for All Metrics
export type TestSetMetrics =
  | TestSetMetricsBase
  | TestSetMetricsWithPrompt
  | TestSetMetricsWithTest
  | TestSetMetricsWithPromptAndComplexity
  | TestSetMetricsWithPromptAndTest
  | TestSetMetricsFull;

export type TestCaseMetrics =
  | TestCaseMetricsBase
  | TestCaseMetricsWithPrompt
  | TestCaseMetricsWithTest
  | TestCaseMetricsWithPromptAndComplexity
  | TestCaseMetricsWithPromptAndTest
  | TestCaseMetricsFull;

// API Response Type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  error?: string;
}

// Analytics Interfaces for Polyglot-style visualizations

// Combined metrics interface (Test Set + Test Case)
export interface CombinedMetrics {
  llm: string;
  csr_percentage: number;
  rsr_percentage: number;
  svr_percentage: number;
  fc_percentage: number;
  avg_line_coverage: number;
  functionally_correct_cases: number;
  total_test_cases: number;
}

// Aggregated by complexity
export interface AggregatedByComplexity {
  complexity: string;
  csr_percentage: number;
  rsr_percentage: number;
  svr_percentage: number;
  fc_percentage: number;
  avg_line_coverage: number;
}

// Aggregated by test type
export interface AggregatedByTestType {
  test_type: string;
  csr_percentage: number;
  rsr_percentage: number;
  svr_percentage: number;
  fc_percentage: number;
  avg_line_coverage: number;
}

// Aggregated by prompt
export interface AggregatedByPrompt {
  prompt_type: string;
  csr_percentage: number;
  rsr_percentage: number;
  svr_percentage: number;
  fc_percentage: number;
  avg_line_coverage: number;
}

// Heatmap data
export interface HeatmapData {
  llm: string;
  test_type: string;
  value: number; // FC percentage
}

// Summary metrics
export interface SummaryMetrics {
  totalTests: number;
  uniqueProblems: number;
  avgCSR: number;
  avgRSR: number;
  avgSVR: number;
  avgFC: number;
  avgCoverage: number;
  avgO1: number;
  avgO2: number;
  avgO3: number;
  avgO4: number;
}

// Degradation metrics (Easy → Hard performance drop)
export interface DegradationMetrics {
  csrDrop: number;
  rsrDrop: number;
  svrDrop: number;
  fcDrop: number;
  coverageDrop: number;
  severity: 'low' | 'medium' | 'high';
}

// Outcome metrics (O1-O4) - Complete partition interface
export interface OutcomeMetrics {
  llm: string;
  total_expected: number;
  O1_percentage: number;
  O2_percentage: number;
  O3_percentage: number;
  O4_percentage: number;
  O1_count: number;
  O2_count: number;
  O3_count: number;
  O4_count: number;
}

export interface AggregatedOutcomesByComplexity {
  complexity: string;
  O1_percentage: number;
  O2_percentage: number;
  O3_percentage: number;
  O4_percentage: number;
  total_expected: number;
}

export interface AggregatedOutcomesByTestType {
  test_type: string;
  O1_percentage: number;
  O2_percentage: number;
  O3_percentage: number;
  O4_percentage: number;
  total_expected: number;
}

export interface AggregatedOutcomesByPrompt {
  prompt_type: string;
  O1_percentage: number;
  O2_percentage: number;
  O3_percentage: number;
  O4_percentage: number;
  total_expected: number;
}
