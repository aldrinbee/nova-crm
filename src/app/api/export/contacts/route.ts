import { createClient } from "@/lib/supabase/server";
import { buildContactsCsv, csvFilename, type ExportableContact } from "@/lib/export";
import type { Priority } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, full_name, email, phone, job_title, country, linkedin_url, priority, updated_at, organizations(name)"
    )
    .order("full_name", { ascending: true });

  if (error) {
    return new Response(`Database error: ${error.message}`, { status: 500 });
  }

  const contacts: ExportableContact[] = (data ?? []).map((c) => {
    const org = Array.isArray(c.organizations) ? c.organizations[0] : c.organizations;
    return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      job_title: c.job_title,
      country: c.country,
      linkedin_url: c.linkedin_url,
      priority: c.priority as Priority,
      updated_at: c.updated_at,
      organization_name: (org as { name: string } | null)?.name ?? null,
    };
  });

  const csv = buildContactsCsv(contacts);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename("nova-contacts")}"`,
      "Cache-Control": "no-store",
    },
  });
}
