"use client";

import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  return (
    <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
      SalesLens / {parts.join(" / ") || "dashboard"}
    </div>
  );
}
