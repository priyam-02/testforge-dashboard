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
import { OUTCOME_COLORS } from "@/config/constants";
import type { AggregatedOutcomesByComplexity } from "@/types/metrics";

interface OutcomeComplexityChartProps {
  data: AggregatedOutcomesByComplexity[];
  title?: string;
}

export function OutcomeComplexityChart({
  data,
  title = "Outcome Trends Across Complexity",
}: OutcomeComplexityChartProps) {
  const chartData = data.map((row) => ({
    complexity: row.complexity,
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
          How outcome distribution changes as problems get harder
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
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
              value: "Percentage (%)",
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
              fontSize: "14px",
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="O4"
            stroke={OUTCOME_COLORS.O4}
            strokeWidth={3}
            name="O4: Valid"
            dot={{ r: 5, fill: OUTCOME_COLORS.O4 }}
          />
          <Line
            type="monotone"
            dataKey="O3"
            stroke={OUTCOME_COLORS.O3}
            strokeWidth={3}
            name="O3: Invalid"
            dot={{ r: 5, fill: OUTCOME_COLORS.O3 }}
          />
          <Line
            type="monotone"
            dataKey="O2"
            stroke={OUTCOME_COLORS.O2}
            strokeWidth={3}
            name="O2: Runtime"
            dot={{ r: 5, fill: OUTCOME_COLORS.O2 }}
          />
          <Line
            type="monotone"
            dataKey="O1"
            stroke={OUTCOME_COLORS.O1}
            strokeWidth={3}
            name="O1: Compile"
            dot={{ r: 5, fill: OUTCOME_COLORS.O1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
