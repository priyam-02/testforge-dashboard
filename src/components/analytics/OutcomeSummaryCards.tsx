'use client';

import { Card } from '@/components/ui/card';
import type { TestSetMetrics, TestCaseMetrics } from '@/types/metrics';
import { calculateSummaryMetrics } from '@/lib/data/aggregate-metrics';
import { Info } from 'lucide-react';

interface OutcomeSummaryCardsProps {
  data: TestSetMetrics[];
  testCaseData?: TestCaseMetrics[];
}

export function OutcomeSummaryCards({ data, testCaseData = [] }: OutcomeSummaryCardsProps) {
  const metrics = calculateSummaryMetrics(data, testCaseData);

  const cards = [
    {
      label: 'O1: Fails to Compile',
      value: `${metrics.avgO1.toFixed(2)}%`,
      subtitle: 'Cannot be executed',
      color: 'text-outcome-O1',
      bgColor: 'bg-outcome-O1/10',
      borderColor: 'border-outcome-O1',
    },
    {
      label: 'O2: Runtime Failure',
      value: `${metrics.avgO2.toFixed(2)}%`,
      subtitle: 'Compiles but crashes',
      color: 'text-outcome-O2',
      bgColor: 'bg-outcome-O2/10',
      borderColor: 'border-outcome-O2',
    },
    {
      label: 'O3: Semantically Invalid',
      value: `${metrics.avgO3.toFixed(2)}%`,
      subtitle: 'Runs but incorrect',
      color: 'text-outcome-O3',
      bgColor: 'bg-outcome-O3/10',
      borderColor: 'border-outcome-O3',
    },
    {
      label: 'O4: Valid Suite',
      value: `${metrics.avgO4.toFixed(2)}%`,
      subtitle: 'Fully functional',
      color: 'text-outcome-O4',
      bgColor: 'bg-outcome-O4/10',
      borderColor: 'border-outcome-O4',
    },
    {
      label: 'FC%: Functional Correctness',
      value: `${metrics.avgFC.toFixed(2)}%`,
      subtitle: 'Test pass rate',
      color: 'text-[#597EF7]',
      bgColor: 'bg-[#597EF7]/10',
      borderColor: 'border-[#597EF7]',
    },
  ];

  // Calculate total test cases from testCaseData
  const totalTestCases = testCaseData.reduce((sum, row) => sum + row.total_test_cases, 0);

  const additionalCards = [
    {
      label: 'Total Tests',
      value: metrics.totalTests.toLocaleString(),
      subtitle: 'Test suites generated',
      color: 'text-[#52C41A]',
      bgColor: 'bg-[#52C41A]/10',
      borderColor: 'border-[#52C41A]',
    },
    {
      label: 'Total Test Cases',
      value: totalTestCases.toLocaleString(),
      subtitle: 'Individual test cases',
      color: 'text-[#FF7A45]',
      bgColor: 'bg-[#FF7A45]/10',
      borderColor: 'border-[#FF7A45]',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Outcome cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <Card
            key={index}
            className={`p-6 border-2 ${card.borderColor} ${card.bgColor}`}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {card.label}
            </h3>
            <p className={`text-3xl font-bold font-mono ${card.color}`}>
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtitle}
            </p>
          </Card>
        ))}
      </div>

      {/* Additional cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {additionalCards.map((card, index) => (
          <Card
            key={index}
            className={`p-6 border-2 ${card.borderColor} ${card.bgColor}`}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {card.label}
            </h3>
            <p className={`text-3xl font-bold font-mono ${card.color}`}>
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtitle}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
