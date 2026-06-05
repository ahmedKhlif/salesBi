"use client";

import type { Insight } from "@saleslens/contracts";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="card-surface rounded-[28px] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted)]">{insight.title}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            insight.tone === "positive"
              ? "bg-[var(--green)]/10 text-[var(--green)]"
              : insight.tone === "warning"
                ? "bg-[var(--amber)]/10 text-[var(--amber)]"
                : "bg-[var(--primary)]/10 text-[var(--primary)]"
          }`}
        >
          {insight.tone}
        </span>
      </div>
      <h4 className="mt-4 text-xl font-semibold">{insight.value}</h4>
      <p className="mt-2 text-sm text-[var(--muted)]">{insight.description}</p>
    </article>
  );
}
