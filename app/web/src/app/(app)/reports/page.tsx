"use client";

import type { OverviewPayload, TablePayload } from "@saleslens/contracts";
import { ExportMenu } from "@/components/export/export-menu";
import { useFilters } from "@/components/providers/filter-provider";
import { DataTable } from "@/components/tables/data-table";
import { useApiQuery } from "@/lib/api/hooks";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";
import { toFilterSummary } from "@/lib/filter-utils";

export default function ReportsPage() {
  const { filters } = useFilters();
  const summaryReport = useApiQuery<{ overview: OverviewPayload; summary: Record<string, string | number | boolean | null> }>(
    "report-summary",
    "/reports/summary",
    filters,
  );
  const productReport = useApiQuery<TablePayload<Record<string, unknown>>>("report-products", "/reports/product-performance", filters);
  const customerReport = useApiQuery<TablePayload<Record<string, unknown>>>("report-customers", "/reports/customer-performance", filters);
  const repReport = useApiQuery<TablePayload<Record<string, unknown>>>("report-reps", "/reports/sales-rep-performance", filters);

  const summary = summaryReport.data?.data.summary ?? {};
  const cards = [
    { title: "Sales Summary Report", rows: summaryReport.data?.data.overview.preview.rows ?? [], subtitle: "Executive overview metrics and strongest product rows." },
    { title: "Product Performance Report", rows: productReport.data?.data.rows ?? [], subtitle: "Revenue, margin proxy, quantity, and pricing by product." },
    { title: "Customer Performance Report", rows: customerReport.data?.data.rows ?? [], subtitle: "Customer value, city mix, and discount behavior." },
    { title: "Sales Rep Performance Report", rows: repReport.data?.data.rows ?? [], subtitle: "Rep ranking, sales contribution, and discount posture." },
    { title: "Time Analysis Report", rows: summaryReport.data?.data.overview.preview.rows ?? [], subtitle: "Filtered snapshot ready for timeline commentary and PDF export." },
    { title: "Calendar Report", rows: summaryReport.data?.data.overview.preview.rows ?? [], subtitle: "Daily sales summary deck for calendar-driven presentations." },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Reports & Exports</h1>
        <p className="mt-2 text-[var(--muted)]">
          Generate polished report payloads and export filtered data to CSV, Excel, and PDF.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric label="Total sales" value={formatCurrency(Number(summary.totalSales ?? 0))} />
        <SummaryMetric label="Net sales without tax" value={formatCurrency(Number(summary.netSalesWithoutTax ?? 0))} />
        <SummaryMetric label="Sales lines" value={formatNumber(Number(summary.numberOfSalesLines ?? 0))} />
        <SummaryMetric label="Discount rate" value={formatPercent(Number(summary.discountRate ?? 0))} />
      </section>

      <section className="card-surface rounded-[32px] p-5">
        <h3 className="text-lg font-semibold">Report header preview</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">{toFilterSummary(filters)}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Generated from {summaryReport.data?.meta.source ?? "mock"} mode at {summaryReport.data?.meta.generatedAt ?? "pending"}.
        </p>
        <div className="mt-4">
          <DataTable rows={summaryReport.data?.data.overview.preview.rows ?? []} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="card-surface rounded-[32px] p-5">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{card.subtitle}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{toFilterSummary(filters)}</p>
            <div className="mt-5">
              <ExportMenu title={card.title} rows={card.rows} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="card-surface rounded-[28px] p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="mt-3 text-2xl font-semibold">{value}</h3>
    </article>
  );
}
