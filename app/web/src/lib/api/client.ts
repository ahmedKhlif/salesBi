import type { ApiResponse, GlobalFilters } from "@saleslens/contracts";
import { serializeFilters } from "@/lib/filter-utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function fetchApi<T>(path: string, filters?: GlobalFilters): Promise<ApiResponse<T>> {
  const query = filters ? serializeFilters(filters) : "";
  const url = `${API_BASE}${path}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return response.json();
}
