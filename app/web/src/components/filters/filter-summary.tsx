"use client";

import { useFilters } from "@/components/providers/filter-provider";
import { toFilterSummary } from "@/lib/filter-utils";

export function FilterSummary() {
  const { draftFilters } = useFilters();
  return <p className="text-sm text-[var(--muted)]">{toFilterSummary(draftFilters)}</p>;
}
