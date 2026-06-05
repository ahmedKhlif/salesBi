"use client";

import { ChartBlock } from "@/components/charts/chart-block";
import { RemoteTableCard } from "@/components/tables/remote-table-card";

export default function CustomersPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Customer Analytics</h1>
        <p className="mt-2 text-[var(--muted)]">
          Measure customer value, city concentration, account status mix, and customer growth patterns.
        </p>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartBlock title="Sales by city" subtitle="Regional revenue view" endpoint="/customers/sales-by-city" variant="bar" />
        <ChartBlock title="Sales by customer status" subtitle="Customer lifecycle breakdown" endpoint="/customers/sales-by-status" variant="donut" />
        <ChartBlock title="Top customers by sales" subtitle="Highest value accounts" endpoint="/customers/top-customers" variant="bar" />
        <ChartBlock title="Customer registration trend" subtitle="Customer onboarding momentum" endpoint="/customers/registration-trend" variant="line" />
      </section>
      <RemoteTableCard title="Customer performance table" subtitle="Customer value, mix, and payment profile" endpoint="/customers/performance" />
    </div>
  );
}
