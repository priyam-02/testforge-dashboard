'use client';

import { Card } from '@/components/ui/card';
import type { TestSetMetrics, TestCaseMetrics } from '@/types/metrics';
import { calculateSummaryMetrics } from '@/lib/data/aggregate-metrics';

interface OutcomePerformanceSummaryCardsProps {
  testSetData: TestSetMetrics[];
  testCaseData: TestCaseMetrics[];
}

export function OutcomePerformanceSummaryCards({
  testSetData,
  testCaseData,
}: OutcomePerformanceSummaryCardsProps) {
  // Calculate summary metrics
  const metrics = calculateSummaryMetrics(testSetData, testCaseData);

  return (
    <Card className="p-6 border-2 border-outcome-O4 bg-outcome-O4/10">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        FC%: Functional Correctness
      </h3>
      <p className="text-3xl font-bold font-mono text-outcome-O4">
        {metrics.avgFC.toFixed(2)}%
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Test pass rate
      </p>
    </Card>
  );
}
