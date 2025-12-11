import { z } from 'zod';

// Base Test Case Metrics Schema
export const testCaseMetricsBaseSchema = z.object({
  llm: z.string(),
  total_test_cases: z.number(),
  functionally_correct_cases: z.number(),
  fc_percentage: z.number(),
  avg_line_coverage: z.number(),
});

// Test Case Metrics with Prompt Type
export const testCaseMetricsWithPromptSchema = testCaseMetricsBaseSchema.extend({
  prompt_type: z.string(),
});

// Test Case Metrics with Test Type
export const testCaseMetricsWithTestSchema = testCaseMetricsBaseSchema.extend({
  test_type: z.string(),
});

// Test Case Metrics with Prompt and Complexity
export const testCaseMetricsWithPromptAndComplexitySchema = testCaseMetricsBaseSchema.extend({
  prompt_type: z.string(),
  complexity: z.string(),
});

// Test Case Metrics with Prompt and Test Type
export const testCaseMetricsWithPromptAndTestSchema = testCaseMetricsBaseSchema.extend({
  prompt_type: z.string(),
  test_type: z.string(),
});

// Full Test Case Metrics Schema
export const testCaseMetricsFullSchema = testCaseMetricsBaseSchema.extend({
  prompt_type: z.string(),
  test_type: z.string(),
  complexity: z.string(),
});

// Array Schemas
export const testCaseMetricsBaseArraySchema = z.array(testCaseMetricsBaseSchema);
export const testCaseMetricsWithPromptArraySchema = z.array(testCaseMetricsWithPromptSchema);
export const testCaseMetricsWithTestArraySchema = z.array(testCaseMetricsWithTestSchema);
export const testCaseMetricsWithPromptAndComplexityArraySchema = z.array(testCaseMetricsWithPromptAndComplexitySchema);
export const testCaseMetricsWithPromptAndTestArraySchema = z.array(testCaseMetricsWithPromptAndTestSchema);
export const testCaseMetricsFullArraySchema = z.array(testCaseMetricsFullSchema);
