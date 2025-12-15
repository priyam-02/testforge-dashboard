"use client";

import {
  ComposedChart,
  Bar,
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
import { AlertTriangle } from "lucide-react";

interface CoverageFCGapChartProps {
  data: CombinedMetrics[];
  title?: string;
}

export function CoverageFCGapChart({
  data,
  title = "Coverage vs Functional Correctness Gap",
}: CoverageFCGapChartProps) {
  const chartData = data.map((row) => ({
    name: row.llm,
    "Coverage (%)": row.avg_line_coverage,
    "FC (%)": row.fc_percentage,
    gap: row.avg_line_coverage - row.fc_percentage,
  }));

  // Adjust bar width based on number of LLMs
  const barCategoryGap = data.length === 1 ? "60%" : "20%";

  // Calculate weighted average for coverage (by functionally correct cases)
  // Calculate FC% from total counts (not weighted average)
  const totalTestCases = data.reduce(
    (sum, row) => sum + row.total_test_cases,
    0
  );
  const totalFCCases = data.reduce(
    (sum, row) => sum + row.functionally_correct_cases,
    0
  );

  const avgCoverage =
    totalFCCases > 0
      ? data.reduce(
          (sum, row) =>
            sum + row.avg_line_coverage * row.functionally_correct_cases,
          0
        ) / totalFCCases
      : 0;
  const avgFC = totalTestCases > 0 ? (totalFCCases / totalTestCases) * 100 : 0;
  const avgGap = avgCoverage - avgFC;

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 dark:from-gray-950 dark:via-amber-950/20 dark:to-orange-950/10 border-amber-200/50 dark:border-amber-800/30 shadow-lg">
      {/* Warning Callout */}
      <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-300 dark:border-amber-700 rounded-xl shadow-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 drop-shadow-sm" />
          <div>
            <h4 className="font-bold text-amber-950 dark:text-amber-100 mb-2 text-base">
              Key Finding: Coverage vs Quality Gap
            </h4>
            <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
              Average Coverage:{" "}
              <strong className="text-amber-950 dark:text-amber-100">
                {avgCoverage.toFixed(2)}%
              </strong>{" "}
              | Functional Correctness:{" "}
              <strong className="text-amber-950 dark:text-amber-100">
                {avgFC.toFixed(2)}%
              </strong>
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-2 leading-relaxed">
              This{" "}
              <strong className="text-amber-950 dark:text-amber-100">
                {avgGap.toFixed(2)}% gap
              </strong>{" "}
              shows that achieving high code coverage is easy, but generating
              semantically correct assertions is challenging for LLMs.
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
          Per-LLM comparison showing the coverage-quality paradox
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          barCategoryGap={barCategoryGap}
        >
          <defs>
            {/* Gradient for Coverage line */}
            <linearGradient id="coverageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.Coverage}
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.Coverage}
                stopOpacity={0.3}
              />
            </linearGradient>
            {/* Gradient for FC bars */}
            <linearGradient id="fcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.FC}
                stopOpacity={0.95}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.FC}
                stopOpacity={0.7}
              />
            </linearGradient>
            {/* Shadow effect */}
            <filter
              id="shadow-gap"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodOpacity="0.25"
              />
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#cbd5e1"
            opacity={0.4}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            angle={-35}
            textAnchor="end"
            height={90}
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
            tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
          />
          <YAxis
            label={{
              value: "Percentage (%)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
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
              paddingTop: "30px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          />

          {/* Coverage as line (showing it's consistently high) */}
          <Line
            type="monotone"
            dataKey="Coverage (%)"
            stroke={PERFORMANCE_COLORS.Coverage}
            strokeWidth={4}
            dot={{
              fill: PERFORMANCE_COLORS.Coverage,
              r: 7,
              strokeWidth: 3,
              stroke: "#fff",
              filter: "url(#shadow-gap)",
            }}
            name="Coverage (%)"
            animationDuration={700}
            animationEasing="ease-out"
          />

          {/* FC as bars (showing it's much lower) */}
          <Bar
            dataKey="FC (%)"
            fill="url(#fcGradient)"
            name="FC (%)"
            animationDuration={700}
            animationEasing="ease-out"
            radius={[10, 10, 0, 0]}
            stroke={PERFORMANCE_COLORS.FC}
            strokeWidth={2}
            filter="url(#shadow-gap)"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Gap Analysis */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 rounded-xl border-2 border-red-200 dark:border-red-800 shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              {item.name}
            </p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {item.gap.toFixed(2)}% gap
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
