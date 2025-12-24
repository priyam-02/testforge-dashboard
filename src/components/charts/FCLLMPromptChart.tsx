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

interface FCLLMPromptDataPoint {
  llm: string;
  prompt_type: string;
  fc_percentage: number;
}

interface FCLLMPromptChartProps {
  data: FCLLMPromptDataPoint[];
  title?: string;
}

export function FCLLMPromptChart({
  data,
  title = "Functional correctness rates",
}: FCLLMPromptChartProps) {
  // Get unique LLMs and create chart data
  const uniqueLLMs = Array.from(new Set(data.map((d) => d.llm))).sort();

  // Group data by prompt type
  const promptGroups = new Map<string, Record<string, string | number>>();

  data.forEach((point) => {
    const promptLabel =
      point.prompt_type === "zero_shot"
        ? "Zero-Shot"
        : point.prompt_type === "few_shot"
          ? "Few-Shot"
          : "Chain-of-Thought";

    if (!promptGroups.has(promptLabel)) {
      promptGroups.set(promptLabel, { prompt: promptLabel });
    }

    const group = promptGroups.get(promptLabel)!;
    group[point.llm] = point.fc_percentage;
  });

  // Sort by prompt strategy order
  const promptOrder = ["Zero-Shot", "Few-Shot", "Chain-of-Thought"];
  const chartData = promptOrder
    .filter((p) => promptGroups.has(p))
    .map((p) => promptGroups.get(p)!);

  // LLM-specific color mapping (consistent with O4 charts)
  const llmColorMap: Record<string, string> = {
    "Llama3.3:70b": "#F87171", // Coral Red
    "Qwen2.5-coder:14b": "#FFB84D", // Orange/Gold
    "Qwen3:32b": "#0EA5E9", // Sky Blue
    "Qwen3:4b": "#9F7AEA", // Purple
  };

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
          Across prompt strategies for each LLM
        </p>
      </div>

      <ResponsiveContainer width="100%" height={450}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {/* Create gradient definitions for each LLM */}
            {uniqueLLMs.map((llm, index) => {
              const color = getLLMColor(llm, index);
              return (
                <linearGradient
                  key={`gradient-${llm}`}
                  id={`gradient-fc-${llm}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#475569"
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="prompt"
            tick={{ fill: "#A6AEC8", fontSize: 12, fontWeight: 500 }}
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
              backgroundColor: "rgba(24, 29, 43, 0.98)",
              border: "2px solid #222736",
              borderRadius: "10px",
              padding: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
            labelStyle={{ color: "#F7F8FF", fontWeight: 700, fontSize: 14 }}
            itemStyle={{ color: "#A6AEC8", fontWeight: 600 }}
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
                type="natural"
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
