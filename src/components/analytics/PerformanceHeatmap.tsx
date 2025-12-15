'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import type { HeatmapData } from '@/types/metrics';

interface PerformanceHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

export function PerformanceHeatmap({ data, title = 'LLM × Test Type Performance' }: PerformanceHeatmapProps) {
  // Get unique LLMs and test types
  const llms = Array.from(new Set(data.map((d) => d.llm))).sort();
  const testTypes = Array.from(new Set(data.map((d) => d.test_type))).sort();

  // Create lookup map for quick access
  const dataMap = new Map<string, number>();
  data.forEach((d) => {
    dataMap.set(`${d.llm}__${d.test_type}`, d.value);
  });

  // Format test type labels
  const formatTestType = (testType: string) => {
    return testType.charAt(0).toUpperCase() + testType.slice(1);
  };

  // Transform data for grouped bar chart - each test type is a group
  const chartData = testTypes.map((testType) => {
    const point: Record<string, string | number> = { testType: formatTestType(testType) };
    llms.forEach((llm) => {
      point[llm] = dataMap.get(`${llm}__${testType}`) || 0;
    });
    return point;
  });

  // Gradient color palette for LLMs with unique styling
  const colors = [
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316', // orange
    '#a855f7', // purple
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-slate-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
          Test pass rates (FC%) comparison across LLMs and test types
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 40, bottom: 70, left: 30 }}
          barGap={10}
          barCategoryGap="25%"
        >
          <defs>
            {llms.map((llm, index) => (
              <linearGradient key={`gradient-${llm}`} id={`gradient-${llm}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.95} />
                <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.7} />
              </linearGradient>
            ))}
            {/* Shadow effect for bars */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#cbd5e1"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="testType"
            tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
            angle={-35}
            textAnchor="end"
            height={90}
            axisLine={{ stroke: '#94a3b8', strokeWidth: 2 }}
            tickLine={{ stroke: '#94a3b8', strokeWidth: 1.5 }}
          />
          <YAxis
            label={{
              value: 'FC% Rate',
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
            labelFormatter={(label) => `Test Type: ${label}`}
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
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '30px',
              fontSize: '14px',
              fontWeight: 600,
            }}
            iconType="circle"
            iconSize={10}
          />
          {llms.map((llm, index) => (
            <Bar
              key={llm}
              dataKey={llm}
              fill={`url(#gradient-${llm})`}
              name={llm}
              radius={[10, 10, 0, 0]}
              animationDuration={700}
              animationEasing="ease-out"
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              filter="url(#shadow)"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
