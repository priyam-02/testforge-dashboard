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
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
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
            <defs></defs>
            <CartesianGrid
              strokeDasharray="5 5"
              stroke="#475569"
              opacity={0.6}
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#A6AEC8", fontSize: 12 }}
              axisLine={{ stroke: "#222736" }}
              tickLine={{ stroke: "#222736" }}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#A6AEC8", fontSize: 12 }}
              axisLine={{ stroke: "#222736" }}
              tickLine={{ stroke: "#222736" }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => `Test Type: ${label}`}
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
              align="center"
            />
            <Bar
              dataKey="FC%"
              fill={PERFORMANCE_COLORS.FC}
              name="FC%"
              radius={[0, 8, 8, 0]}
              stroke={PERFORMANCE_COLORS.FC}
              strokeWidth={1}
              animationDuration={250}
              animationEasing="ease-in-out"
            />
            <Bar
              dataKey="Coverage"
              fill={PERFORMANCE_COLORS.Coverage}
              name="Coverage (%)"
              radius={[0, 8, 8, 0]}
              stroke={PERFORMANCE_COLORS.Coverage}
              strokeWidth={1}
              animationDuration={250}
              animationEasing="ease-in-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  // Horizontal bar chart for test-set view (matching test-case view style)
  return (
    <Card className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
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
          <defs></defs>
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#475569"
            opacity={0.6}
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#A6AEC8", fontSize: 12 }}
            axisLine={{ stroke: "#222736" }}
            tickLine={{ stroke: "#222736" }}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#A6AEC8", fontSize: 12 }}
            axisLine={{ stroke: "#222736" }}
            tickLine={{ stroke: "#222736" }}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            labelFormatter={(label) => `Test Type: ${label}`}
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
            align="center"
          />
          <Bar
            dataKey="CSR"
            fill={PERFORMANCE_COLORS.CSR}
            name="CSR (%)"
            radius={[0, 8, 8, 0]}
            stroke={PERFORMANCE_COLORS.CSR}
            strokeWidth={1}
            animationDuration={250}
            animationEasing="ease-in-out"
          />
          <Bar
            dataKey="RSR"
            fill={PERFORMANCE_COLORS.RSR}
            name="RSR (%)"
            radius={[0, 8, 8, 0]}
            stroke={PERFORMANCE_COLORS.RSR}
            strokeWidth={1}
            animationDuration={250}
            animationEasing="ease-in-out"
          />
          <Bar
            dataKey="SVR"
            fill={PERFORMANCE_COLORS.SVR}
            name="SVR (%)"
            radius={[0, 8, 8, 0]}
            stroke={PERFORMANCE_COLORS.SVR}
            strokeWidth={1}
            animationDuration={250}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
