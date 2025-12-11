import type { SourceLanguage, LLMType, PromptType, TestType, Complexity } from '@/types/metrics';

// Source Languages Configuration
export const SOURCE_LANGUAGES: ReadonlyArray<{ value: SourceLanguage; label: string }> = [
  { value: 'Java', label: 'Java' },
  // Future languages can be added here
  // { value: 'Python', label: 'Python' },
  // { value: 'JavaScript', label: 'JavaScript' },
] as const;

// LLM Models Configuration
export const LLMS: ReadonlyArray<{ value: LLMType; label: string; color: string }> = [
  { value: 'Llama3.3:70b', label: 'Llama 3.3 (70B)', color: '#3b82f6' },      // blue-500
  { value: 'Qwen2.5-coder:14b', label: 'Qwen 2.5 Coder (14B)', color: '#8b5cf6' }, // violet-500
  { value: 'Qwen3:4b', label: 'Qwen 3 (4B)', color: '#ec4899' },          // pink-500
  { value: 'Qwen3:32b', label: 'Qwen 3 (32B)', color: '#10b981' },         // emerald-500
] as const;

// Prompt Strategy Configuration (values match CSV format)
export const PROMPT_STRATEGIES: ReadonlyArray<{ value: PromptType; label: string; color: string }> = [
  { value: 'zero_shot', label: 'Zero-Shot', color: '#f59e0b' },         // amber-500
  { value: 'few_shot', label: 'Few-Shot', color: '#6366f1' },          // indigo-500
  { value: 'chain_of_thought', label: 'Chain-of-Thought', color: '#14b8a6' },  // teal-500
] as const;

// Test Types Configuration (values match CSV format)
export const TEST_TYPES: ReadonlyArray<{ value: TestType; label: string; color: string }> = [
  { value: 'standard', label: 'Standard', color: '#06b6d4' },          // cyan-500
  { value: 'boundary', label: 'Boundary', color: '#f97316' },          // orange-500
  { value: 'mix', label: 'Mixed', color: '#a855f7' },             // purple-500
] as const;

// Problem Complexity Configuration
export const COMPLEXITIES: ReadonlyArray<{ value: Complexity; label: string; color: string }> = [
  { value: 'Easy', label: 'Easy', color: '#22c55e' },              // green-500
  { value: 'Moderate', label: 'Moderate', color: '#eab308' },          // yellow-500
  { value: 'Hard', label: 'Hard', color: '#ef4444' },              // red-500
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
