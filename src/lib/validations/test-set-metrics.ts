import { z } from 'zod';

// Base Test Set Metrics Schema
export const testSetMetricsBaseSchema = z.object({
  llm: z.string(),
  total_expected: z.number(),
  compiled: z.number(),
  csr_percentage: z.number(),
  runtime_success: z.number(),
  rsr_percentage: z.number(),
  semantically_valid: z.number(),
  svr_percentage: z.number(),
});

// Test Set Metrics with Prompt Type
export const testSetMetricsWithPromptSchema = testSetMetricsBaseSchema.extend({
  prompt_type: z.string(),
});

// Test Set Metrics with Test Type
export const testSetMetricsWithTestSchema = testSetMetricsBaseSchema.extend({
  test_type: z.string(),
});

// Test Set Metrics with Prompt and Complexity
export const testSetMetricsWithPromptAndComplexitySchema = testSetMetricsBaseSchema.extend({
  prompt_type: z.string(),
  complexity: z.string(),
});

// Test Set Metrics with Prompt and Test Type
export const testSetMetricsWithPromptAndTestSchema = testSetMetricsBaseSchema.extend({
  prompt_type: z.string(),
  test_type: z.string(),
});

// Full Test Set Metrics Schema
export const testSetMetricsFullSchema = testSetMetricsBaseSchema.extend({
  prompt_type: z.string(),
  test_type: z.string(),
  complexity: z.string(),
});

// Array Schemas
export const testSetMetricsBaseArraySchema = z.array(testSetMetricsBaseSchema);
export const testSetMetricsWithPromptArraySchema = z.array(testSetMetricsWithPromptSchema);
export const testSetMetricsWithTestArraySchema = z.array(testSetMetricsWithTestSchema);
export const testSetMetricsWithPromptAndComplexityArraySchema = z.array(testSetMetricsWithPromptAndComplexitySchema);
export const testSetMetricsWithPromptAndTestArraySchema = z.array(testSetMetricsWithPromptAndTestSchema);
export const testSetMetricsFullArraySchema = z.array(testSetMetricsFullSchema);
