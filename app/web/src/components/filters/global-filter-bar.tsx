"use client";

import type { DatePreset, FilterOptionsPayload, GlobalFilters } from "@saleslens/contracts";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useFilters } from "@/components/providers/filter-provider";
import { useApiQuery } from "@/lib/api/hooks";
import { applyDatePreset } from "@/lib/date-utils";
import { countActiveFilters } from "@/lib/filter-utils";
import { ActiveFilterBadges } from "./active-filter-badges";
import { FilterSummary } from "./filter-summary";
import { MultiSelectFilter } from "./multi-select-filter";

const reviewPresets: Array<{ label: string; filters: GlobalFilters }> = [
  { label: "Monthly review", filters: { preset: "last30Days" } },
  { label: "Product review", filters: { preset: "last30Days", productId: [] } },
  { label: "Sales rep review", filters: { preset: "thisQuarter" } },
  { label: "Customer review", filters: { preset: "thisYear" } },
];

export function GlobalFilterBar() {
  const { draftFilters, setDraftFilters, applyFilters, resetFilters, isPending } = useFilters();
  const { data } = useApiQuery<FilterOptionsPayload>("filter-options", "/filters", {});
  const options = data?.data;
  const activeCount = countActiveFilters(draftFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  function setQuickPreset(preset: DatePreset) {
    setDraftFilters({
      ...draftFilters,
      ...applyDatePreset(preset),
    });
  }

  return (
    <section className="sticky top-[88px] z-10 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_86%,transparent_14%)] px-4 py-4 backdrop-blur md:px-8">
      <div className="card-surface rounded-[28px] p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--primary)]/10 p-3 text-[var(--primary)]">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">Global Filters {activeCount ? `(${activeCount} active)` : ""}</h3>
              <FilterSummary />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsExpanded((current) => !current)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
            >
              {isExpanded ? "Hide filters" : "Show filters"}
              <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} />
            </button>
            <button onClick={resetFilters} className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm">
              Reset all
            </button>
            <button
              onClick={applyFilters}
              className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
            >
              {isPending ? "Applying..." : "Apply filters"}
            </button>
          </div>
        </div>

        {isExpanded ? (
          <>
            {options && (
              <div className="mb-4 flex flex-wrap gap-2">
                {options.presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setQuickPreset(preset.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      draftFilters.preset === preset.value
                        ? "bg-[var(--primary)] text-white"
                        : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-[var(--muted)]">From date</span>
                <input
                  type="date"
                  value={draftFilters.fromDate ?? ""}
                  onChange={(event) => setDraftFilters({ ...draftFilters, fromDate: event.target.value })}
                  className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-[var(--muted)]">To date</span>
                <input
                  type="date"
                  value={draftFilters.toDate ?? ""}
                  onChange={(event) => setDraftFilters({ ...draftFilters, toDate: event.target.value })}
                  className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2"
                />
              </label>

              {options && (
                <>
                  <MultiSelectFilter
                    label="Year"
                    options={options.years}
                    value={draftFilters.year ?? []}
                    onChange={(year) => setDraftFilters({ ...draftFilters, year })}
                  />
                  <MultiSelectFilter
                    label="Quarter"
                    options={options.quarters}
                    value={draftFilters.quarter ?? []}
                    onChange={(quarter) => setDraftFilters({ ...draftFilters, quarter })}
                  />
                  <MultiSelectFilter
                    label="Month"
                    options={options.months}
                    value={draftFilters.month ?? []}
                    onChange={(month) => setDraftFilters({ ...draftFilters, month })}
                  />
                  <MultiSelectFilter
                    label="Product"
                    options={options.products}
                    value={draftFilters.productId ?? []}
                    onChange={(productId) => setDraftFilters({ ...draftFilters, productId })}
                  />
                  <MultiSelectFilter
                    label="Customer"
                    options={options.customers}
                    value={draftFilters.customerId ?? []}
                    onChange={(customerId) => setDraftFilters({ ...draftFilters, customerId })}
                  />
                  <MultiSelectFilter
                    label="City"
                    options={options.cities}
                    value={draftFilters.city ?? []}
                    onChange={(city) => setDraftFilters({ ...draftFilters, city })}
                  />
                </>
              )}
            </div>

            {options && (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MultiSelectFilter
                  label="Customer status"
                  options={options.customerStatuses}
                  value={draftFilters.customerStatus ?? []}
                  onChange={(customerStatus) => setDraftFilters({ ...draftFilters, customerStatus })}
                />
                <MultiSelectFilter
                  label="Sales rep"
                  options={options.salesReps}
                  value={draftFilters.salesRepId ?? []}
                  onChange={(salesRepId) => setDraftFilters({ ...draftFilters, salesRepId })}
                />
                <MultiSelectFilter
                  label="Order status"
                  options={options.orderStatuses}
                  value={draftFilters.orderStatus ?? []}
                  onChange={(orderStatus) => setDraftFilters({ ...draftFilters, orderStatus })}
                />
                <MultiSelectFilter
                  label="Payment status"
                  options={options.paymentStatuses}
                  value={draftFilters.paymentStatus ?? []}
                  onChange={(paymentStatus) => setDraftFilters({ ...draftFilters, paymentStatus })}
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {reviewPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    setDraftFilters({
                      ...draftFilters,
                      ...preset.filters,
                      ...applyDatePreset(preset.filters.preset ?? "last30Days"),
                    })
                  }
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
            Open filters to refine the dashboard by date, product, customer, city, or sales team without covering the page content.
          </div>
        )}

        <div className="mt-4">
          <ActiveFilterBadges />
        </div>
      </div>
    </section>
  );
}
