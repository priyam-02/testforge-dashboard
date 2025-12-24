'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { PERFORMANCE_COLORS } from '@/config/constants';
import type { AggregatedByComplexity } from '@/types/metrics';

interface ComplexityTrendChartProps {
  data: AggregatedByComplexity[];
  title?: string;
  viewMode?: 'test-set' | 'test-case';
}

export function ComplexityTrendChart({
  data,
  title = 'Performance by Complexity Level',
  viewMode = 'test-set',
}: ComplexityTrendChartProps) {
  // Define all possible complexity levels
  const allComplexities = ['Easy', 'Moderate', 'Hard'];

  // Create data points with absolute values
  const chartData = allComplexities.map((complexity) => {
    // Find data for this complexity level
    const complexityData = data.find((row) => row.complexity === complexity);

    if (!complexityData) {
      // No data for this complexity level
      return {
        name: complexity,
        CSR: 0,
        RSR: 0,
        SVR: 0,
        'FC%': 0,
        Coverage: 0,
      };
    }

    return {
      name: complexity,
      CSR: complexityData.csr_percentage,
      RSR: complexityData.rsr_percentage,
      SVR: complexityData.svr_percentage,
      'FC%': complexityData.fc_percentage,
      Coverage: complexityData.avg_line_coverage,
    };
  });

  return (
    <Card className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Performance metrics across problem complexity levels
        </p>
      </div>
      <ResponsiveContainer width="100%" height={440}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs></defs>
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#475569"
            opacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#A6AEC8', fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: '#222736', strokeWidth: 1 }}
            tickLine={{ stroke: '#222736', strokeWidth: 1 }}
          />
          <YAxis
            label={{
              value: 'Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#A6AEC8', fontWeight: 600, fontSize: 13 }
            }}
            domain={[0, 100]}
            tick={{ fill: '#A6AEC8', fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: '#222736', strokeWidth: 1 }}
            tickLine={{ stroke: '#222736', strokeWidth: 1 }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `Complexity: ${label}`}
            contentStyle={{
              backgroundColor: '#181D2B',
              border: '1px solid #222736',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{
              color: '#F7F8FF',
              fontWeight: 600,
              marginBottom: '8px',
              fontSize: '13px',
            }}
            itemStyle={{
              color: '#A6AEC8',
              fontSize: '12px',
              fontWeight: 500,
            }}
            cursor={{ fill: 'rgba(34, 39, 54, 0.3)' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '25px',
              fontSize: '14px',
              fontWeight: 600,
            }}
            iconType="circle"
            iconSize={12}
          />
          {viewMode === 'test-set' ? (
            <>
              <Line
                type="monotone"
                dataKey="CSR"
                stroke={PERFORMANCE_COLORS.CSR}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: PERFORMANCE_COLORS.CSR,
                  strokeWidth: 2,
                  stroke: '#050711'
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="CSR (%)"
                animationDuration={250}
              />
              <Line
                type="monotone"
                dataKey="RSR"
                stroke={PERFORMANCE_COLORS.RSR}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: PERFORMANCE_COLORS.RSR,
                  strokeWidth: 2,
                  stroke: '#050711'
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="RSR (%)"
                animationDuration={250}
              />
              <Line
                type="monotone"
                dataKey="SVR"
                stroke={PERFORMANCE_COLORS.SVR}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: PERFORMANCE_COLORS.SVR,
                  strokeWidth: 2,
                  stroke: '#050711'
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="SVR (%)"
                animationDuration={250}
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="FC%"
                stroke={PERFORMANCE_COLORS.FC}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: PERFORMANCE_COLORS.FC,
                  strokeWidth: 2,
                  stroke: '#050711'
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="FC%"
                animationDuration={250}
              />
              <Line
                type="monotone"
                dataKey="Coverage"
                stroke={PERFORMANCE_COLORS.Coverage}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: PERFORMANCE_COLORS.Coverage,
                  strokeWidth: 2,
                  stroke: '#050711'
                }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Coverage (%)"
                animationDuration={250}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
