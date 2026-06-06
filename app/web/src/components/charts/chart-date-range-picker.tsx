"use client";

import * as Popover from "@radix-ui/react-popover";
import { format, parseISO } from "date-fns";
import { CalendarDays, ChevronDown, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";

type ChartDateRangeValue = {
  fromDate?: string;
  toDate?: string;
};

function toRange(value: ChartDateRangeValue): DateRange | undefined {
  if (!value.fromDate && !value.toDate) {
    return undefined;
  }

  return {
    from: value.fromDate ? parseISO(`${value.fromDate}T00:00:00`) : undefined,
    to: value.toDate ? parseISO(`${value.toDate}T00:00:00`) : value.fromDate ? parseISO(`${value.fromDate}T00:00:00`) : undefined,
  };
}

function toIso(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toLabel(value: ChartDateRangeValue, minDate?: string, maxDate?: string) {
  if (value.fromDate && value.toDate) {
    return `${format(parseISO(`${value.fromDate}T00:00:00`), "MMM d, yyyy")} - ${format(parseISO(`${value.toDate}T00:00:00`), "MMM d, yyyy")}`;
  }

  if (value.fromDate) {
    return format(parseISO(`${value.fromDate}T00:00:00`), "MMM d, yyyy");
  }

  if (minDate && maxDate) {
    return `${format(parseISO(`${minDate}T00:00:00`), "MMM d")} - ${format(parseISO(`${maxDate}T00:00:00`), "MMM d, yyyy")}`;
  }

  return "Pick a date range";
}

export function ChartDateRangePicker({
  value,
  minDate,
  maxDate,
  onChange,
}: {
  value: ChartDateRangeValue;
  minDate?: string;
  maxDate?: string;
  onChange: (value: ChartDateRangeValue) => void;
}) {
  const min = useMemo(
    () => (minDate ? parseISO(`${minDate}T00:00:00`) : undefined),
    [minDate],
  );
  const max = useMemo(
    () => (maxDate ? parseISO(`${maxDate}T00:00:00`) : undefined),
    [maxDate],
  );
  const committedRange = useMemo(() => toRange(value), [value]);
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(committedRange);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftRange(committedRange);
    }

    setOpen(nextOpen);
  }

  function applyDraftRange() {
    if (!draftRange?.from) {
      onChange({});
      setOpen(false);
      return;
    }

    const fromDate = toIso(draftRange.from);
    const toDate = toIso(draftRange.to ?? draftRange.from);
    onChange({ fromDate, toDate });
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex min-w-[240px] items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2 text-left text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]/40"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Chart range</span>
              <span className="block truncate">{toLabel(value, minDate, maxDate)}</span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)]" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={10}
          align="start"
          collisionPadding={16}
          className="z-40 w-[min(92vw,360px)] max-h-[min(78vh,560px)] overflow-auto rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl shadow-slate-950/20 outline-none"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[var(--foreground)]">Select chart date range</h4>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Available data: {toLabel({ fromDate: minDate, toDate: maxDate })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange({});
                setOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <DayPicker
            mode="range"
            selected={draftRange}
            onSelect={setDraftRange}
            defaultMonth={draftRange?.from ?? min ?? new Date()}
            fixedWeeks
            showOutsideDays
            disabled={[
              ...(min ? [{ before: min }] : []),
              ...(max ? [{ after: max }] : []),
            ]}
            className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_92%,transparent_8%)] p-3"
            classNames={{
              root: "rdp-root w-full",
              months: "flex w-full flex-col",
              month: "w-full space-y-4",
              month_caption: "relative flex items-center justify-center px-10 pt-1",
              caption_label: "text-left text-base font-semibold text-[var(--foreground)]",
              nav: "absolute inset-x-0 top-0 flex items-center justify-between",
              button_previous:
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-transparent text-[var(--foreground)] transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]",
              button_next:
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-transparent text-[var(--foreground)] transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]",
              chevron: "h-4 w-4",
              month_grid: "w-full border-collapse",
              weekdays: "grid grid-cols-7 gap-1",
              weekday:
                "flex h-8 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]",
              weeks: "mt-2 flex flex-col gap-1.5",
              week: "grid grid-cols-7 gap-1",
              day: "flex items-center justify-center p-0",
              day_button:
                "rdp-day_button flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/8",
              outside: "rdp-outside text-[var(--muted)]/35",
              disabled: "rdp-disabled opacity-30",
              today: "rdp-today",
              selected: "rdp-selected",
              range_start: "rdp-range_start",
              range_middle: "rdp-range_middle",
              range_end: "rdp-range_end",
              hidden: "invisible",
            }}
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDraftRange(min && max ? { from: min, to: max } : undefined)}
              className="rounded-2xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Use full data range
            </button>

            <button
              type="button"
              onClick={applyDraftRange}
              className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
            >
              Apply range
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
