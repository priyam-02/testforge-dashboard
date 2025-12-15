"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { AggregatedByPrompt } from "@/types/metrics";

interface PromptStrategyChartProps {
  data: AggregatedByPrompt[];
  title?: string;
  metricView?: "test-set" | "test-case";
}

export function PromptStrategyChart({
  data,
  title = "Prompt Strategy Effectiveness",
  metricView = "test-set",
}: PromptStrategyChartProps) {
  // Transform data for chart - each metric is a data point/axis
  const metrics =
    metricView === "test-set" ? ["CSR", "RSR", "SVR"] : ["FC%", "Coverage"];

  const chartData = metrics.map((metric) => {
    const dataPoint: Record<string, string | number> = { metric };

    data.forEach((row) => {
      const strategyName =
        row.prompt_type === "zero_shot"
          ? "Zero-Shot"
          : row.prompt_type === "few_shot"
            ? "Few-Shot"
            : "Chain-of-Thought";

      if (metricView === "test-set") {
        if (metric === "CSR") dataPoint[strategyName] = row.csr_percentage;
        if (metric === "RSR") dataPoint[strategyName] = row.rsr_percentage;
        if (metric === "SVR") dataPoint[strategyName] = row.svr_percentage;
      } else {
        if (metric === "FC%") dataPoint[strategyName] = row.fc_percentage;
        if (metric === "Coverage")
          dataPoint[strategyName] = row.avg_line_coverage;
      }
    });

    return dataPoint;
  });

  // TestForge Design System - Prompt Strategy Colors
  const strategyColors = {
    "Zero-Shot": "#FAAD14", // outcome.O2 (orange)
    "Few-Shot": "#597EF7", // model.qwen32b (indigo)
    "Chain-of-Thought": "#36CFC9", // outcome.O4 (teal)
  };

  // Use same colors for bar chart (consistency)
  const barColors = {
    "Zero-Shot": "#FAAD14",
    "Few-Shot": "#597EF7",
    "Chain-of-Thought": "#36CFC9",
  };

  // Determine which strategies have data
  const availableStrategies = Array.from(
    new Set(
      data.map((row) =>
        row.prompt_type === "zero_shot"
          ? "Zero-Shot"
          : row.prompt_type === "few_shot"
            ? "Few-Shot"
            : "Chain-of-Thought"
      )
    )
  );

  // Use radar chart for test-set (3 metrics), grouped bar for test-case (2 metrics)
  if (metricView === "test-case") {
    // Adjust bar width based on number of strategies
    const barCategoryGap = availableStrategies.length === 1 ? "60%" : "30%";

    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Comparison of prompting strategies across performance metrics
          </p>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 40, bottom: 50, left: 30 }}
            barGap={12}
            barCategoryGap={barCategoryGap}
          >
            <defs>
              {/* Diagonal stripe patterns with gradients */}
              <pattern
                id="zeroShotPattern"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                patternTransform="rotate(45)"
              >
                <rect
                  width="4"
                  height="8"
                  fill={barColors["Zero-Shot"]}
                  opacity="0.9"
                />
                <rect
                  x="4"
                  width="4"
                  height="8"
                  fill={barColors["Zero-Shot"]}
                  opacity="0.6"
                />
              </pattern>
              <pattern
                id="fewShotPattern"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                patternTransform="rotate(-45)"
              >
                <rect
                  width="4"
                  height="8"
                  fill={barColors["Few-Shot"]}
                  opacity="0.9"
                />
                <rect
                  x="4"
                  width="4"
                  height="8"
                  fill={barColors["Few-Shot"]}
                  opacity="0.6"
                />
              </pattern>
              <pattern
                id="cotPattern"
                patternUnits="userSpaceOnUse"
                width="10"
                height="10"
                patternTransform="rotate(45)"
              >
                <rect
                  width="3"
                  height="10"
                  fill={barColors["Chain-of-Thought"]}
                  opacity="1"
                />
                <rect
                  x="3"
                  width="7"
                  height="10"
                  fill={barColors["Chain-of-Thought"]}
                  opacity="0.5"
                />
              </pattern>

              {/* Gradient overlays for depth */}
              <linearGradient id="zeroShotOverlay" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={barColors["Zero-Shot"]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={barColors["Zero-Shot"]}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="fewShotOverlay" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={barColors["Few-Shot"]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={barColors["Few-Shot"]}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="cotOverlay" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={barColors["Chain-of-Thought"]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={barColors["Chain-of-Thought"]}
                  stopOpacity={0}
                />
              </linearGradient>

              {/* Enhanced shadow with glow effect */}
              <filter
                id="shadow-prompt"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="3" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.4" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="5 5"
              stroke="#475569"
              opacity={0.6}
              vertical={false}
            />
            <XAxis
              dataKey="metric"
              tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
              axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
              tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
            />
            <YAxis
              label={{
                value: "Performance (%)",
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
              labelFormatter={(label) => `Metric: ${label}`}
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
              iconType="square"
              iconSize={12}
            />
            {availableStrategies.includes("Zero-Shot") && (
              <Bar
                dataKey="Zero-Shot"
                fill="url(#zeroShotPattern)"
                radius={[8, 8, 0, 0]}
                stroke={barColors["Zero-Shot"]}
                strokeWidth={3}
                filter="url(#shadow-prompt)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            )}
            {availableStrategies.includes("Few-Shot") && (
              <Bar
                dataKey="Few-Shot"
                fill="url(#fewShotPattern)"
                radius={[8, 8, 0, 0]}
                stroke={barColors["Few-Shot"]}
                strokeWidth={3}
                filter="url(#shadow-prompt)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            )}
            {availableStrategies.includes("Chain-of-Thought") && (
              <Bar
                dataKey="Chain-of-Thought"
                fill="url(#cotPattern)"
                radius={[8, 8, 0, 0]}
                stroke={barColors["Chain-of-Thought"]}
                strokeWidth={3}
                filter="url(#shadow-prompt)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    );
  }

  // Bar chart for test-set view (3 metrics) - matching test-case style
  // Adjust bar width based on number of strategies
  const barCategoryGap = availableStrategies.length === 1 ? "60%" : "30%";

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Comparison of prompting strategies across performance metrics
        </p>
      </div>
      <ResponsiveContainer width="100%" height={440}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 40, bottom: 50, left: 30 }}
          barGap={12}
          barCategoryGap={barCategoryGap}
        >
          <defs>
            {/* Diagonal stripe patterns with gradients */}
            <pattern
              id="zeroShotPattern-testset"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <rect
                width="4"
                height="8"
                fill={barColors["Zero-Shot"]}
                opacity="0.9"
              />
              <rect
                x="4"
                width="4"
                height="8"
                fill={barColors["Zero-Shot"]}
                opacity="0.6"
              />
            </pattern>
            <pattern
              id="fewShotPattern-testset"
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(-45)"
            >
              <rect
                width="4"
                height="8"
                fill={barColors["Few-Shot"]}
                opacity="0.9"
              />
              <rect
                x="4"
                width="4"
                height="8"
                fill={barColors["Few-Shot"]}
                opacity="0.6"
              />
            </pattern>
            <pattern
              id="cotPattern-testset"
              patternUnits="userSpaceOnUse"
              width="10"
              height="10"
              patternTransform="rotate(45)"
            >
              <rect
                width="3"
                height="10"
                fill={barColors["Chain-of-Thought"]}
                opacity="1"
              />
              <rect
                x="3"
                width="7"
                height="10"
                fill={barColors["Chain-of-Thought"]}
                opacity="0.5"
              />
            </pattern>

            {/* Gradient overlays for depth */}
            <linearGradient
              id="zeroShotOverlay-testset"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={barColors["Zero-Shot"]}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={barColors["Zero-Shot"]}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient
              id="fewShotOverlay-testset"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={barColors["Few-Shot"]}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={barColors["Few-Shot"]}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="cotOverlay-testset" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={barColors["Chain-of-Thought"]}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={barColors["Chain-of-Thought"]}
                stopOpacity={0}
              />
            </linearGradient>

            {/* Enhanced shadow with glow effect */}
            <filter
              id="shadow-prompt-testset"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="3" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.4" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="5 5"
            stroke="#475569"
            opacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="metric"
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
            axisLine={{ stroke: "#94a3b8", strokeWidth: 2 }}
            tickLine={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
          />
          <YAxis
            label={{
              value: "Performance (%)",
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
            labelFormatter={(label) => `Metric: ${label}`}
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
            iconType="square"
            iconSize={12}
          />
          {availableStrategies.includes("Zero-Shot") && (
            <Bar
              dataKey="Zero-Shot"
              fill="url(#zeroShotPattern-testset)"
              radius={[8, 8, 0, 0]}
              stroke={barColors["Zero-Shot"]}
              strokeWidth={3}
              filter="url(#shadow-prompt-testset)"
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          )}
          {availableStrategies.includes("Few-Shot") && (
            <Bar
              dataKey="Few-Shot"
              fill="url(#fewShotPattern-testset)"
              radius={[8, 8, 0, 0]}
              stroke={barColors["Few-Shot"]}
              strokeWidth={3}
              filter="url(#shadow-prompt-testset)"
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          )}
          {availableStrategies.includes("Chain-of-Thought") && (
            <Bar
              dataKey="Chain-of-Thought"
              fill="url(#cotPattern-testset)"
              radius={[8, 8, 0, 0]}
              stroke={barColors["Chain-of-Thought"]}
              strokeWidth={3}
              filter="url(#shadow-prompt-testset)"
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
