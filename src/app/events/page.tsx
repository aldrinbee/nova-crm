import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { EventType } from "@/types/database";

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null;
  const s = new Date(start);
  const sFmt = s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (!end || end === start) return sFmt;
  const e = new Date(end);
  const eFmt = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${sFmt} – ${eFmt}`;
}

const typeLabel: Record<EventType, string> = {
  conference: "Conference",
  trade_mission: "Trade Mission",
  bilateral: "Bilateral",
  dinner: "Dinner",
  other: "Other",
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, type, location, country, start_date, end_date, contact_events(count)")
    .order("start_date", { ascending: false, nullsFirst: false });

  const rows = (events ?? []).map((e) => {
    const countObj = Array.isArray(e.contact_events) ? e.contact_events[0] : e.contact_events;
    return {
      id: e.id,
      name: e.name,
      type: e.type as EventType | null,
      location: e.location,
      country: e.country,
      start_date: e.start_date,
      end_date: e.end_date,
      contactCount: (countObj as { count: number } | null)?.count ?? 0,
    };
  });

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-8 pb-32 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Events</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {rows.length} {rows.length === 1 ? "event" : "events"}
          </p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
        >
          + Add
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0F2337] border border-[#1E3A5F] flex items-center justify-center mb-4">
            <span className="text-2xl text-[#475569]">📅</span>
          </div>
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-2">No events yet</h2>
          <p className="text-sm text-[#94A3B8] mb-6 max-w-xs">
            Add events you attend so you can link contacts to where you met them.
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
          >
            Add first event
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((e) => {
            const dateRange = formatDateRange(e.start_date, e.end_date);
            const location = [e.location, e.country].filter(Boolean).join(", ");
            return (
              <li key={e.id}>
                <Link
                  href={`/events/${e.id}`}
                  className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F1F5F9] truncate">{e.name}</p>
                    <p className="text-sm text-[#94A3B8] truncate">
                      {[e.type ? typeLabel[e.type] : null, location, dateRange]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-semibold text-[#3B82F6]">{e.contactCount}</p>
                    <p className="text-[10px] text-[#475569] uppercase tracking-wider">
                      {e.contactCount === 1 ? "contact" : "contacts"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
