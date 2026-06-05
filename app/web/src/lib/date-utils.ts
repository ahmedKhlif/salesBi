import type { DatePreset, GlobalFilters } from "@saleslens/contracts";
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";

function toIso(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function formatDate(value: string, mask = "MMM d, yyyy") {
  return format(parseISO(value), mask);
}

export function applyDatePreset(
  preset: DatePreset,
  today = new Date(),
): Pick<GlobalFilters, "fromDate" | "toDate" | "preset"> {
  const current = new Date(today);

  switch (preset) {
    case "today":
      return { fromDate: toIso(current), toDate: toIso(current), preset };
    case "yesterday": {
      const yesterday = subDays(current, 1);
      return { fromDate: toIso(yesterday), toDate: toIso(yesterday), preset };
    }
    case "last7Days":
      return { fromDate: toIso(subDays(current, 6)), toDate: toIso(current), preset };
    case "last30Days":
      return { fromDate: toIso(subDays(current, 29)), toDate: toIso(current), preset };
    case "thisMonth":
      return {
        fromDate: toIso(startOfMonth(current)),
        toDate: toIso(endOfMonth(current)),
        preset,
      };
    case "lastMonth": {
      const lastMonth = subMonths(current, 1);
      return {
        fromDate: toIso(startOfMonth(lastMonth)),
        toDate: toIso(endOfMonth(lastMonth)),
        preset,
      };
    }
    case "thisQuarter":
      return {
        fromDate: toIso(startOfQuarter(current)),
        toDate: toIso(endOfQuarter(current)),
        preset,
      };
    case "thisYear":
      return {
        fromDate: toIso(startOfYear(current)),
        toDate: toIso(endOfYear(current)),
        preset,
      };
    case "custom":
    default:
      return { preset };
  }
}

export function describeDateRange(fromDate?: string, toDate?: string) {
  if (fromDate && toDate) {
    return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
  }
  if (fromDate) {
    return `from ${formatDate(fromDate)}`;
  }
  if (toDate) {
    return `through ${formatDate(toDate)}`;
  }
  return "all available periods";
}
