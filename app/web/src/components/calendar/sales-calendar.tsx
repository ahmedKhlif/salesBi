"use client";

import type { CalendarEventPayload, GlobalFilters, SeriesPoint } from "@saleslens/contracts";
import { Calendar, dateFnsLocalizer, Event, Views } from "react-big-calendar";
import { format, getDay, parse, parseISO, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExportMenu } from "@/components/export/export-menu";
import { useFilters } from "@/components/providers/filter-provider";
import { useApiQuery } from "@/lib/api/hooks";
import { fetchApi } from "@/lib/api/client";
import { ChartCard } from "@/components/charts/chart-card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    "en-US": enUS,
  },
});

export function SalesCalendar() {
  const { filters } = useFilters();
  const { data, isLoading } = useApiQuery<CalendarEventPayload[]>("calendar-events", "/calendar/events", filters);
  const { data: bestDays } = useApiQuery<SeriesPoint[]>("calendar-best-days", "/calendar/best-days", filters);
  const [selected, setSelected] = useState<CalendarEventPayload | null>(null);

  const { data: dayDetails, isLoading: isDayLoading } = useQuery({
    queryKey: ["calendar-day-details", filters, selected?.date],
    queryFn: () => fetchApi<Record<string, unknown>>("/calendar/day-details", { ...filters, date: selected?.date } as GlobalFilters),
    enabled: Boolean(selected?.date),
  });

  const events = useMemo(
    () =>
      (data?.data ?? []).map((event) => ({
        ...event,
        start: parseISO(`${event.date}T00:00:00`),
        end: parseISO(`${event.date}T23:59:59`),
        title: event.title,
      })),
    [data?.data],
  );

  const baseDate = useMemo(() => {
    if (filters.fromDate) {
      return parseISO(`${filters.fromDate}T00:00:00`);
    }

    if (events[0]?.date) {
      return parseISO(`${events[0].date}T00:00:00`);
    }

    return new Date();
  }, [events, filters.fromDate]);

  const bestDay = (bestDays?.data ?? []).at(0);
  const worstDay = [...(bestDays?.data ?? [])].sort((left, right) => left.value - right.value)[0];
  const activeDays = events.length;
  const averageDailySales = activeDays
    ? events.reduce((sum, event) => sum + event.sales, 0) / activeDays
    : 0;

  const kpis = [
    {
      label: "Best sales day",
      value: bestDay?.label ?? "N/A",
      detail: bestDay ? formatCurrency(bestDay.value) : "No data",
    },
    {
      label: "Worst sales day",
      value: worstDay?.label ?? "N/A",
      detail: worstDay ? formatCurrency(worstDay.value) : "No data",
    },
    {
      label: "Average daily sales",
      value: formatCurrency(averageDailySales),
      detail: `${activeDays} active days`,
    },
    {
      label: "Active sales days",
      value: formatNumber(activeDays),
      detail: "Within the current filter window",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="card-surface rounded-[28px] p-5">
            <p className="text-sm text-[var(--muted)]">{kpi.label}</p>
            <h3 className="mt-3 text-xl font-semibold">{kpi.value}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{kpi.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <CalendarWorkspace
          key={baseDate.toISOString()}
          baseDate={baseDate}
          events={events}
          isLoading={isLoading}
          onSelect={(event) => setSelected(event)}
        />

        <div className="space-y-6">
          <ChartCard title="Daily Drill-Down" subtitle="Detailed view for the selected calendar event">
            {!selected ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
                Click any day on the calendar to view daily sales, discount, tax, product, customer, and rep details.
              </div>
            ) : isDayLoading ? (
              <div className="skeleton h-64 rounded-3xl" />
            ) : (
              <div className="space-y-4 text-sm">
                <div className="rounded-2xl bg-[var(--primary)]/10 p-4">
                  <p className="text-[var(--muted)]">Selected date</p>
                  <h4 className="mt-2 text-xl font-semibold">{String(dayDetails?.data.date ?? selected.date)}</h4>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <DetailItem label="Total Sales" value={formatCurrency(Number(dayDetails?.data.totalSales ?? selected.sales))} />
                  <DetailItem label="Net Sales Without Tax" value={formatCurrency(Number(dayDetails?.data.netSalesWithoutTax ?? 0))} />
                  <DetailItem label="Total Quantity Sold" value={formatNumber(Number(dayDetails?.data.totalQuantitySold ?? selected.quantity))} />
                  <DetailItem label="Number of Sales Lines" value={formatNumber(Number(dayDetails?.data.numberOfSalesLines ?? 0))} />
                  <DetailItem label="Total Discount" value={formatCurrency(Number(dayDetails?.data.totalDiscount ?? selected.discount))} />
                  <DetailItem label="Discount Rate" value={formatPercent(Number(dayDetails?.data.discountRate ?? 0))} />
                  <DetailItem label="Total Tax" value={formatCurrency(Number(dayDetails?.data.totalTax ?? selected.tax))} />
                  <DetailItem label="Top Product" value={String(dayDetails?.data.topProduct ?? "N/A")} />
                  <DetailItem label="Top Customer" value={String(dayDetails?.data.topCustomer ?? "N/A")} />
                  <DetailItem label="Top Sales Rep" value={String(dayDetails?.data.topSalesRep ?? "N/A")} />
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function CalendarWorkspace({
  baseDate,
  events,
  isLoading,
  onSelect,
}: {
  baseDate: Date;
  events: (CalendarEventPayload & { start: Date; end: Date; title: string })[];
  isLoading: boolean;
  onSelect: (event: CalendarEventPayload) => void;
}) {
  const [currentDate, setCurrentDate] = useState(baseDate);

  return (
    <ChartCard
      title="Sales Calendar"
      subtitle="Month, week, day, and agenda views for daily sales intensity"
      actions={
        <ExportMenu
          title="sales-calendar-report"
          rows={events.map((event) => ({
            id: event.id,
            date: event.date,
            title: event.title,
            sales: event.sales,
            quantity: event.quantity,
            discount: event.discount,
            tax: event.tax,
            level: event.level,
          }))}
        />
      }
    >
      {isLoading ? (
        <div className="skeleton h-[620px] rounded-3xl" />
      ) : !events.length ? (
        <div className="flex h-[620px] items-center justify-center rounded-3xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
          No calendar events are available for the active filters.
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          culture="en-US"
          date={currentDate}
          events={events as Event[]}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          style={{ height: 620 }}
          onNavigate={(nextDate) => setCurrentDate(nextDate)}
          eventPropGetter={(event) => {
            const level = (event as CalendarEventPayload).level;
            return {
              style: {
                backgroundColor:
                  level === "high"
                    ? "rgba(34,197,94,0.85)"
                    : level === "medium"
                      ? "rgba(245,158,11,0.85)"
                      : "rgba(37,99,235,0.85)",
                borderRadius: "12px",
                border: "none",
                color: "white",
              },
            };
          }}
          onSelectEvent={(event) => onSelect(event as unknown as CalendarEventPayload)}
        />
      )}
    </ChartCard>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-4">
      <p className="text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
