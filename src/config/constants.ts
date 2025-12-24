import type { SourceLanguage, LLMType, PromptType, TestType, Complexity } from '@/types/metrics';

// Source Languages Configuration
export const SOURCE_LANGUAGES: ReadonlyArray<{ value: SourceLanguage; label: string }> = [
  { value: 'Java', label: 'Java' },
  // Future languages can be added here
  // { value: 'Python', label: 'Python' },
  // { value: 'JavaScript', label: 'JavaScript' },
] as const;

// LLM Models Configuration (TestForge Design System)
export const LLMS: ReadonlyArray<{ value: LLMType; label: string; color: string }> = [
  { value: 'Llama3.3:70b', label: 'Llama 3.3 (70B)', color: '#40A9FF' },      // model.llama
  { value: 'Qwen2.5-coder:14b', label: 'Qwen 2.5 Coder (14B)', color: '#73D13D' }, // model.qwenCoder
  { value: 'Qwen3:4b', label: 'Qwen 3 (4B)', color: '#FF85C0' },          // model.qwen4b
  { value: 'Qwen3:32b', label: 'Qwen 3 (32B)', color: '#597EF7' },         // model.qwen32b
] as const;

// Prompt Strategy Configuration (TestForge Design System)
export const PROMPT_STRATEGIES: ReadonlyArray<{ value: PromptType; label: string; color: string }> = [
  { value: 'zero_shot', label: 'Zero-Shot', color: '#FAAD14' },         // outcome.O2 (orange)
  { value: 'few_shot', label: 'Few-Shot', color: '#597EF7' },          // model.qwen32b (indigo)
  { value: 'chain_of_thought', label: 'Chain-of-Thought', color: '#36CFC9' },  // outcome.O4 (teal)
] as const;

// Test Types Configuration (TestForge Design System)
export const TEST_TYPES: ReadonlyArray<{ value: TestType; label: string; color: string }> = [
  { value: 'standard', label: 'Standard', color: '#40A9FF' },          // model.llama (blue)
  { value: 'boundary', label: 'Boundary', color: '#FAAD14' },          // outcome.O2 (orange)
  { value: 'mix', label: 'Mixed', color: '#9254DE' },             // outcome.O3 (purple)
] as const;

// Problem Complexity Configuration (TestForge Design System)
export const COMPLEXITIES: ReadonlyArray<{ value: Complexity; label: string; color: string }> = [
  { value: 'Easy', label: 'Easy', color: '#36CFC9' },              // outcome.O4 (teal)
  { value: 'Moderate', label: 'Moderate', color: '#FAAD14' },          // outcome.O2 (orange)
  { value: 'Hard', label: 'Hard', color: '#FF4D4F' },              // outcome.O1 (red)
] as const;

// Metric Definitions
export const METRIC_DEFINITIONS = {
  CSR: {
    name: 'Compile Success Rate',
    description: 'Percentage of tests where all 20 submission records compiled successfully',
    acronym: 'CSR',
  },
  RSR: {
    name: 'Runtime Success Rate',
    description: 'Among compiled tests, percentage where ≥80% of submissions completed execution',
    acronym: 'RSR',
  },
  SVR: {
    name: 'Semantic Validity Rate',
    description: 'Among runtime success tests, percentage marked as semantically valid',
    acronym: 'SVR',
  },
  FC: {
    name: 'Functional Correctness',
    description: 'Percentage of test cases that pass on ≥80% of submissions',
    acronym: 'FC',
  },
  Coverage: {
    name: 'Code Coverage',
    description: 'Average line coverage for functionally correct test cases (top 16 by coverage)',
    acronym: 'COV',
  },
} as const;

// Outcome Metric Definitions (O1-O4) - Complete Partition
export const OUTCOME_DEFINITIONS = {
  O1: {
    name: 'Fails to Compile',
    description: 'Test suites that fail during compilation phase',
    acronym: 'O1',
    formula: '(total_expected - compiled) / total_expected × 100',
  },
  O2: {
    name: 'Runtime Failure',
    description: 'Compiles successfully but fails during execution',
    acronym: 'O2',
    formula: '(compiled - runtime_success) / total_expected × 100',
  },
  O3: {
    name: 'Semantically Invalid',
    description: 'Runs successfully but is semantically incorrect',
    acronym: 'O3',
    formula: '(runtime_success - semantically_valid) / total_expected × 100',
  },
  O4: {
    name: 'Valid Suite',
    description: 'Compiles, runs, and is semantically valid',
    acronym: 'O4',
    formula: 'semantically_valid / total_expected × 100',
  },
} as const;

// Outcome Colors (O1-O4)
export const OUTCOME_COLORS = {
  O1: '#FF4D4F',  // Red
  O2: '#FAAD14',  // Orange
  O3: '#9254DE',  // Purple
  O4: '#36CFC9',  // Teal
} as const;

// Aggregation Level Labels
export const AGGREGATION_LEVELS = {
  llm: 'By LLM',
  llm_prompt: 'By LLM × Prompt',
  llm_test: 'By LLM × Test Type',
  llm_prompt_comp: 'By LLM × Prompt × Complexity',
  llm_prompt_test: 'By LLM × Prompt × Test Type',
  full_config: 'Full Configuration (All Dimensions)',
} as const;

// Chart Configuration Defaults
export const CHART_DEFAULTS = {
  margin: { top: 20, right: 30, left: 20, bottom: 50 },
  animationDuration: 300,
  tooltipStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
  },
} as const;

// Helper Functions
export function getLLMColor(llm: string): string {
  const config = LLMS.find((l) => l.value === llm || l.label === llm);
  return config?.color || '#64748b'; // slate-500 as default
}

export function getPromptColor(prompt: string): string {
  const config = PROMPT_STRATEGIES.find((p) => p.value === prompt || p.label === prompt);
  return config?.color || '#64748b';
}

export function getTestTypeColor(testType: string): string {
  const config = TEST_TYPES.find((t) => t.value === testType || t.label === testType);
  return config?.color || '#64748b';
}

export function getComplexityColor(complexity: string): string {
  const config = COMPLEXITIES.find((c) => c.value === complexity || c.label === complexity);
  return config?.color || '#64748b';
}

// Performance Colors for Analytics Dashboard (TestForge Design System - Outcome Colors)
export const PERFORMANCE_COLORS = {
  CSR: '#FF4D4F',      // outcome.O1 (fails to compile - red)
  RSR: '#FAAD14',      // outcome.O2 (runtime failure - orange)
  SVR: '#9254DE',      // outcome.O3 (semantically invalid - purple)
  FC: '#597EF7',       // Indigo/Blue - distinct from all outcome colors
  Coverage: '#73D13D', // model.qwenCoder (green - distinct from all others)
} as const;

// Heatmap Colors for Performance Matrix (TestForge Design System)
export const HEATMAP_COLORS = {
  low: '#FF4D4F',      // outcome.O1 (0-33%)
  medium: '#FAAD14',   // outcome.O2 (34-66%)
  high: '#36CFC9',     // outcome.O4 (67-100%)
} as const;

// Helper function to get heatmap color based on percentage value
export function getHeatmapColor(value: number): string {
  if (value < 33) return HEATMAP_COLORS.low;
  if (value < 67) return HEATMAP_COLORS.medium;
  return HEATMAP_COLORS.high;
}
