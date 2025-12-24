"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface FCCoverageComplexityDataPoint {
  llm: string;
  complexity: string;
  fc_percentage: number;
  avg_line_coverage: number;
}

interface FCCoverageLLMComplexityChartProps {
  data: FCCoverageComplexityDataPoint[];
  title?: string;
}

export function FCCoverageLLMComplexityChart({
  data,
  title = "LLM × Complexity: FC%",
}: FCCoverageLLMComplexityChartProps) {
  // Get unique LLMs and create lines for each
  const uniqueLLMs = Array.from(new Set(data.map((d) => d.llm))).sort();

  // Group data by complexity
  const complexityGroups = new Map<string, Record<string, string | number>>();

  data.forEach((point) => {
    const complexityKey =
      point.complexity.charAt(0).toUpperCase() + point.complexity.slice(1);

    if (!complexityGroups.has(complexityKey)) {
      complexityGroups.set(complexityKey, { complexity: complexityKey });
    }

    const group = complexityGroups.get(complexityKey)!;
    // Store only FC% for each LLM
    group[point.llm] = point.fc_percentage;
  });

  // Sort by complexity level: Easy -> Moderate -> Hard
  const complexityOrder = ["Easy", "Moderate", "Hard"];
  const chartData = complexityOrder
    .filter((c) => complexityGroups.has(c))
    .map((c) => complexityGroups.get(c)!);

  // LLM-specific color mapping (consistent with O4 charts)
  const llmColorMap: Record<string, string> = {
    "Llama3.3:70b": "#F87171", // Coral Red
    "Qwen2.5-coder:14b": "#FFB84D", // Orange/Gold
    "Qwen3:32b": "#0EA5E9", // Sky Blue
    "Qwen3:4b": "#9F7AEA", // Purple
  };

  // Fallback colors for any additional LLMs
  const fallbackColors = [
    "#36CFC9", // Teal
    "#73D13D", // Green
    "#5CDBD3", // Light teal
  ];

  const getLLMColor = (llm: string, index: number): string => {
    return llmColorMap[llm] || fallbackColors[index % fallbackColors.length];
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Across complexity levels for each LLM
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart
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
            dataKey="complexity"
            tick={{ fill: "#A6AEC8", fontSize: 12 }}
            axisLine={{ stroke: "#222736" }}
            tickLine={{ stroke: "#222736" }}
          />
          <YAxis
            label={{
              value: "FC Percentage (%)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#A6AEC8", fontWeight: 600, fontSize: 13 },
            }}
            domain={[0, 100]}
            tick={{ fill: "#A6AEC8", fontSize: 12 }}
            axisLine={{ stroke: "#222736" }}
            tickLine={{ stroke: "#222736" }}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: "rgba(24, 29, 43, 0.95)",
              border: "1px solid #222736",
              borderRadius: "8px",
              padding: "12px",
            }}
            labelStyle={{ color: "#F7F8FF", fontWeight: 600 }}
            itemStyle={{ color: "#A6AEC8" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "13px",
              fontWeight: 600,
            }}
            iconType="circle"
            iconSize={10}
          />
          {uniqueLLMs.map((llm, index) => {
            const color = getLLMColor(llm, index);
            return (
              <Line
                key={llm}
                type="bumpX"
                dataKey={llm}
                stroke={color}
                name={llm}
                strokeWidth={4}
                strokeDasharray="8 4"
                dot={{
                  fill: color,
                  r: 7,
                  strokeWidth: 3,
                  stroke: "#1a1f2e",
                }}
                activeDot={{
                  r: 10,
                  strokeWidth: 3,
                  stroke: "#FFFFFF",
                  fill: color,
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
