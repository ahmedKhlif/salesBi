"use client";

import type { MetricCard } from "@saleslens/contracts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatPercent } from "@/lib/formatters";

export function KpiCard({ metric }: { metric: MetricCard }) {
  return (
    <article className="card-surface rounded-[28px] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">{metric.title}</p>
          <h3 className="mt-2 text-3xl font-semibold">{metric.value}</h3>
        </div>
        <div
          className={`rounded-2xl p-3 ${
            metric.trendDirection === "down"
              ? "bg-[var(--red)]/10 text-[var(--red)]"
              : "bg-[var(--green)]/10 text-[var(--green)]"
          }`}
        >
          {metric.trendDirection === "down" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">{metric.subtitle}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{metric.trendLabel}</span>
        <span>{formatPercent(metric.trendValue)}</span>
      </div>
      <div className="mt-4 flex gap-1">
        {metric.sparkline.map((item, index) => (
          <span
            key={`${metric.id}-${index}`}
            className="block h-10 flex-1 rounded-full bg-[var(--primary)]/15"
            style={{ height: `${12 + (item % 28)}px` }}
          />
        ))}
      </div>
    </article>
  );
}
