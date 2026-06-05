"use client";

import type { FilterOption } from "@saleslens/contracts";
import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface MultiSelectFilterProps<T extends string | number> {
  label: string;
  options: FilterOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
}

export function MultiSelectFilter<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: MultiSelectFilterProps<T>) {
  const [search, setSearch] = useState("");
  const selectedValues = useMemo(() => new Set(value.map(String)), [value]);
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase().trim()),
      ),
    [options, search],
  );
  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => selectedValues.has(String(option.value)))
        .map((option) => option.label),
    [options, selectedValues],
  );

  function toggleOption(optionValue: T) {
    const exists = value.some((item) => String(item) === String(optionValue));
    onChange(exists ? value.filter((item) => String(item) !== String(optionValue)) : [...value, optionValue]);
  }

  const summary =
    selectedLabels.length === 0
      ? `All ${label.toLowerCase()}`
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.length} selected`;

  return (
    <div className="relative text-sm">
      <div className="mb-2 flex items-center justify-between font-medium text-[var(--muted)]">
        <span>{label}</span>
        <span className="text-xs">{value.length} selected</span>
      </div>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2 text-left text-[var(--foreground)]">
          <span className="truncate">{summary}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)] transition group-open:rotate-180" />
        </summary>

        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xl shadow-slate-950/20">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="w-full rounded-2xl border border-[var(--border)] bg-transparent py-2 pl-9 pr-3"
            />
          </div>

          <div className="mt-3 max-h-64 space-y-1 overflow-auto pr-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const selected = selectedValues.has(String(option.value));

                return (
                  <button
                    key={`${label}-${option.value}`}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition ${
                      selected
                        ? "bg-[var(--primary)]/10 text-[var(--foreground)]"
                        : "hover:bg-[color-mix(in_srgb,var(--card)_74%,white_26%)] dark:hover:bg-slate-900/70"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--muted)]">
                No matching options
              </p>
            )}
          </div>

          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-3 w-full rounded-2xl border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Clear {label.toLowerCase()}
            </button>
          )}
        </div>
      </details>
    </div>
  );
}
