"use client";

import { useEffect } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const SETTINGS_STORAGE_KEY = "saleslens:settings";

type SettingsForm = {
  themeMode: string;
  currency: string;
  numberFormat: string;
  defaultPage: string;
  defaultDateRange: string;
  cubeMode: string;
  exportPreference: string;
};

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const form = useForm<SettingsForm>({
    defaultValues: {
      themeMode: "system",
      currency: "TND",
      numberFormat: "en-US",
      defaultPage: "/dashboard",
      defaultDateRange: "last30Days",
      cubeMode: "ssas",
      exportPreference: "pdf",
    },
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      form.reset(JSON.parse(stored) as SettingsForm);
    }
  }, [form]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-[var(--muted)]">
          Control demo preferences such as theme, currency, default landing page, and analytics mode.
        </p>
      </section>
      <form
        onSubmit={form.handleSubmit((values) => {
          window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(values));
          setTheme(values.themeMode);
          toast.success("Settings saved locally for the SalesLens demo.");
        })}
        className="card-surface grid gap-4 rounded-[32px] p-6 md:grid-cols-2"
      >
        <SelectField label="Theme mode" registration={form.register("themeMode")} options={["system", "light", "dark"]} />
        <SelectField label="Currency" registration={form.register("currency")} options={["TND", "USD", "EUR"]} />
        <SelectField label="Number format" registration={form.register("numberFormat")} options={["en-US", "fr-FR", "ar-TN"]} />
        <SelectField
          label="Default dashboard page"
          registration={form.register("defaultPage")}
          options={["/dashboard", "/products", "/customers", "/sales-reps", "/time-analysis"]}
        />
        <SelectField
          label="Default date range"
          registration={form.register("defaultDateRange")}
          options={["last7Days", "last30Days", "thisMonth", "thisQuarter", "thisYear"]}
        />
        <SelectField label="API mode" registration={form.register("cubeMode")} options={["mock", "ssas"]} />
        <SelectField label="Preferred export format" registration={form.register("exportPreference")} options={["pdf", "xlsx", "csv"]} />
        <div className="rounded-2xl border border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--foreground)]">Environment note</p>
          <p className="mt-2">The backend now supports live warehouse mode through your existing root `.env`, while these settings stay local to the frontend demo shell.</p>
        </div>
        <button type="submit" className="rounded-2xl bg-[var(--primary)] px-4 py-3 font-medium text-white">
          Save preferences
        </button>
      </form>
    </div>
  );
}

function SelectField({
  label,
  registration,
  options,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <select {...registration} className="rounded-2xl border border-[var(--border)] bg-transparent px-3 py-2">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
