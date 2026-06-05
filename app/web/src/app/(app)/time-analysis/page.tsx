"use client";

import { ChartBlock } from "@/components/charts/chart-block";

export default function TimeAnalysisPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Time Analysis</h1>
        <p className="mt-2 text-[var(--muted)]">
          Follow performance across year, quarter, month, day, heatmaps, and cumulative momentum.
        </p>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartBlock title="Sales by year" subtitle="Annual view of sales" endpoint="/time/sales-by-year" variant="bar" />
        <ChartBlock title="Sales by quarter" subtitle="Quarter-over-quarter comparison" endpoint="/time/sales-by-quarter" variant="bar" />
        <ChartBlock title="Sales by month" subtitle="Month trend" endpoint="/time/sales-by-month" variant="line" />
        <ChartBlock title="Sales by day" subtitle="Daily volatility" endpoint="/time/sales-by-day" variant="line" />
        <ChartBlock title="Calendar heatmap feed" subtitle="Daily intensity feed for dense analysis" endpoint="/time/calendar-heatmap" variant="bar" />
        <ChartBlock title="Cumulative sales" subtitle="Running revenue accumulation" endpoint="/time/cumulative-sales" variant="line" />
      </section>
    </div>
  );
}
