"use client";

import { useSyncExternalStore } from "react";
import { Moon, RefreshCcw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Breadcrumbs } from "./breadcrumbs";
import { ApiStatus } from "./api-status";

function subscribe() {
  return () => {};
}

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_82%,transparent_18%)] px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Breadcrumbs />
          <h2 className="mt-2 text-2xl font-semibold">Enterprise sales analytics for your BI project</h2>
        </div>
        <div className="flex items-center gap-3">
          <ApiStatus />
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-[var(--border)] p-2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full border border-[var(--border)] p-2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
            aria-label="Toggle theme"
          >
            {mounted ? <>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</> : <span className="block h-4 w-4" />}
          </button>
          <div className="rounded-full border border-[var(--border)] px-3 py-2 text-sm">Ahmed BI</div>
        </div>
      </div>
    </header>
  );
}
