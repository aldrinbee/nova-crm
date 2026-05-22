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

  const { data: orgRow } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (!orgRow) {
    return new Response("Not found", { status: 404 });
  }

  const orgName = (orgRow as { name: string }).name;

  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, full_name, email, phone, job_title, country, linkedin_url, priority, updated_at"
    )
    .eq("organization_id", id)
    .order("full_name", { ascending: true });

  if (error) {
    return new Response(`Database error: ${error.message}`, { status: 500 });
  }

  const contacts: ExportableContact[] = (data ?? []).map((c) => ({
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone,
    job_title: c.job_title,
    country: c.country,
    linkedin_url: c.linkedin_url,
    priority: c.priority as Priority,
    updated_at: c.updated_at,
    organization_name: orgName,
  }));

  const csv = buildContactsCsv(contacts);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename(`nova-${orgName}`)}"`,
      "Cache-Control": "no-store",
    },
  });
}
