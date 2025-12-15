'use client';

import { Card } from '@/components/ui/card';
import type { TestSetMetrics, TestCaseMetrics } from '@/types/metrics';
import { calculateSummaryMetrics } from '@/lib/data/aggregate-metrics';

interface SummaryCardsProps {
  data: {
    testSet: TestSetMetrics[];
    testCase: TestCaseMetrics[];
  };
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const metrics = calculateSummaryMetrics(data.testSet, data.testCase);

  // Determine which view we're in based on which data is populated
  const isTestSetView = data.testSet.length > 0;
  const isTestCaseView = data.testCase.length > 0;

  // Calculate test case specific totals
  const totalTestCases = data.testCase.reduce((sum, row) => sum + row.total_test_cases, 0);
  const totalFunctionallyCorrect = data.testCase.reduce((sum, row) => sum + row.functionally_correct_cases, 0);

  // Test Set View Cards
  const testSetCards = [
    {
      label: 'Total Tests',
      value: metrics.totalTests.toLocaleString(),
      subtitle: 'Tests expected',
    },
    {
      label: 'Unique Problems',
      value: metrics.uniqueProblems.toLocaleString(),
      subtitle: 'Problems in dataset',
    },
    {
      label: 'CSR',
      value: `${metrics.avgCSR.toFixed(2)}%`,
      subtitle: 'Compile Success Rate',
      color: 'text-red-600',
    },
    {
      label: 'RSR',
      value: `${metrics.avgRSR.toFixed(2)}%`,
      subtitle: 'Runtime Success Rate',
      color: 'text-orange-600',
    },
    {
      label: 'SVR',
      value: `${metrics.avgSVR.toFixed(2)}%`,
      subtitle: 'Semantic Validity Rate',
      color: 'text-yellow-600',
    },
  ];

  // Test Case View Cards
  const testCaseCards = [
    {
      label: 'Total Test Cases',
      value: totalTestCases.toLocaleString(),
      subtitle: 'Test cases generated',
    },
    {
      label: 'Functionally Correct',
      value: totalFunctionallyCorrect.toLocaleString(),
      subtitle: 'Passing test cases',
      color: 'text-green-600',
    },
    {
      label: 'FC%',
      value: `${metrics.avgFC.toFixed(2)}%`,
      subtitle: 'Test Pass Rate',
      color: 'text-green-600',
    },
    {
      label: 'Avg Coverage',
      value: `${metrics.avgCoverage.toFixed(2)}%`,
      subtitle: 'Line coverage',
      color: 'text-blue-600',
    },
    {
      label: 'Unique Problems',
      value: metrics.uniqueProblems.toLocaleString(),
      subtitle: 'Problems in dataset',
    },
  ];

  const cards = isTestCaseView ? testCaseCards : testSetCards;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isTestSetView ? 'lg:grid-cols-5' : 'lg:grid-cols-5'}`}>
      {cards.map((card, index) => (
        <Card key={index} className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            {card.label}
          </h3>
          <p className={`text-2xl font-bold ${card.color || ''}`}>
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {card.subtitle}
          </p>
        </Card>
      ))}
    </div>
  );
}
