'use client';

import { useEffect, useState } from 'react';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { MetricViewToggle } from '@/components/filters/MetricViewToggle';
import { TestSetMetricsChart } from '@/components/charts/TestSetMetricsChart';
import { TestCaseMetricsChart } from '@/components/charts/TestCaseMetricsChart';
import { TestSetMetricsTable } from '@/components/tables/TestSetMetricsTable';
import { TestCaseMetricsTable } from '@/components/tables/TestCaseMetricsTable';
import { useFilters } from '@/hooks/useFilters';
import { filterTestSetMetrics, filterTestCaseMetrics, determineAggregationLevel } from '@/lib/data/filter-data';
import type { TestSetMetrics, TestCaseMetrics } from '@/types/metrics';

export default function Home() {
  const filters = useFilters();
  const [testSetData, setTestSetData] = useState<TestSetMetrics[]>([]);
  const [testCaseData, setTestCaseData] = useState<TestCaseMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const aggregation = determineAggregationLevel(filters);

        // Load data from API routes (we'll create these)
        const [testSetRes, testCaseRes] = await Promise.all([
          fetch(`/api/test-set-metrics/${aggregation}`),
          fetch(`/api/test-case-metrics/${aggregation}`),
        ]);

        const testSetJson = await testSetRes.json();
        const testCaseJson = await testCaseRes.json();

        // Filter the data based on active filters
        const filteredTestSet = filterTestSetMetrics(testSetJson.data, filters);
        const filteredTestCase = filterTestCaseMetrics(testCaseJson.data, filters);

        setTestSetData(filteredTestSet);
        setTestCaseData(filteredTestCase);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters.llm, filters.promptStrategy, filters.complexity, filters.testType]);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">TestForge Benchmark Dashboard</h1>
          <p className="text-muted-foreground">
            Interactive visualization of test generation metrics across LLMs, strategies, and configurations
          </p>
        </div>

        {/* Filters */}
        <FilterPanel />

        {/* Metric View Toggle */}
        <MetricViewToggle />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-muted-foreground">Loading data...</div>
          </div>
        )}

        {/* Test Set Metrics View */}
        {!loading && filters.metricView === 'test-set' && (
          <div className="space-y-6">
            <TestSetMetricsChart
              data={testSetData}
              title="Test Set Metrics Comparison"
            />
            <TestSetMetricsTable data={testSetData} />
          </div>
        )}

        {/* Test Case Metrics View */}
        {!loading && filters.metricView === 'test-case' && (
          <div className="space-y-6">
            <TestCaseMetricsChart
              data={testCaseData}
              title="Test Case Metrics Comparison"
            />
            <TestCaseMetricsTable data={testCaseData} />
          </div>
        )}

        {/* Data Summary */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Filters</h3>
              <p className="text-2xl font-bold">
                {filters.hasActiveFilters() ? 'Filtered' : 'All Data'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Configurations</h3>
              <p className="text-2xl font-bold">
                {filters.metricView === 'test-set' ? testSetData.length : testCaseData.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Metric View</h3>
              <p className="text-2xl font-bold">
                {filters.metricView === 'test-set' ? 'Test Sets' : 'Test Cases'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
