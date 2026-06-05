"use client";

import { X } from "lucide-react";
import { useFilters } from "@/components/providers/filter-provider";

export function ActiveFilterBadges() {
  const { draftFilters, setDraftFilters } = useFilters();
  const entries = Object.entries(draftFilters).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Boolean(value);
  });

  if (!entries.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, value]) => (
        <button
          key={key}
          onClick={() => {
            const next = { ...draftFilters };
            delete next[key as keyof typeof next];
            setDraftFilters(next);
          }}
          className="flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]"
        >
          {key}: {Array.isArray(value) ? value.join(", ") : String(value)}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
