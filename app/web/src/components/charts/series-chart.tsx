"use client";

import type { BreakdownRow, SeriesPoint } from "@saleslens/contracts";
import ReactECharts from "echarts-for-react";

type Variant = "line" | "bar" | "donut" | "combo" | "scatter";

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
          tooltip: { trigger: "item" },
          legend: { bottom: 0, textStyle: { color: "#64748B" } },
          series: [
            {
              type: "pie",
              radius: ["45%", "72%"],
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
