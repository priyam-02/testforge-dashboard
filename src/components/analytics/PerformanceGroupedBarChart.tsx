"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { HeatmapData } from "@/types/metrics";

interface PerformanceGroupedBarChartProps {
  data: HeatmapData[];
  title?: string;
}

export function PerformanceGroupedBarChart({
  data,
  title = "Functional correctness rates",
}: PerformanceGroupedBarChartProps) {
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

  // Transform data for line chart - each test type is a point
  const chartData = testTypes.map((testType) => {
    const point: Record<string, string | number> = {
      testType: formatTestType(testType),
    };
    llms.forEach((llm) => {
      point[llm] = dataMap.get(`${llm}__${testType}`) || 0;
    });
    return point;
  });

  // LLM-specific color mapping (matching other charts)
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
          Across test type for each LLM
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {/* Create gradient definitions for each LLM */}
            {llms.map((llm, index) => {
              const color = getLLMColor(llm, index);
              return (
                <linearGradient
                  key={`gradient-fc-testtype-${llm}`}
                  id={`gradient-fc-testtype-${llm}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#475569"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="testType"
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
          {llms.map((llm, index) => {
            const color = getLLMColor(llm, index);
            return (
              <Line
                key={llm}
                type="monotoneX"
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
