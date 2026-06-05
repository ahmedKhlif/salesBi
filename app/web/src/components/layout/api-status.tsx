"use client";

import { useApiQuery } from "@/lib/api/hooks";

export function ApiStatus() {
  const { data, isError } = useApiQuery<{ status: string; mode: string; timestamp: string }>(
    "health",
    "/",
    {},
  );

  const tone = isError ? "bg-[var(--red)]" : "bg-[var(--green)]";
  const label = isError ? "API unreachable" : `${data?.data.mode ?? "mock"} mode`;
  const timestamp = data?.data.timestamp
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Africa/Tunis",
      }).format(new Date(data.data.timestamp))
    : "Pending";

  return (
    <div className="rounded-2xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
      <div className="flex items-center gap-2">
        <span className={`status-dot ${tone}`} />
        {label}
      </div>
      <p className="mt-1">Last refresh {timestamp}</p>
    </div>
  );
}
