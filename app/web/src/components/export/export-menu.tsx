"use client";

import { Download } from "lucide-react";
import { exportCsv } from "@/lib/export/csv";
import { exportExcel } from "@/lib/export/excel";
import { exportPdf } from "@/lib/export/pdf";

export function ExportMenu({
  title,
  rows,
}: {
  title: string;
  rows: object[];
}) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => exportCsv(`${slug}.csv`, rows as Record<string, unknown>[])} className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm">
        <Download className="mr-2 inline h-4 w-4" />
        CSV
      </button>
      <button onClick={() => exportExcel(`${slug}.xlsx`, rows as Record<string, unknown>[])} className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm">
        Excel
      </button>
      <button onClick={() => exportPdf(`${slug}.pdf`, title, rows as Record<string, unknown>[])} className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm">
        PDF
      </button>
    </div>
  );
}
