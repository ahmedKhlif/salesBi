"use client";

import { formatDate } from "@/lib/date-utils";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

function isCurrencyKey(key: string) {
  return ["sales", "price", "discount", "tax", "cost", "amount", "margin"].some((token) =>
    key.toLowerCase().includes(token),
  );
}

function isPercentKey(key: string) {
  return key.toLowerCase().includes("rate") || key.toLowerCase().includes("percent");
}

function formatCell(key: string, value: unknown) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && key.toLowerCase().includes("date")) {
    return formatDate(value);
  }

  if (typeof value !== "number") {
    return String(value);
  }

  if (isPercentKey(key) || (value > 0 && value < 1)) {
    return formatPercent(value);
  }

  if (isCurrencyKey(key)) {
    return formatCurrency(value);
  }

  return formatNumber(value);
}

function buildFooter(keys: string[], rows: Record<string, unknown>[]) {
  return keys.reduce<Record<string, string>>((accumulator, key) => {
    const numericValues = rows.map((row) => row[key]).filter((value): value is number => typeof value === "number");
    if (!numericValues.length) {
      accumulator[key] = "";
      return accumulator;
    }

    const total = numericValues.reduce((sum, value) => sum + value, 0);
    accumulator[key] = formatCell(key, total);
    return accumulator;
  }, {});
}

export function DataTable({
  rows,
  visibleKeys,
  stickyHeader = false,
  density = "comfortable",
  showFooter = false,
}: {
  rows: object[];
  visibleKeys?: string[];
  stickyHeader?: boolean;
  density?: "comfortable" | "compact";
  showFooter?: boolean;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-sm text-[var(--muted)]">
        No rows match the active filters.
      </div>
    );
  }

  const normalizedRows = rows as Record<string, unknown>[];
  const keys = (visibleKeys?.length ? visibleKeys : Object.keys(normalizedRows[0])).filter((key) => key in normalizedRows[0]);
  const footer = showFooter ? buildFooter(keys, normalizedRows) : null;
  const cellPadding = density === "compact" ? "px-3 py-2" : "px-4 py-3";

  return (
    <div className="max-w-full overflow-auto rounded-[28px] border border-[var(--border)]">
      <table className="min-w-full border-collapse text-sm">
        <thead className={`bg-black/5 dark:bg-white/5 ${stickyHeader ? "sticky top-0 z-10" : ""}`}>
          <tr>
            {keys.map((key) => (
              <th key={key} className={`${cellPadding} text-left font-medium text-[var(--muted)]`}>
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {normalizedRows.map((row, index) => (
            <tr key={index} className="border-t border-[var(--border)]">
              {keys.map((key) => (
                <td key={`${index}-${key}`} className={cellPadding}>
                  {formatCell(key, row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot className="border-t border-[var(--border)] bg-black/5 font-medium dark:bg-white/5">
            <tr>
              {keys.map((key, index) => (
                <td key={`footer-${key}`} className={cellPadding}>
                  {index === 0 ? "Totals" : footer[key]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
