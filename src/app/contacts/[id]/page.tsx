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

  const { data: interactions } = await supabase
    .from("interactions")
    .select("id, type, date, summary, outcome, created_at")
    .eq("contact_id", id)
    .order("date", { ascending: false });

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
      interactions={interactions ?? []}
    />
  );
}
