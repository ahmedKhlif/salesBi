"use client";

import type { ExplorerRow, GlobalFilters } from "@saleslens/contracts";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ExportMenu } from "@/components/export/export-menu";
import { useFilters } from "@/components/providers/filter-provider";
import { DataTable } from "@/components/tables/data-table";
import { useApiQuery } from "@/lib/api/hooks";

const defaultVisibleKeys = [
  "fullDate",
  "year",
  "quarter",
  "month",
  "productName",
  "customerName",
  "city",
  "salesRep",
  "quantity",
  "unitPrice",
  "discountAmount",
  "taxAmount",
  "totalSales",
  "netSalesWithoutTax",
  "orderStatus",
  "paymentStatus",
];

const sortableFields = [
  "fullDate",
  "year",
  "quarter",
  "month",
  "productName",
  "customerName",
  "city",
  "salesRep",
  "quantity",
  "unitPrice",
  "discountAmount",
  "taxAmount",
  "totalSales",
];

export default function ExplorerPage() {
  const { filters } = useFilters();
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  return <ExplorerWorkspace key={filterKey} filters={filters} />;
}

function ExplorerWorkspace({ filters }: { filters: GlobalFilters }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("fullDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [visibleKeys, setVisibleKeys] = useState<string[]>(defaultVisibleKeys);

  const explorerQuery = {
    ...filters,
    page,
    pageSize,
    search,
    sortBy,
    sortDir,
  } as GlobalFilters;

  const { data, isLoading } = useApiQuery<ExplorerRow[]>("explorer", "/explorer", explorerQuery);
  const exportData = useApiQuery<ExplorerRow[]>("explorer-export", "/explorer/export/csv", filters);
  const rows = data?.data ?? [];
  const allKeys = rows.length ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Sales Explorer</h1>
        <p className="mt-2 text-[var(--muted)]">
          Detailed drill-down workspace for filtered sales rows, explorer exports, and presentation-ready evidence.
        </p>
      </section>

      <section className="card-surface rounded-[32px] p-5">
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Explorer grid</h3>
              <p className="text-sm text-[var(--muted)]">
                Search, sort, page, and export the live sales detail rows under the active filter context.
              </p>
            </div>
            <ExportMenu title="sales-explorer-filtered" rows={exportData.data?.data ?? rows} />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="xl:col-span-2">
              <span className="mb-2 block text-sm text-[var(--muted)]">Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search customer, product, city, rep..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-transparent py-2 pl-9 pr-3"
                />
              </span>
            </label>

            <SelectField
              label="Sort by"
              value={sortBy}
              onChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
              options={sortableFields}
            />
            <SelectField
              label="Direction"
              value={sortDir}
              onChange={(value) => {
                setSortDir(value as "asc" | "desc");
                setPage(1);
              }}
              options={["desc", "asc"]}
            />
            <SelectField
              label="Page size"
              value={String(pageSize)}
              onChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
              options={["20", "50", "100"]}
            />

            <div>
              <span className="mb-2 block text-sm text-[var(--muted)]">Density</span>
              <div className="flex gap-2">
                {(["comfortable", "compact"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDensity(mode)}
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      density === mode
                        ? "bg-[var(--primary)] text-white"
                        : "border border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {allKeys.length ? (
            <div>
              <p className="mb-2 text-sm text-[var(--muted)]">Visible columns</p>
              <div className="flex flex-wrap gap-2">
                {allKeys.map((key) => {
                  const active = visibleKeys.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setVisibleKeys((current) =>
                          current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        active
                          ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
                          : "border border-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="skeleton h-[480px] rounded-3xl" />
        ) : (
          <>
            <DataTable rows={rows} visibleKeys={visibleKeys} stickyHeader density={density} showFooter />
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[var(--muted)]">
                Showing page {data?.meta.page ?? page} of {data?.meta.totalPages ?? 1} with {data?.meta.total ?? rows.length} filtered rows.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={(data?.meta.page ?? page) <= 1}
                  className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((current) => Math.min(data?.meta.totalPages ?? current + 1, current + 1))}
                  disabled={(data?.meta.page ?? page) >= (data?.meta.totalPages ?? page)}
                  className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-[var(--muted)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
