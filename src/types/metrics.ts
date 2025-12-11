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
export type MetricView = 'test-set' | 'test-case';

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
