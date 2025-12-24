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
import type { AggregatedOutcomesByPrompt } from '@/types/metrics';

interface OutcomePromptStrategyChartProps {
  data: AggregatedOutcomesByPrompt[];
  title?: string;
}

export function OutcomePromptStrategyChart({
  data,
  title = 'Outcomes by Prompt Strategy',
}: OutcomePromptStrategyChartProps) {
  // Create data structure with outcomes as categories (like "FC%" and "Coverage" in screenshot)
  // Each outcome will show bars for the three prompt strategies
  const outcomes = [
    { key: 'O1', label: 'O1: Compile' },
    { key: 'O2', label: 'O2: Runtime' },
    { key: 'O3', label: 'O3: Invalid' },
    { key: 'O4', label: 'O4: Valid' },
  ];

  // Get available prompt strategies from data (respects filtering)
  const availablePrompts = data.map((promptData) =>
    promptData.prompt_type === 'zero_shot' ? 'Zero-Shot' :
    promptData.prompt_type === 'few_shot' ? 'Few-Shot' : 'Chain-of-Thought'
  );

  const chartData = outcomes.map((outcome) => {
    const row: any = { outcome: outcome.label };

    data.forEach((promptData) => {
      const promptLabel = promptData.prompt_type === 'zero_shot' ? 'Zero-Shot' :
                          promptData.prompt_type === 'few_shot' ? 'Few-Shot' : 'Chain-of-Thought';
      row[promptLabel] = promptData[`${outcome.key}_percentage` as keyof typeof promptData] as number;
    });

    return row;
  });

  // Prompt strategy colors (matching the striped bar colors in screenshot)
  const promptColors = {
    'Chain-of-Thought': '#5CDBD3', // Teal/Cyan (striped teal in screenshot)
    'Few-Shot': '#9F7AEA',         // Purple/Blue (striped blue in screenshot)
    'Zero-Shot': '#FFB84D',        // Orange/Gold (striped orange in screenshot)
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Outcome distribution comparison across prompting strategies (grouped by outcome)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={450}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#475569"
            opacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="outcome"
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
              fontSize: '13px',
              fontWeight: 600,
            }}
            iconType="rect"
            iconSize={14}
          />
          {/* Only render bars for prompt strategies present in filtered data */}
          {availablePrompts.includes('Chain-of-Thought') && (
            <Bar
              dataKey="Chain-of-Thought"
              fill={promptColors['Chain-of-Thought']}
              name="Chain-of-Thought"
              radius={[8, 8, 0, 0]}
              stroke={promptColors['Chain-of-Thought']}
              strokeWidth={1}
            />
          )}
          {availablePrompts.includes('Few-Shot') && (
            <Bar
              dataKey="Few-Shot"
              fill={promptColors['Few-Shot']}
              name="Few-Shot"
              radius={[8, 8, 0, 0]}
              stroke={promptColors['Few-Shot']}
              strokeWidth={1}
            />
          )}
          {availablePrompts.includes('Zero-Shot') && (
            <Bar
              dataKey="Zero-Shot"
              fill={promptColors['Zero-Shot']}
              name="Zero-Shot"
              radius={[8, 8, 0, 0]}
              stroke={promptColors['Zero-Shot']}
              strokeWidth={1}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
