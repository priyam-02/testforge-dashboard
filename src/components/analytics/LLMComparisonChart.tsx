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
    <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
      <div className="mb-10">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
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
          <defs>
            {/* Stripe patterns for visual distinction */}
            <pattern
              id="stripePattern"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <rect width="4" height="8" fill="rgba(255, 255, 255, 0.2)" />
            </pattern>
            {/* Gradients for FC% with pattern */}
            <linearGradient id="fcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.FC}
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.FC}
                stopOpacity={0.7}
              />
            </linearGradient>
            <pattern id="fcPattern" patternUnits="objectBoundingBox" width="1" height="1">
              <rect width="100%" height="100%" fill="url(#fcGradient)" />
              <rect width="100%" height="100%" fill="url(#stripePattern)" />
            </pattern>
            {/* Gradients for Coverage with pattern */}
            <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.Coverage}
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.Coverage}
                stopOpacity={0.7}
              />
            </linearGradient>
            <pattern id="coveragePattern" patternUnits="objectBoundingBox" width="1" height="1">
              <rect width="100%" height="100%" fill="url(#coverageGradient)" />
              <rect width="100%" height="100%" fill="url(#stripePattern)" />
            </pattern>
            {/* Gradients for CSR with pattern */}
            <linearGradient id="csrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.CSR}
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.CSR}
                stopOpacity={0.7}
              />
            </linearGradient>
            <pattern id="csrPattern" patternUnits="objectBoundingBox" width="1" height="1">
              <rect width="100%" height="100%" fill="url(#csrGradient)" />
              <rect width="100%" height="100%" fill="url(#stripePattern)" />
            </pattern>
            {/* Gradients for RSR with pattern */}
            <linearGradient id="rsrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.RSR}
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.RSR}
                stopOpacity={0.7}
              />
            </linearGradient>
            <pattern id="rsrPattern" patternUnits="objectBoundingBox" width="1" height="1">
              <rect width="100%" height="100%" fill="url(#rsrGradient)" />
              <rect width="100%" height="100%" fill="url(#stripePattern)" />
            </pattern>
            {/* Gradients for SVR with pattern */}
            <linearGradient id="svrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.SVR}
                stopOpacity={1}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.SVR}
                stopOpacity={0.7}
              />
            </linearGradient>
            <pattern id="svrPattern" patternUnits="objectBoundingBox" width="1" height="1">
              <rect width="100%" height="100%" fill="url(#svrGradient)" />
              <rect width="100%" height="100%" fill="url(#stripePattern)" />
            </pattern>
            {/* Shadow effect */}
            <filter
              id="shadow-llm"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
            {/* Stripe patterns for visual distinction */}
            <pattern
              id="stripePattern"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <rect width="4" height="8" fill="rgba(255, 255, 255, 0.2)" />
            </pattern>
            <pattern
              id="dotPattern"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
            >
              <circle cx="3" cy="3" r="1.5" fill="rgba(255, 255, 255, 0.25)" />
            </pattern>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#cbd5e1"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
            tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
          />
          <YAxis
            label={{
              value: "Rate (%)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#475569", fontWeight: 700, fontSize: 14 },
            }}
            domain={[0, 100]}
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
            tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `LLM: ${label}`}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              padding: "14px 16px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
            labelStyle={{
              color: "#f1f5f9",
              fontWeight: 700,
              marginBottom: "8px",
              fontSize: "14px",
            }}
            itemStyle={{
              color: "#e2e8f0",
              fontSize: "13px",
              fontWeight: 500,
            }}
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
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
                fill="url(#csrPattern)"
                name="CSR (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.CSR}
                strokeWidth={1}
                filter="url(#shadow-llm)"
                animationDuration={700}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="RSR"
                fill="url(#rsrPattern)"
                name="RSR (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.RSR}
                strokeWidth={1}
                filter="url(#shadow-llm)"
                animationDuration={700}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="SVR"
                fill="url(#svrPattern)"
                name="SVR (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.SVR}
                strokeWidth={1}
                filter="url(#shadow-llm)"
                animationDuration={700}
                animationEasing="ease-out"
              />
            </>
          ) : (
            <>
              <Bar
                dataKey="FC%"
                fill="url(#fcPattern)"
                name="FC%"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.FC}
                strokeWidth={2}
                filter="url(#shadow-llm)"
                animationDuration={700}
                animationEasing="ease-out"
                barSize={chartData.length === 1 ? 60 : undefined}
              />
              <Bar
                dataKey="Coverage"
                fill="url(#coveragePattern)"
                name="Coverage (%)"
                radius={[8, 8, 0, 0]}
                stroke={PERFORMANCE_COLORS.Coverage}
                strokeWidth={2}
                filter="url(#shadow-llm)"
                animationDuration={700}
                animationEasing="ease-out"
                barSize={chartData.length === 1 ? 60 : undefined}
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
