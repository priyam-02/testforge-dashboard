'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { getLLMColor } from '@/config/constants';
import type { TestSetMetrics } from '@/types/metrics';

interface TestSetMetricsChartProps {
  data: TestSetMetrics[];
  title: string;
}

export function TestSetMetricsChart({ data, title }: TestSetMetricsChartProps) {
  // Prepare chart data
  const chartData = data.map((row) => ({
    name: row.llm,
    CSR: row.csr_percentage,
    RSR: row.rsr_percentage,
    SVR: row.svr_percentage,
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
          <Bar dataKey="CSR" fill="#3b82f6" name="Compile Success Rate" />
          <Bar dataKey="RSR" fill="#10b981" name="Runtime Success Rate" />
          <Bar dataKey="SVR" fill="#f59e0b" name="Semantic Validity Rate" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
