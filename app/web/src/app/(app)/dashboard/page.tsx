"use client";

import type { Insight, OverviewPayload } from "@saleslens/contracts";
import { ChartBlock } from "@/components/charts/chart-block";
import { InsightCard } from "@/components/dashboard/insight-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useFilters } from "@/components/providers/filter-provider";
import { DataTable } from "@/components/tables/data-table";
import { useApiQuery } from "@/lib/api/hooks";

export default function DashboardPage() {
  const { filters } = useFilters();
  const overview = useApiQuery<OverviewPayload>("dashboard-overview", "/dashboard/overview", filters);
  const insights = useApiQuery<Insight[]>("dashboard-insights", "/dashboard/insights", filters);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Executive Overview</h1>
        <p className="mt-2 max-w-3xl text-[var(--muted)]">
          A premium sales cockpit for revenue, discount control, pricing posture, territory performance, and time-based storytelling.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {(overview.data?.data.kpis ?? []).map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {(insights.data?.data ?? []).map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </section>

      <SectionTitle title="Trend Watch" subtitle="Follow the most important changes over time." />
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartBlock title="Sales trend by month" subtitle="Revenue pattern through the timeline" endpoint="/dashboard/sales-trend" variant="line" />
        <ChartBlock title="Quantity trend by month" subtitle="Units sold over time" endpoint="/dashboard/quantity-trend" variant="line" />
        <ChartBlock title="Sales vs discount trend" subtitle="Revenue compared to discount volume" endpoint="/dashboard/sales-discount-trend" variant="combo" />
        <ChartBlock title="Tax by month" subtitle="Collected tax pulse" endpoint="/dashboard/tax-by-month" variant="line" />
        <ChartBlock title="Average unit price trend" subtitle="Pricing posture and ticket quality" endpoint="/dashboard/average-unit-price-trend" variant="line" />
        <ChartBlock title="Cumulative sales" subtitle="Running revenue accumulation" endpoint="/time/cumulative-sales" variant="line" />
      </section>

      <SectionTitle title="Performance Breakdown" subtitle="Compare products, customers, cities, and reps side by side." />
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartBlock title="Top products by sales" subtitle="Top revenue generators" endpoint="/dashboard/top-products-sales" variant="bar" />
        <ChartBlock title="Top products by quantity" subtitle="Most sold product lines" endpoint="/dashboard/top-products-quantity" variant="bar" />
        <ChartBlock title="Sales by city" subtitle="Regional concentration of sales" endpoint="/dashboard/sales-by-city" variant="bar" />
        <ChartBlock title="Sales by customer status" subtitle="Portfolio mix by lifecycle" endpoint="/dashboard/sales-by-customer-status" variant="donut" />
        <ChartBlock title="Sales by sales representative" subtitle="Rep contribution to revenue" endpoint="/dashboard/sales-by-sales-rep" variant="bar" />
        <ChartBlock title="Discount by product" subtitle="Where discount pressure is concentrated" endpoint="/dashboard/discount-by-product" variant="bar" />
        <ChartBlock title="Top customers by sales" subtitle="Highest-value customer relationships" endpoint="/customers/top-customers" variant="bar" />
        <ChartBlock title="Product sales share" subtitle="Revenue distribution across the current portfolio" endpoint="/products/sales-share" variant="donut" />
      </section>

      <section className="card-surface rounded-[32px] p-5">
        <h3 className="text-lg font-semibold">Data table preview</h3>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Quick view of the strongest product rows in the current filter context.
        </p>
        <DataTable rows={overview.data?.data.preview.rows ?? []} stickyHeader showFooter />
      </section>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
    </section>
  );
}
