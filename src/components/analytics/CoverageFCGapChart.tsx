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
    <Card className="p-6">
      {/* Warning Callout */}
      <div className="mb-6 p-4 bg-[#181D2B] border border-[#FAAD14] rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#FAAD14] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-sm">
              Key Finding: Coverage vs Quality Gap
            </h4>
            <p className="text-sm text-muted-foreground font-medium">
              Average Coverage:{" "}
              <strong className="text-foreground font-mono">
                {avgCoverage.toFixed(2)}%
              </strong>{" "}
              | Functional Correctness:{" "}
              <strong className="text-foreground font-mono">
                {avgFC.toFixed(2)}%
              </strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This{" "}
              <strong className="text-[#FAAD14] font-mono">
                {avgGap.toFixed(2)}% gap
              </strong>{" "}
              shows that achieving high code coverage is easy, but generating
              semantically correct assertions is challenging for LLMs.
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Per-LLM comparison showing the coverage-quality paradox
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
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
            angle={-35}
            textAnchor="end"
            height={90}
            tick={{ fill: "#A6AEC8", fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: "#222736", strokeWidth: 1 }}
            tickLine={{ stroke: "#222736", strokeWidth: 1 }}
          />
          <YAxis
            label={{
              value: "Percentage (%)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
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
            labelFormatter={(label) => `LLM: ${label}`}
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
          />

          {/* Coverage as line (showing it's consistently high) */}
          <Line
            type="monotone"
            dataKey="Coverage (%)"
            stroke={PERFORMANCE_COLORS.Coverage}
            strokeWidth={3}
            dot={{
              fill: PERFORMANCE_COLORS.Coverage,
              r: 5,
              strokeWidth: 2,
              stroke: "#050711",
            }}
            name="Coverage (%)"
            animationDuration={250}
          />

          {/* FC as bars (showing it's much lower) */}
          <Bar
            dataKey="FC (%)"
            fill={PERFORMANCE_COLORS.FC}
            name="FC (%)"
            animationDuration={250}
            radius={[6, 6, 0, 0]}
            stroke={PERFORMANCE_COLORS.FC}
            strokeWidth={1}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Gap Analysis */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="p-4 bg-[#181D2B] rounded-lg border border-[#FF4D4F]"
          >
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {item.name}
            </p>
            <p className="text-xl font-bold text-[#FF4D4F] font-mono">
              {item.gap.toFixed(2)}% gap
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
