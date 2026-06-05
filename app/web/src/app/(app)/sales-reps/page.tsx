"use client";

import { ChartBlock } from "@/components/charts/chart-block";
import { RemoteTableCard } from "@/components/tables/remote-table-card";

export default function SalesRepsPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Sales Representative Analytics</h1>
        <p className="mt-2 text-[var(--muted)]">
          Compare rep performance, contribution, and average deal quality across the filtered portfolio.
        </p>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartBlock title="Rep ranking by sales" subtitle="Top line performance leaderboard" endpoint="/sales-reps/ranking" variant="bar" />
        <ChartBlock title="Contribution by quantity" subtitle="Volume leadership by rep" endpoint="/sales-reps/contribution" variant="bar" />
        <ChartBlock title="Average sales amount trend" subtitle="Rep efficiency through time" endpoint="/sales-reps/trend" variant="line" />
        <ChartBlock title="Sales share by rep" subtitle="Contribution spread across the team" endpoint="/sales-reps/ranking" variant="donut" />
      </section>
      <RemoteTableCard title="Sales rep performance table" subtitle="Detailed rep metrics for benchmarking" endpoint="/sales-reps/performance" />
    </div>
  );
}
