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
import { PERFORMANCE_COLORS } from "@/config/constants";
import type { CombinedMetrics } from "@/types/metrics";

interface LLMComparisonChartProps {
  data: CombinedMetrics[];
  title?: string;
  viewMode?: "test-set" | "test-case";
}

export function LLMComparisonChart({
  data,
  title = "LLM Performance Comparison",
  viewMode = "test-set",
}: LLMComparisonChartProps) {
  const chartData = data.map((row) => ({
    name: row.llm,
    CSR: row.csr_percentage,
    RSR: row.rsr_percentage,
    SVR: row.svr_percentage,
    "FC%": row.fc_percentage,
    Coverage: row.avg_line_coverage,
  }));

  return (
    <Card className="p-6">
      <div className="mb-10">
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Sorted by test pass rate (best to worst)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={520}>
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
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: "#A6AEC8", fontSize: 12 }}
            axisLine={{ stroke: "#222736" }}
            tickLine={{ stroke: "#222736" }}
          />
          <YAxis
            label={{
              value: "Rate (%)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#A6AEC8", fontWeight: 600, fontSize: 13 },
            }}
            domain={[0, 100]}
            tick={{ fill: "#A6AEC8", fontSize: 12 }}
            axisLine={{ stroke: "#222736" }}
            tickLine={{ stroke: "#222736" }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `LLM: ${label}`}
            contentStyle={{
              backgroundColor: "rgba(24, 29, 43, 0.95)",
              border: "1px solid #222736",
              borderRadius: "8px",
              padding: "12px 14px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
            }}
            labelStyle={{
              color: "#F7F8FF",
              fontWeight: 600,
              marginBottom: "8px",
              fontSize: "14px",
            }}
            itemStyle={{
              color: "#A6AEC8",
              fontSize: "13px",
              fontWeight: 500,
            }}
            cursor={{ fill: "rgba(34, 39, 54, 0.2)" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "14px",
              fontWeight: 600,
            }}
            iconType="circle"
            iconSize={10}
          />
          {viewMode === "test-set" ? (
            <>
              <Line
                type="monotone"
                dataKey="CSR"
                stroke={PERFORMANCE_COLORS.CSR}
                name="CSR (%)"
                strokeWidth={3}
                dot={{ fill: PERFORMANCE_COLORS.CSR, r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="RSR"
                stroke={PERFORMANCE_COLORS.RSR}
                name="RSR (%)"
                strokeWidth={3}
                dot={{ fill: PERFORMANCE_COLORS.RSR, r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="SVR"
                stroke={PERFORMANCE_COLORS.SVR}
                name="SVR (%)"
                strokeWidth={3}
                dot={{ fill: PERFORMANCE_COLORS.SVR, r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="FC%"
                stroke={PERFORMANCE_COLORS.FC}
                name="FC%"
                strokeWidth={3}
                dot={{ fill: PERFORMANCE_COLORS.FC, r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="Coverage"
                stroke={PERFORMANCE_COLORS.Coverage}
                name="Coverage (%)"
                strokeWidth={3}
                dot={{ fill: PERFORMANCE_COLORS.Coverage, r: 5 }}
                activeDot={{ r: 7 }}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
