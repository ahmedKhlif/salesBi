"use client";

import type { BreakdownRow, SeriesPoint } from "@saleslens/contracts";
import ReactECharts from "echarts-for-react";
import { formatNumber } from "@/lib/formatters";

type Variant = "line" | "bar" | "donut" | "combo" | "scatter";

function truncateLabel(label: string, maxLength = 20) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

function getPrimaryValue(item: SeriesPoint | BreakdownRow) {
  return "value" in item ? item.value : item.metric;
}

function getSecondaryValue(item: SeriesPoint | BreakdownRow) {
  return "secondaryValue" in item
    ? item.secondaryValue ?? 0
    : "secondaryMetric" in item
      ? item.secondaryMetric ?? 0
      : 0;
}

export function SeriesChart({
  data,
  variant,
}: {
  data: SeriesPoint[] | BreakdownRow[];
  variant: Variant;
}) {
  const labels = data.map((item) => item.label);
  const values = data.map((item) => getPrimaryValue(item));
  const secondaryValues = data.map((item) => getSecondaryValue(item));

  const option =
    variant === "donut"
      ? {
          color: [
            "#5B7BE0",
            "#7CCAA5",
            "#F6C453",
            "#6CB7D8",
            "#49B07D",
            "#FF8B4F",
            "#A66ED4",
            "#E46FC0",
            "#7C8FE6",
            "#2EC4B6",
          ],
          tooltip: {
            trigger: "item",
            valueFormatter: (value: number) => formatNumber(value),
          },
          legend: {
            type: "scroll",
            bottom: 0,
            left: 0,
            right: 0,
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 14,
            pageIconColor: "#2563EB",
            pageIconInactiveColor: "rgba(100,116,139,0.35)",
            pageTextStyle: { color: "#64748B" },
            textStyle: {
              color: "#64748B",
              width: 130,
              overflow: "truncate",
            },
            formatter: (name: string) => truncateLabel(name, 24),
          },
          series: [
            {
              type: "pie",
              radius: ["48%", "72%"],
              center: ["50%", "36%"],
              avoidLabelOverlap: true,
              minAngle: 3,
              itemStyle: {
                borderColor: "#0F172A",
                borderWidth: 3,
              },
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
              emphasis: {
                scale: true,
                scaleSize: 6,
                label: {
                  show: true,
                  position: "center",
                  formatter: ({ name, percent }: { name: string; percent?: number }) =>
                    `${truncateLabel(name, 22)}\n${percent ?? 0}%`,
                  color: "#E2E8F0",
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 20,
                },
              },
              data: data.map((item) => ({
                name: item.label,
                value: "value" in item ? item.value : item.metric,
              })),
            },
          ],
        }
      : variant === "scatter"
        ? {
            tooltip: { trigger: "item" },
            xAxis: { type: "value", axisLabel: { color: "#64748B" }, name: "Primary" },
            yAxis: { type: "value", axisLabel: { color: "#64748B" }, name: "Secondary" },
            series: [
              {
                type: "scatter",
                data: data.map((item) => ({
                  value: [getPrimaryValue(item), getSecondaryValue(item), item.label],
                  symbolSize: "tertiaryMetric" in item ? Math.max(12, Number(item.tertiaryMetric ?? 0) / 12) : 18,
                })),
                itemStyle: { color: "#8B5CF6", opacity: 0.82 },
              },
            ],
          }
        : variant === "combo"
          ? {
              tooltip: { trigger: "axis" },
              legend: { textStyle: { color: "#64748B" } },
              xAxis: { type: "category", data: labels, axisLabel: { color: "#64748B" } },
              yAxis: [
                { type: "value", axisLabel: { color: "#64748B" } },
                { type: "value", axisLabel: { color: "#64748B" } },
              ],
              series: [
                {
                  name: "Primary",
                  type: "bar",
                  data: values,
                  itemStyle: { color: "#14B8A6" },
                },
                {
                  name: "Secondary",
                  type: "line",
                  data: secondaryValues,
                  yAxisIndex: 1,
                  smooth: true,
                  itemStyle: { color: "#2563EB" },
                },
              ],
            }
          : {
              tooltip: { trigger: "axis" },
              xAxis: { type: "category", data: labels, axisLabel: { color: "#64748B" } },
              yAxis: { type: "value", axisLabel: { color: "#64748B" } },
              series: [
                {
                  type: variant,
                  data: values,
                  smooth: true,
                  itemStyle: { color: variant === "bar" ? "#14B8A6" : "#2563EB" },
                  areaStyle: variant === "line" ? { color: "rgba(37,99,235,0.10)" } : undefined,
                },
              ],
            };

  return <ReactECharts option={option} style={{ height: 280, width: "100%" }} />;
}
