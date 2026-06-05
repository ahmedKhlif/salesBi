import type { GlobalFilters } from "./filters";

export interface ApiMeta {
  source: "mock" | "ssas";
  generatedAt: string;
  lastRefresh: string;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
  appliedFilters: GlobalFilters;
  summary?: Record<string, string | number | boolean | null>;
}

export interface Insight {
  id: string;
  title: string;
  value: string;
  tone: "positive" | "warning" | "neutral";
  description: string;
}

export interface HealthPayload {
  status: "ok" | "degraded";
  mode: "mock" | "ssas";
  timestamp: string;
}
