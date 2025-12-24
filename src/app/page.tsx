"use client";

import { useEffect, useState } from "react";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { MetricViewToggle } from "@/components/filters/MetricViewToggle";
import { SummaryCards } from "@/components/analytics/SummaryCards";
import { LLMComparisonChart } from "@/components/analytics/LLMComparisonChart";
import { ComplexityTrendChart } from "@/components/analytics/ComplexityTrendChart";
import { TestTypeChart } from "@/components/analytics/TestTypeChart";
import { PromptStrategyChart } from "@/components/analytics/PromptStrategyChart";
import { PerformanceGroupedBarChart } from "@/components/analytics/PerformanceGroupedBarChart";
import { DegradationCards } from "@/components/analytics/DegradationCards";
import { CoverageFCGapChart } from "@/components/analytics/CoverageFCGapChart";
import { useFilters } from "@/hooks/useFilters";
import {
  filterTestSetMetrics,
  filterTestCaseMetrics,
} from "@/lib/data/filter-data";
import {
  combineMetricsByLLM,
  aggregateByComplexity,
  aggregateByTestType,
  aggregateByPrompt,
  transformToHeatmap,
  calculateDegradationMetrics,
  calculateOutcomeMetrics,
  aggregateO4ByLLMAndComplexity,
  aggregateFCCoverageByLLMAndComplexity,
  aggregateO4ByLLMAndPrompt,
  aggregateFCByLLMAndPrompt,
  aggregateO4ByLLMAndTestType,
} from "@/lib/data/aggregate-metrics";
import type { TestSetMetrics, TestCaseMetrics } from "@/types/metrics";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Database, ExternalLink } from "lucide-react";
import { OutcomeSummaryCards } from "@/components/analytics/OutcomeSummaryCards";
import { OutcomeStackedBarChart } from "@/components/charts/OutcomeStackedBarChart";
import { OutcomeLLMComplexityChart } from "@/components/charts/OutcomeLLMComplexityChart";
import { FCCoverageLLMComplexityChart } from "@/components/charts/FCCoverageLLMComplexityChart";
import { OutcomeLLMPromptChart } from "@/components/charts/OutcomeLLMPromptChart";
import { FCLLMPromptChart } from "@/components/charts/FCLLMPromptChart";
import { OutcomeLLMTestTypeChart } from "@/components/charts/OutcomeLLMTestTypeChart";

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
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isMounted]);

  // Filter data client-side when filters change (instant transitions!)
  // Add guards to prevent errors during initial render
  const testSetData =
    rawTestSetData && rawTestSetData.length > 0
      ? filterTestSetMetrics(rawTestSetData, filters)
      : [];
  const testCaseData =
    rawTestCaseData && rawTestCaseData.length > 0
      ? filterTestCaseMetrics(rawTestCaseData, filters)
      : [];

  // Calculate aggregated data for analytics view based on metric view
  // For test-set view, use empty test case data; for test-case view, use empty test set data
  const isTestSetView = filters.metricView === "test-set";
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

  // Calculate outcome metrics (O1-O4) for outcomes view
  const isOutcomesView = filters.metricView === "outcomes";
  const outcomeMetrics = isOutcomesView ? calculateOutcomeMetrics(testSetData) : [];
  const outcomesO4ByLLMComplexity = isOutcomesView
    ? aggregateO4ByLLMAndComplexity(testSetData)
    : [];
  const fcCoverageByLLMComplexity = isOutcomesView
    ? aggregateFCCoverageByLLMAndComplexity(testCaseData)
    : [];
  const outcomesO4ByLLMPrompt = isOutcomesView
    ? aggregateO4ByLLMAndPrompt(testSetData)
    : [];
  const fcByLLMPrompt = isOutcomesView
    ? aggregateFCByLLMAndPrompt(testCaseData)
    : [];
  const outcomesO4ByLLMTestType = isOutcomesView
    ? aggregateO4ByLLMAndTestType(testSetData)
    : [];

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
      {/* Header Section - Static */}
      <div className="max-w-7xl mx-auto px-8 pt-8 pb-4">
        <Card className="p-6">
          <div className="text-start">
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              TestForge: Benchmarking LLM-Based Test Case Generation
            </h1>

            {/* Action Buttons and Authors */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href="https://conf.researchr.org/details/saner-2026/saner-2026-papers/38/TestForge-A-Benchmarking-Framework-for-LLM-Based-Test-Case-Generation"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="w-4 h-4" />
                  Abstract
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a
                  href="https://figshare.com/s/a6b69b07e8fa134acb39?file=59094464"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Database className="w-4 h-4" />
                  Raw Data
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex flex-wrap items-center gap-2 text-base">
                <span className="text-muted-foreground font-small">
                  Authors:
                </span>
                <a
                  href="https://mpvieira.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-small inline-flex items-center gap-1"
                >
                  Marco Vieira
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-muted-foreground">·</span>
                <a
                  href="https://www.linkedin.com/in/priyamshahh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-small inline-flex items-center gap-1"
                >
                  Priyam Shah
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-muted-foreground">·</span>
                <a
                  href="https://www.linkedin.com/in/bhavainshah/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-small inline-flex items-center gap-1"
                >
                  Bhavain Shah
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-muted-foreground">·</span>
                <a
                  href="https://www.linkedin.com/in/vineetkhadloya/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-small inline-flex items-center gap-1"
                >
                  Vineet Khadloya
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Separator Line */}
            <div className="border-t border-border my-4" />

            {/* Description */}
            <p className="text-base leading-relaxed text-muted-foreground">
              This dashboard presents an interactive exploration of{" "}
              <strong className="text-foreground">TestForge</strong>, an
              extensible framework for evaluating LLM performance in automated
              test case generation. Leveraging the IBM CodeNet Project dataset,
              we assess test quality through compilation success, runtime
              reliability, and semantic validity. Use the filters below to
              explore how different models, prompting strategies, test types
              (Standard, Boundary, Mixed), and problem complexities impact
              generation success for Java programs.
            </p>
          </div>
        </Card>
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
                testCase: [],
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
        {!loading && !isTestSetView && !isOutcomesView && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <SummaryCards
              data={{
                testSet: [],
                testCase: testCaseData,
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

            {/* Performance Comparison - FC% across LLM × Test Type */}
            <PerformanceGroupedBarChart data={heatmapData} />
          </div>
        )}

        {/* Analytics View - Outcomes Metrics (O1-O4) */}
        {!loading && isOutcomesView && (
          <div className="space-y-6">
            {/* Summary Cards showing O1-O4 distribution and FC% */}
            <OutcomeSummaryCards data={testSetData} testCaseData={testCaseData} />

            {/* Section Header: LLM Performance Comparison */}
            <div className="pt-4">
              <Card className="p-6 mb-6 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-transparent">
                <p className="text-base text-foreground leading-relaxed">
                  <span className="font-semibold text-cyan-400">How to interpret LLM performance:</span> Of all generated test suites, the left graph shows outcomes O1 to O4, of which O4 (valid suite) means they compile, run, and are semantically correct. Among these valid suites, the average functional correctness is shown in the right graph.
                </p>
              </Card>
            </div>

            {/* Paired: O1-O4 per LLM | FC% per LLM */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OutcomeStackedBarChart data={outcomeMetrics} title="O1 to O4 classification" />
              <LLMComparisonChart
                data={combineMetricsByLLM([], testCaseData)}
                title="Functional Correctness/Coverage"
                viewMode="test-case"
              />
            </div>

            {/* Section Header: Complexity Analysis */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                LLM × Complexity
              </h2>
            </div>

            {/* Paired: O1-O4 by Complexity | FC% by Complexity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OutcomeLLMComplexityChart data={outcomesO4ByLLMComplexity} title="Valid test suite rates (O4)" />
              <FCCoverageLLMComplexityChart data={fcCoverageByLLMComplexity} title="Functional correctness rates" />
            </div>

            {/* Section Header: LLM × Prompt Strategy */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                LLM × Prompt Strategy
              </h2>
            </div>

            {/* Paired: O1-O4 by Prompt | FC% by Prompt */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OutcomeLLMPromptChart data={outcomesO4ByLLMPrompt} />
              <FCLLMPromptChart data={fcByLLMPrompt} />
            </div>

            {/* Section Header: LLM × Test Type */}
            <div className="pt-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                LLM × Test Type
              </h2>
            </div>

            {/* Paired: O4 by LLM×TestType | FC% Comparison */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <OutcomeLLMTestTypeChart data={outcomesO4ByLLMTestType} />
              <PerformanceGroupedBarChart data={transformToHeatmap(testCaseData)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
