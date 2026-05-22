import { createClient } from "@/lib/supabase/server";
import { buildContactsCsv, csvFilename, type ExportableContact } from "@/lib/export";
import type { Priority } from "@/types/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: eventRow } = await supabase
    .from("events")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (!eventRow) {
    return new Response("Not found", { status: 404 });
  }

  const eventName = (eventRow as { name: string }).name;

  const { data, error } = await supabase
    .from("contact_events")
    .select(
      "contacts(id, full_name, email, phone, job_title, country, linkedin_url, priority, updated_at, organizations(name))"
    )
    .eq("event_id", id);

  if (error) {
    return new Response(`Database error: ${error.message}`, { status: 500 });
  }

  const mapped = (data ?? []).map((row) => {
    const c = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;
    if (!c) return null;
    const cAny = c as {
      id: string;
      full_name: string;
      email: string | null;
      phone: string | null;
      job_title: string | null;
      country: string | null;
      linkedin_url: string | null;
      priority: string;
      updated_at: string | null;
      organizations: { name: string } | { name: string }[] | null;
    };
    const org = Array.isArray(cAny.organizations) ? cAny.organizations[0] : cAny.organizations;
    const result: ExportableContact = {
      id: cAny.id,
      full_name: cAny.full_name,
      email: cAny.email,
      phone: cAny.phone,
      job_title: cAny.job_title,
      country: cAny.country,
      linkedin_url: cAny.linkedin_url,
      priority: cAny.priority as Priority,
      updated_at: cAny.updated_at,
      organization_name: (org as { name: string } | null)?.name ?? null,
    };
    return result;
  });

  const contacts = mapped
    .filter((c): c is ExportableContact => c !== null)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const csv = buildContactsCsv(contacts);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename(`nova-${eventName}`)}"`,
      "Cache-Control": "no-store",
    },
  });
}
