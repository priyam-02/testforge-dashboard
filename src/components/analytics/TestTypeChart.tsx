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
import type { AggregatedByTestType } from "@/types/metrics";

interface TestTypeChartProps {
  data: AggregatedByTestType[];
  title?: string;
  viewMode?: "test-set" | "test-case";
}

export function TestTypeChart({
  data,
  title = "Performance by Test Type",
  viewMode = "test-set",
}: TestTypeChartProps) {
  const chartData = data.map((row) => ({
    name: row.test_type.charAt(0).toUpperCase() + row.test_type.slice(1),
    CSR: row.csr_percentage,
    RSR: row.rsr_percentage,
    SVR: row.svr_percentage,
    "FC%": row.fc_percentage,
    Coverage: row.avg_line_coverage,
  }));

  // Horizontal bar chart for test-case view
  if (viewMode === "test-case") {
    return (
      <Card className="p-6 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 dark:from-gray-950 dark:via-emerald-950/20 dark:to-teal-950/10 border-emerald-200/50 dark:border-emerald-800/30 shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Comparison of test pass rate and coverage across test types
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
            barCategoryGap="15%"
          >
            <defs>
              {/* Gradient for FC% bars */}
              <linearGradient id="fcBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor={PERFORMANCE_COLORS.FC}
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor={PERFORMANCE_COLORS.FC}
                  stopOpacity={1}
                />
              </linearGradient>
              {/* Gradient for Coverage bars */}
              <linearGradient
                id="coverageBarGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor={PERFORMANCE_COLORS.Coverage}
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor={PERFORMANCE_COLORS.Coverage}
                  stopOpacity={1}
                />
              </linearGradient>
              {/* Shadow effect */}
              <filter
                id="shadow-testtype-bar"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#cbd5e1"
              opacity={0.4}
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
              axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
              tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
              axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
              tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => `Test Type: ${label}`}
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
              align="center"
            />
            <Bar
              dataKey="FC%"
              fill="url(#fcBarGradient)"
              name="FC%"
              radius={[0, 8, 8, 0]}
              stroke={PERFORMANCE_COLORS.FC}
              strokeWidth={2}
              filter="url(#shadow-testtype-bar)"
              animationDuration={700}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="Coverage"
              fill="url(#coverageBarGradient)"
              name="Coverage (%)"
              radius={[0, 8, 8, 0]}
              stroke={PERFORMANCE_COLORS.Coverage}
              strokeWidth={2}
              filter="url(#shadow-testtype-bar)"
              animationDuration={700}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  // Horizontal bar chart for test-set view (matching test-case view style)
  return (
    <Card className="p-6 bg-gradient-to-br from-white via-sky-50/30 to-cyan-50/20 dark:from-gray-950 dark:via-sky-950/20 dark:to-cyan-950/10 border-sky-200/50 dark:border-sky-800/30 shadow-lg">
      <div className="mb-8">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">
          Comparison of failure rates and test pass rate across test types
        </p>
      </div>
      <ResponsiveContainer width="100%" height={470}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
          barCategoryGap="15%"
        >
          <defs>
            {/* Gradients for CSR bars - horizontal gradient */}
            <linearGradient
              id="csrBarGradient-testtype-h"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.CSR}
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.CSR}
                stopOpacity={1}
              />
            </linearGradient>
            {/* Gradients for RSR bars - horizontal gradient */}
            <linearGradient
              id="rsrBarGradient-testtype-h"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.RSR}
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.RSR}
                stopOpacity={1}
              />
            </linearGradient>
            {/* Gradients for SVR bars - horizontal gradient */}
            <linearGradient
              id="svrBarGradient-testtype-h"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor={PERFORMANCE_COLORS.SVR}
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor={PERFORMANCE_COLORS.SVR}
                stopOpacity={1}
              />
            </linearGradient>
            {/* Shadow effect */}
            <filter
              id="shadow-testtype-h"
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
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
            tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
            tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `Test Type: ${label}`}
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
            align="center"
          />
          <Bar
            dataKey="CSR"
            fill="url(#csrBarGradient-testtype-h)"
            name="CSR (%)"
            radius={[0, 8, 8, 0]}
            stroke={PERFORMANCE_COLORS.CSR}
            strokeWidth={2}
            filter="url(#shadow-testtype-h)"
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="RSR"
            fill="url(#rsrBarGradient-testtype-h)"
            name="RSR (%)"
            radius={[0, 8, 8, 0]}
            stroke={PERFORMANCE_COLORS.RSR}
            strokeWidth={2}
            filter="url(#shadow-testtype-h)"
            animationDuration={700}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="SVR"
            fill="url(#svrBarGradient-testtype-h)"
            name="SVR (%)"
            radius={[0, 8, 8, 0]}
            stroke={PERFORMANCE_COLORS.SVR}
            strokeWidth={2}
            filter="url(#shadow-testtype-h)"
            animationDuration={700}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
