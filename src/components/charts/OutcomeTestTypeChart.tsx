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
import type { AggregatedOutcomesByTestType } from '@/types/metrics';

interface OutcomeTestTypeChartProps {
  data: AggregatedOutcomesByTestType[];
  title?: string;
}

export function OutcomeTestTypeChart({
  data,
  title = 'Outcomes by Test Type',
}: OutcomeTestTypeChartProps) {
  // Transform data for chart
  const chartData = data.map((row) => ({
    testType: row.test_type === 'standard' ? 'Standard' :
              row.test_type === 'boundary' ? 'Boundary' : 'Mixed',
    O1: row.O1_percentage,
    O2: row.O2_percentage,
    O3: row.O3_percentage,
    O4: row.O4_percentage,
  }));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Outcome distribution comparison across test types (horizontal grouped bars)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#475569"
            opacity={0.6}
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#A6AEC8', fontSize: 12 }}
            axisLine={{ stroke: '#222736' }}
            tickLine={{ stroke: '#222736' }}
            label={{
              value: 'Percentage (%)',
              position: 'insideBottom',
              offset: -10,
              style: { fill: '#A6AEC8', fontWeight: 600, fontSize: 13 },
            }}
          />
          <YAxis
            type="category"
            dataKey="testType"
            tick={{ fill: '#A6AEC8', fontSize: 12 }}
            axisLine={{ stroke: '#222736' }}
            tickLine={{ stroke: '#222736' }}
            width={90}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: 'rgba(24, 29, 43, 0.95)',
              border: '1px solid #222736',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#F7F8FF', fontWeight: 600 }}
            itemStyle={{ color: '#A6AEC8' }}
          />
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
            dataKey="O4"
            fill={OUTCOME_COLORS.O4}
            name="O4: Valid"
            radius={[0, 8, 8, 0]}
            stroke={OUTCOME_COLORS.O4}
            strokeWidth={1}
          />
          <Bar
            dataKey="O3"
            fill={OUTCOME_COLORS.O3}
            name="O3: Invalid"
            radius={[0, 8, 8, 0]}
            stroke={OUTCOME_COLORS.O3}
            strokeWidth={1}
          />
          <Bar
            dataKey="O2"
            fill={OUTCOME_COLORS.O2}
            name="O2: Runtime"
            radius={[0, 8, 8, 0]}
            stroke={OUTCOME_COLORS.O2}
            strokeWidth={1}
          />
          <Bar
            dataKey="O1"
            fill={OUTCOME_COLORS.O1}
            name="O1: Compile"
            radius={[0, 8, 8, 0]}
            stroke={OUTCOME_COLORS.O1}
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
