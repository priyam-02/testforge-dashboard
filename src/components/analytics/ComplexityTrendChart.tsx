'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { PERFORMANCE_COLORS } from '@/config/constants';
import type { AggregatedByComplexity, Complexity } from '@/types/metrics';

interface ComplexityTrendChartProps {
  data: AggregatedByComplexity[];
  title?: string;
  viewMode?: 'test-set' | 'test-case';
  selectedComplexity?: Complexity | null;
}

export function ComplexityTrendChart({
  data,
  title = 'Performance by Complexity Level',
  viewMode = 'test-set',
  selectedComplexity = null
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
    <Card className="p-6 bg-gradient-to-br from-white via-violet-50/30 to-purple-50/20 dark:from-gray-950 dark:via-violet-950/20 dark:to-purple-950/10 border-violet-200/50 dark:border-violet-800/30 shadow-lg">
      <div className="mb-8">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
          Performance metrics across problem complexity levels
        </p>
      </div>
      <ResponsiveContainer width="100%" height={440}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {/* Gradients for area fills under lines */}
            <linearGradient id="csrLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PERFORMANCE_COLORS.CSR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PERFORMANCE_COLORS.CSR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rsrLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PERFORMANCE_COLORS.RSR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PERFORMANCE_COLORS.RSR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="svrLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PERFORMANCE_COLORS.SVR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PERFORMANCE_COLORS.SVR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fcLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PERFORMANCE_COLORS.FC} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PERFORMANCE_COLORS.FC} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="coverageLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PERFORMANCE_COLORS.Coverage} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PERFORMANCE_COLORS.Coverage} stopOpacity={0} />
            </linearGradient>
            {/* Glow effect for dots */}
            <filter id="glow-complexity" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#cbd5e1"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
            tickLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
          />
          <YAxis
            label={{
              value: 'Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#475569', fontWeight: 700, fontSize: 14 }
            }}
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
            tickLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `Complexity: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{
              color: '#f1f5f9',
              fontWeight: 700,
              marginBottom: '8px',
              fontSize: '14px',
            }}
            itemStyle={{
              color: '#e2e8f0',
              fontSize: '13px',
              fontWeight: 500,
            }}
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)', strokeDasharray: '5 5' }}
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
                  r: 6,
                  fill: PERFORMANCE_COLORS.CSR,
                  strokeWidth: 3,
                  stroke: '#fff',
                  filter: 'url(#glow-complexity)'
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="CSR (%)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="RSR"
                stroke={PERFORMANCE_COLORS.RSR}
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: PERFORMANCE_COLORS.RSR,
                  strokeWidth: 3,
                  stroke: '#fff',
                  filter: 'url(#glow-complexity)'
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="RSR (%)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="SVR"
                stroke={PERFORMANCE_COLORS.SVR}
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: PERFORMANCE_COLORS.SVR,
                  strokeWidth: 3,
                  stroke: '#fff',
                  filter: 'url(#glow-complexity)'
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="SVR (%)"
                animationDuration={800}
                animationEasing="ease-in-out"
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
                  r: 6,
                  fill: PERFORMANCE_COLORS.FC,
                  strokeWidth: 3,
                  stroke: '#fff',
                  filter: 'url(#glow-complexity)'
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="FC%"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="Coverage"
                stroke={PERFORMANCE_COLORS.Coverage}
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: PERFORMANCE_COLORS.Coverage,
                  strokeWidth: 3,
                  stroke: '#fff',
                  filter: 'url(#glow-complexity)'
                }}
                activeDot={{ r: 8, strokeWidth: 3 }}
                name="Coverage (%)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
