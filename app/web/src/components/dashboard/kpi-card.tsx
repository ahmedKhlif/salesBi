"use client";

import type { MetricCard } from "@saleslens/contracts";
import {
  BadgePercent,
  Boxes,
  DollarSign,
  Minus,
  Package,
  Receipt,
  Scale,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatCompactCurrency, formatCompactNumber, formatPercent } from "@/lib/formatters";

const metricMeta: Record<
  string,
  {
    icon: LucideIcon;
    accentClass: string;
    orbClass: string;
    compact: (value: number) => string;
  }
> = {
  sales: {
    icon: DollarSign,
    accentClass: "bg-[var(--primary)]/12 text-[var(--primary)]",
    orbClass: "from-[var(--primary)]/20 to-transparent",
    compact: formatCompactCurrency,
  },
  "net-sales": {
    icon: Scale,
    accentClass: "bg-[var(--secondary)]/12 text-[var(--secondary)]",
    orbClass: "from-[var(--secondary)]/20 to-transparent",
    compact: formatCompactCurrency,
  },
  quantity: {
    icon: Package,
    accentClass: "bg-[var(--amber)]/12 text-[var(--amber)]",
    orbClass: "from-[var(--amber)]/18 to-transparent",
    compact: formatCompactNumber,
  },
  lines: {
    icon: Boxes,
    accentClass: "bg-[var(--cyan)]/12 text-[var(--cyan)]",
    orbClass: "from-[var(--cyan)]/18 to-transparent",
    compact: formatCompactNumber,
  },
  "avg-unit-price": {
    icon: DollarSign,
    accentClass: "bg-[var(--green)]/12 text-[var(--green)]",
    orbClass: "from-[var(--green)]/18 to-transparent",
    compact: formatCompactCurrency,
  },
  "avg-sales": {
    icon: TrendingUp,
    accentClass: "bg-[var(--purple)]/12 text-[var(--purple)]",
    orbClass: "from-[var(--purple)]/18 to-transparent",
    compact: formatCompactCurrency,
  },
  discount: {
    icon: BadgePercent,
    accentClass: "bg-[var(--amber)]/12 text-[var(--amber)]",
    orbClass: "from-[var(--amber)]/18 to-transparent",
    compact: formatCompactCurrency,
  },
  "discount-rate": {
    icon: BadgePercent,
    accentClass: "bg-[var(--red)]/12 text-[var(--red)]",
    orbClass: "from-[var(--red)]/18 to-transparent",
    compact: formatPercent,
  },
  tax: {
    icon: Receipt,
    accentClass: "bg-[var(--cyan)]/12 text-[var(--cyan)]",
    orbClass: "from-[var(--cyan)]/18 to-transparent",
    compact: formatCompactCurrency,
  },
  "avg-tax": {
    icon: Receipt,
    accentClass: "bg-[var(--purple)]/12 text-[var(--purple)]",
    orbClass: "from-[var(--purple)]/18 to-transparent",
    compact: formatCompactCurrency,
  },
};

function getTrendMeta(direction: MetricCard["trendDirection"]) {
  if (direction === "up") {
    return {
      icon: TrendingUp,
      chipClass: "bg-[var(--green)]/12 text-[var(--green)]",
      barClass: "bg-[var(--green)]/18",
      label: "Positive trend",
    };
  }

  if (direction === "down") {
    return {
      icon: TrendingDown,
      chipClass: "bg-[var(--red)]/12 text-[var(--red)]",
      barClass: "bg-[var(--red)]/18",
      label: "Negative trend",
    };
  }

  return {
    icon: Minus,
    chipClass: "bg-white/6 text-[var(--muted)] dark:bg-white/6",
    barClass: "bg-[var(--primary)]/14",
    label: "Stable trend",
  };
}

export function KpiCard({ metric }: { metric: MetricCard }) {
  const visual = metricMeta[metric.id] ?? metricMeta.sales;
  const trend = getTrendMeta(metric.trendDirection);
  const Icon = visual.icon;
  const TrendIcon = trend.icon;
  const compactValue = visual.compact(metric.rawValue);
  const sparkMin = Math.min(...metric.sparkline);
  const sparkMax = Math.max(...metric.sparkline);
  const sparkSpread = Math.max(1, sparkMax - sparkMin);

  return (
    <article className="card-surface relative min-h-[248px] overflow-hidden rounded-[30px] p-5">
      <div
        className={`pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl ${visual.orbClass}`}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {metric.title}
            </p>
            <p className="mt-3 text-[clamp(2rem,2.4vw,2.9rem)] font-semibold leading-none tracking-tight">
              {compactValue}
            </p>
            <p className="mt-2 truncate text-xs text-[var(--muted)]" title={metric.value}>
              Full value: {metric.value}
            </p>
          </div>

          <div className={`shrink-0 rounded-2xl p-3 ${visual.accentClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">{metric.subtitle}</p>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${trend.chipClass}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend.label}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>{metric.trendLabel}</span>
          <span className="font-semibold">{formatPercent(metric.trendValue)}</span>
        </div>

        <div className="mt-auto pt-5">
          <div className="rounded-[24px] border border-white/6 bg-black/10 px-3 py-4 dark:bg-white/[0.03]">
            <div className="flex h-14 items-end gap-2">
              {metric.sparkline.map((item, index) => {
                const height = 12 + ((item - sparkMin) / sparkSpread) * 34;

                return (
                  <span
                    key={`${metric.id}-${index}`}
                    className={`block flex-1 rounded-full ${trend.barClass}`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
