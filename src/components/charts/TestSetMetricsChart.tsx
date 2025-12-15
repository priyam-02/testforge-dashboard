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
import type { TestSetMetrics } from "@/types/metrics";

interface TestSetMetricsChartProps {
  data: TestSetMetrics[];
  title: string;
}

export function TestSetMetricsChart({ data, title }: TestSetMetricsChartProps) {
  // Aggregate data by LLM to avoid duplicate bars when multiple configs exist
  const aggregatedByLLM = new Map<
    string,
    { csr_values: number[]; rsr_values: number[]; svr_values: number[] }
  >();

  data.forEach((row) => {
    if (!aggregatedByLLM.has(row.llm)) {
      aggregatedByLLM.set(row.llm, {
        csr_values: [],
        rsr_values: [],
        svr_values: [],
      });
    }
    aggregatedByLLM.get(row.llm)!.csr_values.push(row.csr_percentage);
    aggregatedByLLM.get(row.llm)!.rsr_values.push(row.rsr_percentage);
    aggregatedByLLM.get(row.llm)!.svr_values.push(row.svr_percentage);
  });

  // Calculate averages for each LLM
  const chartData = Array.from(aggregatedByLLM.entries()).map(
    ([llm, values]) => ({
      name: llm,
      CSR:
        values.csr_values.reduce((sum, val) => sum + val, 0) /
        values.csr_values.length,
      RSR:
        values.rsr_values.reduce((sum, val) => sum + val, 0) /
        values.rsr_values.length,
      SVR:
        values.svr_values.reduce((sum, val) => sum + val, 0) /
        values.svr_values.length,
    })
  );

  // Adjust spacing for single vs multiple LLMs
  const barCategoryGap = chartData.length === 1 ? "35%" : "20%";

  return (
    <Card className="p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-800/30 shadow-lg">
      <div className="mb-10">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Test set performance metrics by LLM
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
              id="stripePattern-testset"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <rect width="4" height="8" fill="rgba(255, 255, 255, 0.2)" />
            </pattern>
            {/* Gradients for CSR with pattern */}
            <linearGradient
              id="csrGradient-testset"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
            </linearGradient>
            <pattern
              id="csrPattern-testset"
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <rect
                width="100%"
                height="100%"
                fill="url(#csrGradient-testset)"
              />
              <rect
                width="100%"
                height="100%"
                fill="url(#stripePattern-testset)"
              />
            </pattern>
            {/* Gradients for RSR with pattern */}
            <linearGradient
              id="rsrGradient-testset"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
            </linearGradient>
            <pattern
              id="rsrPattern-testset"
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <rect
                width="100%"
                height="100%"
                fill="url(#rsrGradient-testset)"
              />
              <rect
                width="100%"
                height="100%"
                fill="url(#stripePattern-testset)"
              />
            </pattern>
            {/* Gradients for SVR with pattern */}
            <linearGradient
              id="svrGradient-testset"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.7} />
            </linearGradient>
            <pattern
              id="svrPattern-testset"
              patternUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <rect
                width="100%"
                height="100%"
                fill="url(#svrGradient-testset)"
              />
              <rect
                width="100%"
                height="100%"
                fill="url(#stripePattern-testset)"
              />
            </pattern>
            {/* Shadow effect */}
            <filter
              id="shadow-testset"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
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
          <Bar
            dataKey="CSR"
            fill="url(#csrPattern-testset)"
            name="Compile Success Rate"
            radius={[8, 8, 0, 0]}
            stroke="#3b82f6"
            strokeWidth={1}
            filter="url(#shadow-testset)"
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="RSR"
            fill="url(#rsrPattern-testset)"
            name="Runtime Success Rate"
            radius={[8, 8, 0, 0]}
            stroke="#10b981"
            strokeWidth={1}
            filter="url(#shadow-testset)"
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="SVR"
            fill="url(#svrPattern-testset)"
            name="Semantic Validity Rate"
            radius={[8, 8, 0, 0]}
            stroke="#f59e0b"
            strokeWidth={1}
            filter="url(#shadow-testset)"
            animationDuration={700}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
