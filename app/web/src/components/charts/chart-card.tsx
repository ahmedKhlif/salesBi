import type { PropsWithChildren, ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  actions,
  children,
}: PropsWithChildren<{ title: string; subtitle: string; actions?: ReactNode }>) {
  return (
    <section className="card-surface chart-shell min-w-0 overflow-hidden rounded-[32px] p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-[var(--muted)]">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
