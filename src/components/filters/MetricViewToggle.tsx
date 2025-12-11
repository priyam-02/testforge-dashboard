'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFilters } from '@/hooks/useFilters';
import type { MetricView } from '@/types/metrics';

export function MetricViewToggle() {
  const { metricView, setMetricView } = useFilters();

  return (
    <div className="flex items-center justify-center mb-6">
      <Tabs
        value={metricView}
        onValueChange={(value) => setMetricView(value as MetricView)}
        className="w-full max-w-md"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test-set">Test Set Metrics</TabsTrigger>
          <TabsTrigger value="test-case">Test Case Metrics</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
