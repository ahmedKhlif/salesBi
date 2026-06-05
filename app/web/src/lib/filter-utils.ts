import type { GlobalFilters } from "@saleslens/contracts";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { describeDateRange } from "@/lib/date-utils";

const numberKeys = new Set(["year", "quarter", "month", "productId", "customerId", "salesRepId"]);
const arrayKeys = new Set([
  "year",
  "quarter",
  "month",
  "productId",
  "customerId",
  "city",
  "customerStatus",
  "salesRepId",
  "orderStatus",
  "paymentStatus",
]);

export function parseFilters(searchParams: ReadonlyURLSearchParams): GlobalFilters {
  const filters: GlobalFilters = {};

  for (const [key, value] of searchParams.entries()) {
    if (key === "fromDate" || key === "toDate" || key === "preset") {
      filters[key] = value as never;
      continue;
    }

    if (!arrayKeys.has(key)) {
      continue;
    }

    const values = searchParams.getAll(key);
    filters[key as keyof GlobalFilters] = (
      numberKeys.has(key) ? values.map(Number).filter((item) => !Number.isNaN(item)) : values
    ) as never;
  }

  return filters;
}

export function serializeFilters(filters: GlobalFilters) {
  const params = new URLSearchParams();
  const entries = Object.entries(filters).filter(([, value]) => {
    if (value === undefined || value === null || value === "") {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  });

  for (const [key, value] of entries) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export function toFilterSummary(filters: GlobalFilters) {
  if (filters.fromDate || filters.toDate) {
    return `Showing sales for ${describeDateRange(filters.fromDate, filters.toDate)}`;
  }
  if (filters.year?.length) {
    return `Showing selected years: ${filters.year.join(", ")}`;
  }
  return "Showing all available sales periods";
}

export function countActiveFilters(filters: GlobalFilters) {
  return Object.values(filters).reduce((total, value) => {
    if (Array.isArray(value)) {
      return total + (value.length ? 1 : 0);
    }
    return total + (value ? 1 : 0);
  }, 0);
}
