"use client";

import type { GlobalFilters } from "@saleslens/contracts";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseFilters, serializeFilters } from "@/lib/filter-utils";

const FILTER_STORAGE_KEY = "saleslens:last-filters";

interface FilterContextValue {
  filters: GlobalFilters;
  draftFilters: GlobalFilters;
  setDraftFilters: (filters: GlobalFilters) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  isPending: boolean;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: PropsWithChildren) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const filterKey = useMemo(() => serializeFilters(filters), [filters]);

  return (
    <FilterProviderState key={filterKey} filters={filters}>
      {children}
    </FilterProviderState>
  );
}

function FilterProviderState({
  children,
  filters,
}: PropsWithChildren<{ filters: GlobalFilters }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draftFilters, setDraftFilters] = useState<GlobalFilters>(filters);

  useEffect(() => {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      draftFilters,
      setDraftFilters,
      applyFilters: () => {
        startTransition(() => {
          const query = serializeFilters(draftFilters);
          router.push(query ? `${pathname}?${query}` : pathname);
        });
      },
      resetFilters: () => {
        startTransition(() => {
          setDraftFilters({});
          router.push(pathname);
        });
      },
      isPending,
    }),
    [draftFilters, filters, isPending, pathname, router],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}
