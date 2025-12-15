'use client';

import { useEffect, useState } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { MetricViewToggle } from '@/components/filters/MetricViewToggle';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { LLMComparisonChart } from '@/components/analytics/LLMComparisonChart';
import { ComplexityTrendChart } from '@/components/analytics/ComplexityTrendChart';
import { TestTypeChart } from '@/components/analytics/TestTypeChart';
import { PromptStrategyChart } from '@/components/analytics/PromptStrategyChart';
import { PerformanceHeatmap } from '@/components/analytics/PerformanceHeatmap';
import { DegradationCards } from '@/components/analytics/DegradationCards';
import { CoverageFCGapChart } from '@/components/analytics/CoverageFCGapChart';
import { MetricsExplanation } from '@/components/info/MetricsExplanation';
import { useFilters } from '@/hooks/useFilters';
import { filterTestSetMetrics, filterTestCaseMetrics } from '@/lib/data/filter-data';
import {
  combineMetricsByLLM,
  aggregateByComplexity,
  aggregateByTestType,
  aggregateByPrompt,
  transformToHeatmap,
  calculateDegradationMetrics,
} from '@/lib/data/aggregate-metrics';
import type { TestSetMetrics, TestCaseMetrics } from '@/types/metrics';

export default function Home() {
  const filters = useFilters();
  const [rawTestSetData, setRawTestSetData] = useState<TestSetMetrics[]>([]);
  const [rawTestCaseData, setRawTestCaseData] = useState<TestCaseMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load all data once on mount
  useEffect(() => {
    if (!isMounted) return;

    async function loadData() {
      setLoading(true);
      try {
        // Load the most detailed data (full granularity) once
        // This allows us to filter client-side without refetching
        const [testSetRes, testCaseRes] = await Promise.all([
          fetch(`/api/test-set-metrics/full_config`),
          fetch(`/api/test-case-metrics/full_config`),
        ]);

        const testSetJson = await testSetRes.json();
        const testCaseJson = await testCaseRes.json();

        setRawTestSetData(testSetJson.data);
        setRawTestCaseData(testCaseJson.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isMounted]);

  // Filter data client-side when filters change (instant transitions!)
  // Add guards to prevent errors during initial render
  const testSetData = (rawTestSetData && rawTestSetData.length > 0) ? filterTestSetMetrics(rawTestSetData, filters) : [];
  const testCaseData = (rawTestCaseData && rawTestCaseData.length > 0) ? filterTestCaseMetrics(rawTestCaseData, filters) : [];

  // Calculate aggregated data for analytics view based on metric view
  // For test-set view, use empty test case data; for test-case view, use empty test set data
  const isTestSetView = filters.metricView === 'test-set';
  const llmComparison = isTestSetView
    ? combineMetricsByLLM(testSetData, [])
    : combineMetricsByLLM([], testCaseData);
  const complexityData = isTestSetView
    ? aggregateByComplexity(testSetData, [])
    : aggregateByComplexity([], testCaseData);
  const testTypeData = isTestSetView
    ? aggregateByTestType(testSetData, [])
    : aggregateByTestType([], testCaseData);
  const promptData = isTestSetView
    ? aggregateByPrompt(testSetData, [])
    : aggregateByPrompt([], testCaseData);
  const heatmapData = transformToHeatmap(testCaseData);
  const degradationMetrics = calculateDegradationMetrics(complexityData);

  // Show loading state until component is mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-8">
        <h1 className="text-4xl font-bold mb-2">TestForge Benchmark Dashboard</h1>
        <p className="text-muted-foreground">
          Interactive visualization of test generation metrics across LLMs, strategies, and configurations
        </p>
      </div>

      {/* Sticky Filters Section */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-4 space-y-4">
          {/* Filters */}
          <FilterPanel />

          {/* Metric View Toggle */}
          <MetricViewToggle />
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Metrics Explanation */}
        <MetricsExplanation metricView={filters.metricView} />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading data...</div>
          </div>
        )}

        {/* Analytics View - Test Set Metrics */}
        {!loading && isTestSetView && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <SummaryCards
              data={{
                testSet: testSetData,
                testCase: []
              }}
            />

            {/* Degradation Metrics */}
            {degradationMetrics && (
              <DegradationCards
                degradation={degradationMetrics}
                viewMode="test-set"
              />
            )}

            {/* LLM Comparison Chart - CSR, RSR, SVR */}
            <LLMComparisonChart data={llmComparison} viewMode="test-set" />

            {/* Two-column grid for complexity and test type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplexityTrendChart
                data={complexityData}
                viewMode="test-set"
                selectedComplexity={filters.complexity}
              />
              <TestTypeChart data={testTypeData} viewMode="test-set" />
            </div>

            {/* Prompt Strategy Chart - CSR, RSR, SVR */}
            <PromptStrategyChart data={promptData} metricView="test-set" />
          </div>
        )}

        {/* Analytics View - Test Case Metrics */}
        {!loading && !isTestSetView && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <SummaryCards
              data={{
                testSet: [],
                testCase: testCaseData
              }}
            />

            {/* Degradation Metrics */}
            {degradationMetrics && (
              <DegradationCards
                degradation={degradationMetrics}
                viewMode="test-case"
              />
            )}

            {/* LLM Comparison Chart - FC% only */}
            <LLMComparisonChart data={llmComparison} viewMode="test-case" />

            {/* Coverage-FC Gap Chart - Highlight the key finding */}
            <CoverageFCGapChart data={llmComparison} />

            {/* Two-column grid for complexity and test type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplexityTrendChart
                data={complexityData}
                viewMode="test-case"
                selectedComplexity={filters.complexity}
              />
              <TestTypeChart data={testTypeData} viewMode="test-case" />
            </div>

            {/* Prompt Strategy Chart - FC% only */}
            <PromptStrategyChart data={promptData} metricView="test-case" />

            {/* Performance Heatmap - FC% across LLM × Test Type */}
            <PerformanceHeatmap data={heatmapData} />
          </div>
        )}

      </main>
    </div>
  );
}
