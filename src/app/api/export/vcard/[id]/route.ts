import { createClient } from "@/lib/supabase/server";
import { buildVCard, safeSlug, type ExportableContact } from "@/lib/export";
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

  const { data, error } = await supabase
    .from("contacts")
    .select(
      "id, full_name, email, phone, job_title, country, linkedin_url, priority, updated_at, organizations(name)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return new Response(`Database error: ${error.message}`, { status: 500 });
  }

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const c = data as {
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

  const org = Array.isArray(c.organizations) ? c.organizations[0] : c.organizations;

  const contact: ExportableContact = {
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

  const vcard = buildVCard(contact);

  return new Response(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeSlug(contact.full_name)}.vcf"`,
      "Cache-Control": "no-store",
    },
  });
}
