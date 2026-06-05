"use client";

import { ChartBlock } from "@/components/charts/chart-block";
import { RemoteTableCard } from "@/components/tables/remote-table-card";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Product Analytics</h1>
        <p className="mt-2 text-[var(--muted)]">
          Track product contribution, pricing posture, sales velocity, and discount pressure across the BI portfolio.
        </p>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartBlock title="Top products by sales" subtitle="Best revenue contributors" endpoint="/products/top-sales" variant="bar" />
        <ChartBlock title="Top products by quantity" subtitle="Best volume contributors" endpoint="/products/top-quantity" variant="bar" />
        <ChartBlock title="Sales share by product" subtitle="Revenue distribution across products" endpoint="/products/sales-share" variant="donut" />
        <ChartBlock title="Price comparison" subtitle="List price versus standard cost" endpoint="/products/price-comparison" variant="combo" />
      </section>
      <RemoteTableCard title="Product performance table" subtitle="Detailed product metrics for analysis and export" endpoint="/products/performance" />
    </div>
  );
}
