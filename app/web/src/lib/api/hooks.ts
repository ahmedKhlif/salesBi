"use client";

import type { GlobalFilters } from "@saleslens/contracts";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./client";

export function useApiQuery<T>(key: string, path: string, filters: GlobalFilters) {
  return useQuery({
    queryKey: [key, filters],
    queryFn: () => fetchApi<T>(path, filters),
  });
}
