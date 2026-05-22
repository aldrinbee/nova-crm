import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactDetail } from "./contact-detail";
import type { Priority } from "@/types/database";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact, error } = await supabase
    .from("contacts")
    .select(
      "id, full_name, email, phone, job_title, country, linkedin_url, priority, created_at, organization_id, organizations(id, name)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !contact) notFound();

  const [interactionsRes, eventLinksRes, allEventsRes] = await Promise.all([
    supabase
      .from("interactions")
      .select("id, type, date, summary, outcome, created_at")
      .eq("contact_id", id)
      .order("date", { ascending: false }),
    supabase
      .from("contact_events")
      .select("event_id, events(id, name, start_date, location, country)")
      .eq("contact_id", id),
    supabase
      .from("events")
      .select("id, name, start_date")
      .order("start_date", { ascending: false, nullsFirst: false })
      .limit(50),
  ]);

  const linkedEvents = (eventLinksRes.data ?? [])
    .map((l) => {
      const ev = Array.isArray(l.events) ? l.events[0] : l.events;
      if (!ev) return null;
      return {
        id: (ev as { id: string }).id,
        name: (ev as { name: string }).name,
        start_date: (ev as { start_date: string | null }).start_date,
        location: (ev as { location: string | null }).location,
        country: (ev as { country: string | null }).country,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const org = Array.isArray(contact.organizations)
    ? contact.organizations[0]
    : (contact.organizations as { id: string; name: string } | null);

  return (
    <ContactDetail
      contact={{
        id: contact.id,
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        job_title: contact.job_title,
        country: contact.country,
        linkedin_url: contact.linkedin_url,
        priority: contact.priority as Priority,
        created_at: contact.created_at,
        organization_id: contact.organization_id,
        organization_name: org?.name ?? null,
      }}
      interactions={interactionsRes.data ?? []}
      linkedEvents={linkedEvents}
      allEvents={(allEventsRes.data ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        start_date: e.start_date,
      }))}
    />
  );
}
