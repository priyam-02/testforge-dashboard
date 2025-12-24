'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { OUTCOME_COLORS } from '@/config/constants';
import type { OutcomeMetrics } from '@/types/metrics';

interface OutcomeStackedBarChartProps {
  data: OutcomeMetrics[];
  title?: string;
}

export function OutcomeStackedBarChart({
  data,
  title = 'Outcome Distribution by LLM',
}: OutcomeStackedBarChartProps) {
  // Transform data for stacked bar chart
  const chartData = data.map((row) => ({
    name: row.llm,
    O1: Number(row.O1_percentage) || 0,
    O2: Number(row.O2_percentage) || 0,
    O3: Number(row.O3_percentage) || 0,
    O4: Number(row.O4_percentage) || 0,
    total: row.total_expected,
  }));


  // Custom tooltip to show percentages and counts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#181D2B] border border-[#222736] rounded-lg p-4 shadow-lg">
          <p className="text-foreground font-semibold mb-2">{label}</p>
          <p className="text-xs text-muted-foreground mb-2">
            Total: {data.total.toLocaleString()} test suites
          </p>
          <div className="space-y-1">
            {payload.map((entry: any) => (
              <div key={entry.dataKey} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-foreground">{entry.dataKey}:</span>
                </div>
                <span className="text-sm font-mono text-foreground">
                  {entry.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-[#222736]">
            <span className="text-xs text-muted-foreground">
              Sum: {(data.O1 + data.O2 + data.O3 + data.O4).toFixed(2)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Note: Bars with 0.00% values are not visible but shown in tooltip
        </p>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          maxBarSize={80}
        >
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#475569"
            opacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#A6AEC8', fontSize: 12 }}
            axisLine={{ stroke: '#222736' }}
            tickLine={{ stroke: '#222736' }}
          />
          <YAxis
            label={{
              value: 'Percentage (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#A6AEC8', fontWeight: 600, fontSize: 13 },
            }}
            domain={[0, 100]}
            tick={{ fill: '#A6AEC8', fontSize: 12 }}
            axisLine={{ stroke: '#222736' }}
            tickLine={{ stroke: '#222736' }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 39, 54, 0.2)' }} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: 600,
            }}
            iconType="rect"
            iconSize={14}
          />
          <Bar
            dataKey="O1"
            stackId="a"
            fill={OUTCOME_COLORS.O1}
            name="O1: Fails to Compile"
            stroke={OUTCOME_COLORS.O1}
            strokeWidth={1}
          />
          <Bar
            dataKey="O2"
            stackId="a"
            fill={OUTCOME_COLORS.O2}
            name="O2: Runtime Failure"
            stroke={OUTCOME_COLORS.O2}
            strokeWidth={1}
          />
          <Bar
            dataKey="O3"
            stackId="a"
            fill={OUTCOME_COLORS.O3}
            name="O3: Semantically Invalid"
            stroke={OUTCOME_COLORS.O3}
            strokeWidth={1}
          />
          <Bar
            dataKey="O4"
            stackId="a"
            fill={OUTCOME_COLORS.O4}
            name="O4: Valid"
            radius={[8, 8, 0, 0]}
            stroke={OUTCOME_COLORS.O4}
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
