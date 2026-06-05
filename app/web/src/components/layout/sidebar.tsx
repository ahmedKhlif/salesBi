"use client";

import { BarChart3, Boxes, CalendarDays, FileText, Home, Search, Settings, Timer, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/products", label: "Products", icon: Boxes },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/sales-reps", label: "Sales Reps", icon: UserCheck },
  { href: "/time-analysis", label: "Time Analysis", icon: Timer },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/explorer", label: "Explorer", icon: Search },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_88%,transparent_12%)] px-5 py-6 lg:flex lg:flex-col">
      <div className="mb-8 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(20,184,166,0.18))] p-5 text-white">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">SalesLens BI</p>
        <h1 className="mt-3 text-2xl font-semibold">Modern sales intelligence</h1>
        <p className="mt-2 text-sm text-white/80">Powered by your SSAS cube, demo-ready in mock mode.</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-blue-500/20"
                  : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--foreground)] dark:hover:bg-slate-900/60",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-[var(--border)] p-4 text-sm text-[var(--muted)] card-surface">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[var(--secondary)]" />
          Ready for presentation
        </div>
        <p>Live warehouse mode and mock mode are both supported, with the backend already shaped for the next MDX connectivity step.</p>
      </div>
    </aside>
  );
}
