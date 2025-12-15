"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { HeatmapData } from "@/types/metrics";

interface PerformanceHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

export function PerformanceHeatmap({
  data,
  title = "LLM × Test Type Performance",
}: PerformanceHeatmapProps) {
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
    const point: Record<string, string | number> = {
      testType: formatTestType(testType),
    };
    llms.forEach((llm) => {
      point[llm] = dataMap.get(`${llm}__${testType}`) || 0;
    });
    return point;
  });

  // LLM colors - vibrant, modern palette for performance heatmap
  const colors = [
    "#00D9FF", // Cyan (Llama - bright electric cyan)
    "#FFB800", // Amber (Qwen2.5-coder - golden yellow)
    "#FF3D71", // Coral Red (Qwen3:4b - vibrant coral)
    "#7C3AED", // Vivid Purple (Qwen3:32b - rich violet)
  ];

  return (
    <Card className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
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
          <defs></defs>
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#475569"
            opacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="testType"
            tick={{ fill: "#A6AEC8", fontSize: 13, fontWeight: 600 }}
            angle={-35}
            textAnchor="end"
            height={90}
            axisLine={{ stroke: "#222736", strokeWidth: 1 }}
            tickLine={{ stroke: "#222736", strokeWidth: 1 }}
          />
          <YAxis
            label={{
              value: "FC% Rate",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#A6AEC8", fontWeight: 600, fontSize: 13 },
            }}
            domain={[0, 100]}
            tick={{ fill: "#A6AEC8", fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: "#222736", strokeWidth: 1 }}
            tickLine={{ stroke: "#222736", strokeWidth: 1 }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `Test Type: ${label}`}
            contentStyle={{
              backgroundColor: "#181D2B",
              border: "1px solid #222736",
              borderRadius: "8px",
              padding: "12px",
            }}
            labelStyle={{
              color: "#F7F8FF",
              fontWeight: 600,
              marginBottom: "8px",
              fontSize: "13px",
            }}
            itemStyle={{
              color: "#A6AEC8",
              fontSize: "12px",
              fontWeight: 500,
            }}
            cursor={{ fill: "rgba(34, 39, 54, 0.3)" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "30px",
              fontSize: "14px",
              fontWeight: 600,
            }}
            iconType="circle"
            iconSize={10}
          />
          {llms.map((llm, index) => (
            <Bar
              key={llm}
              dataKey={llm}
              fill={colors[index % colors.length]}
              name={llm}
              radius={[6, 6, 0, 0]}
              animationDuration={250}
              stroke={colors[index % colors.length]}
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
