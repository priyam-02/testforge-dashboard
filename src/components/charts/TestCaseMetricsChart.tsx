'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import type { TestCaseMetrics } from '@/types/metrics';

interface TestCaseMetricsChartProps {
  data: TestCaseMetrics[];
  title: string;
}

export function TestCaseMetricsChart({ data, title }: TestCaseMetricsChartProps) {
  // Prepare chart data
  const chartData = data.map((row) => ({
    name: row.llm,
    FC: row.fc_percentage,
    Coverage: row.avg_line_coverage,
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar dataKey="FC" fill="#8b5cf6" name="Functional Correctness" />
          <Bar dataKey="Coverage" fill="#ec4899" name="Line Coverage" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
