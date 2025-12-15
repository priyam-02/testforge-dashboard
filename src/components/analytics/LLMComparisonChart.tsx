"use client";

import {
  BarChart,
  Bar,
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

  // Adjust spacing for single vs multiple LLMs
  const barCategoryGap = chartData.length === 1 ? "35%" : "20%";

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
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          maxBarSize={60}
          barGap={4}
          barCategoryGap={barCategoryGap}
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
            iconType="rect"
            iconSize={14}
          />
          {viewMode === "test-set" ? (
            <>
              <Bar
                dataKey="CSR"
                fill={PERFORMANCE_COLORS.CSR}
                name="CSR (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.CSR}
                strokeWidth={1}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
              <Bar
                dataKey="RSR"
                fill={PERFORMANCE_COLORS.RSR}
                name="RSR (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.RSR}
                strokeWidth={1}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
              <Bar
                dataKey="SVR"
                fill={PERFORMANCE_COLORS.SVR}
                name="SVR (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.SVR}
                strokeWidth={1}
                animationDuration={250}
                animationEasing="ease-in-out"
              />
            </>
          ) : (
            <>
              <Bar
                dataKey="FC%"
                fill={PERFORMANCE_COLORS.FC}
                name="FC%"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.FC}
                strokeWidth={1}
                animationDuration={250}
                animationEasing="ease-in-out"
                barSize={chartData.length === 1 ? 60 : undefined}
              />
              <Bar
                dataKey="Coverage"
                fill={PERFORMANCE_COLORS.Coverage}
                name="Coverage (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.Coverage}
                strokeWidth={1}
                animationDuration={250}
                animationEasing="ease-in-out"
                barSize={chartData.length === 1 ? 60 : undefined}
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
