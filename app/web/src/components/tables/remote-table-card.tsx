"use client";

import type { TablePayload } from "@saleslens/contracts";
import { useMemo, useState } from "react";
import { useFilters } from "@/components/providers/filter-provider";
import { useApiQuery } from "@/lib/api/hooks";
import { ChartCard } from "@/components/charts/chart-card";
import { DataTable } from "./data-table";

export function RemoteTableCard({
  title,
  subtitle,
  endpoint,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
}) {
  const { filters } = useFilters();
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  return <RemoteTableWorkspace key={`${endpoint}:${filterKey}`} title={title} subtitle={subtitle} endpoint={endpoint} />;
}

function RemoteTableWorkspace({
  title,
  subtitle,
  endpoint,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
}) {
  const { filters } = useFilters();
  const { data, isLoading } = useApiQuery<TablePayload<Record<string, unknown>>>(endpoint, endpoint, filters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const rows = data?.data.rows ?? [];
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedRows = rows.slice(startIndex, startIndex + pageSize);

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {isLoading ? (
        <div className="skeleton h-72 rounded-3xl" />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[var(--muted)]">
              Showing {rows.length ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, rows.length)} of {rows.length} rows
            </p>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              Rows per page
              <select
                value={String(pageSize)}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2 text-[var(--foreground)]"
              >
                {["10", "20", "50"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <DataTable rows={pagedRows} stickyHeader showFooter />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[var(--muted)]">
              Page {safePage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage >= totalPages}
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
