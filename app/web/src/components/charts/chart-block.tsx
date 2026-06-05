"use client";

import type { BreakdownRow, SeriesPoint } from "@saleslens/contracts";
import { useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { ExportMenu } from "@/components/export/export-menu";
import { useFilters } from "@/components/providers/filter-provider";
import { useApiQuery } from "@/lib/api/hooks";
import { ChartCard } from "./chart-card";
import { SeriesChart } from "./series-chart";

export function ChartBlock({
  title,
  subtitle,
  endpoint,
  variant,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  variant: "line" | "bar" | "donut" | "combo" | "scatter";
}) {
  const { filters } = useFilters();
  const [dateOverrides, setDateOverrides] = useState<{
    fromDate?: string;
    toDate?: string;
  }>({});

  const chartFilters = useMemo(
    () => ({
      ...filters,
      ...dateOverrides,
      preset: dateOverrides.fromDate || dateOverrides.toDate ? "custom" : filters.preset,
    }),
    [dateOverrides, filters],
  );

  const { data, isLoading, isError, refetch } = useApiQuery<SeriesPoint[] | BreakdownRow[]>(
    endpoint,
    endpoint,
    chartFilters,
  );
  const exportRows = (data?.data ?? []).map((item) =>
    "value" in item
      ? {
          label: item.label,
          value: item.value,
          secondaryValue: item.secondaryValue ?? null,
        }
      : {
          label: item.label,
          metric: item.metric,
          secondaryMetric: item.secondaryMetric ?? null,
          tertiaryMetric: item.tertiaryMetric ?? null,
        },
  );

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      actions={
        <>
          <label className="text-xs text-[var(--muted)]">
            <span className="mb-1 block">From</span>
            <input
              type="date"
              value={dateOverrides.fromDate ?? filters.fromDate ?? ""}
              onChange={(event) =>
                setDateOverrides((current) => ({
                  ...current,
                  fromDate: event.target.value || undefined,
                }))
              }
              className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>
          <label className="text-xs text-[var(--muted)]">
            <span className="mb-1 block">To</span>
            <input
              type="date"
              value={dateOverrides.toDate ?? filters.toDate ?? ""}
              onChange={(event) =>
                setDateOverrides((current) => ({
                  ...current,
                  toDate: event.target.value || undefined,
                }))
              }
              className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>
          <button
            type="button"
            onClick={() => setDateOverrides({})}
            className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Reset dates
          </button>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <RefreshCcw className="mr-2 inline h-4 w-4" />
            Refresh
          </button>
          <ExportMenu title={title} rows={exportRows} />
        </>
      }
    >
      {isLoading ? (
        <div className="skeleton h-[280px] rounded-3xl" />
      ) : isError ? (
        <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
          This chart could not load with the current filters.
        </div>
      ) : !(data?.data?.length ?? 0) ? (
        <div className="flex h-[280px] items-center justify-center rounded-3xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
          No chart data is available for the active selection.
        </div>
      ) : (
        <SeriesChart data={data?.data ?? []} variant={variant} />
      )}
    </ChartCard>
  );
}
