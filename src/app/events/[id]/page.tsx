import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuickAddContact } from "./quick-add-contact";
import type { Priority, EventType } from "@/types/database";

const priorityDot: Record<Priority, string> = {
  hot: "bg-red-400",
  warm: "bg-amber-400",
  cold: "bg-sky-400",
};

const typeLabel: Record<EventType, string> = {
  conference: "Conference",
  trade_mission: "Trade Mission",
  bilateral: "Bilateral",
  dinner: "Dinner",
  other: "Other",
};

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null;
  const s = new Date(start);
  const sFmt = s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (!end || end === start) return sFmt;
  const e = new Date(end);
  const eFmt = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${sFmt} – ${eFmt}`;
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, type, location, country, start_date, end_date, notes")
    .eq("id", id)
    .maybeSingle();

  if (error || !event) notFound();

  const { data: links } = await supabase
    .from("contact_events")
    .select("role, notes, contacts(id, full_name, job_title, priority, organizations(name))")
    .eq("event_id", id);

  const contacts = (links ?? [])
    .map((l) => {
      const c = Array.isArray(l.contacts) ? l.contacts[0] : l.contacts;
      if (!c) return null;
      const org = Array.isArray((c as { organizations: unknown }).organizations)
        ? ((c as { organizations: { name: string }[] }).organizations[0]?.name ?? null)
        : ((c as { organizations: { name: string } | null }).organizations?.name ?? null);
      return {
        id: (c as { id: string }).id,
        full_name: (c as { full_name: string }).full_name,
        job_title: (c as { job_title: string | null }).job_title,
        priority: (c as { priority: Priority }).priority,
        org_name: org,
        role: l.role,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const dateRange = formatDateRange(event.start_date, event.end_date);
  const location = [event.location, event.country].filter(Boolean).join(", ");

  const today = new Date().toISOString().slice(0, 10);
  const refDate = event.end_date ?? event.start_date;
  const canEdit = !refDate || refDate >= today;

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-6 pb-32 max-w-2xl mx-auto w-full">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/events"
            className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            ← Events
          </Link>
          {canEdit && (
            <Link
              href={`/events/${id}/edit`}
              className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            >
              Edit
            </Link>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">{event.name}</h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#94A3B8]">
          {event.type && <span>{typeLabel[event.type as EventType]}</span>}
          {event.type && (location || dateRange) && <span className="text-[#475569]">·</span>}
          {location && <span>{location}</span>}
          {location && dateRange && <span className="text-[#475569]">·</span>}
          {dateRange && <span>{dateRange}</span>}
          {!event.type && !location && !dateRange && (
            <span className="text-[#475569]">No metadata yet</span>
          )}
        </div>
        {event.notes && (
          <p className="text-sm text-[#94A3B8] mt-4 leading-relaxed whitespace-pre-wrap">
            {event.notes}
          </p>
        )}
      </header>

      <QuickAddContact eventId={event.id} />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
            People met here ({contacts.length})
          </h2>
          {contacts.length > 0 && (
            <a
              href={`/api/export/contacts/by-event/${event.id}`}
              className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            >
              Export CSV
            </a>
          )}
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-[#475569] italic">
            No contacts linked yet. When you add a new contact, select this event to link them.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contacts/${c.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${priorityDot[c.priority]} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F1F5F9] truncate">{c.full_name}</p>
                    <p className="text-sm text-[#94A3B8] truncate">
                      {[c.job_title, c.org_name].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
