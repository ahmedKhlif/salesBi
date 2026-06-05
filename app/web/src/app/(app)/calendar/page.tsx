import { SalesCalendar } from "@/components/calendar/sales-calendar";

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold">Calendar Analytics</h1>
        <p className="mt-2 text-[var(--muted)]">Navigate sales activity by month, week, day, and agenda with quick daily insight drill-down.</p>
      </section>
      <SalesCalendar />
    </div>
  );
}
