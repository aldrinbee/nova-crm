"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Priority, InteractionType } from "@/types/database";

export type CreateContactInput = {
  full_name: string;
  organization_name?: string;
  job_title?: string;
  note?: string;
  priority: Priority;
  event_id?: string;
};

async function findOrCreateOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string
): Promise<{ id: string | null; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { id: null };

  const lookup = await supabase
    .from("organizations")
    .select("id")
    .ilike("name", trimmed)
    .maybeSingle();

  const existing = lookup.data as { id: string } | null;
  if (existing) return { id: existing.id };

  const insert = await supabase
    .from("organizations")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (insert.error) return { id: null, error: insert.error.message };
  return { id: (insert.data as { id: string }).id };
}

export async function createContact(input: CreateContactInput) {
  const supabase = await createClient();

  let organization_id: string | null = null;
  if (input.organization_name?.trim()) {
    const orgResult = await findOrCreateOrg(supabase, input.organization_name);
    if (orgResult.error) return { error: orgResult.error };
    organization_id = orgResult.id;
  }

  const contactInsert = await supabase
    .from("contacts")
    .insert({
      full_name: input.full_name.trim(),
      organization_id,
      job_title: input.job_title?.trim() || null,
      priority: input.priority,
    })
    .select("id")
    .single();

  if (contactInsert.error) return { error: contactInsert.error.message };
  const contactId = (contactInsert.data as { id: string }).id;

  if (input.event_id) {
    await supabase.from("contact_events").insert({
      contact_id: contactId,
      event_id: input.event_id,
    });
  }

  if (input.note?.trim()) {
    await supabase.from("interactions").insert({
      contact_id: contactId,
      event_id: input.event_id ?? null,
      type: "met_in_person",
      date: new Date().toISOString().slice(0, 10),
      summary: input.note.trim(),
    });
  }

  revalidatePath("/contacts");
  redirect("/contacts");
}

export type UpdateContactInput = {
  id: string;
  full_name: string;
  organization_name?: string;
  job_title?: string;
  email?: string;
  phone?: string;
  country?: string;
  linkedin_url?: string;
  priority: Priority;
  linked_event_ids: string[];
};

export async function updateContact(input: UpdateContactInput) {
  const supabase = await createClient();

  let organization_id: string | null = null;
  if (input.organization_name?.trim()) {
    const orgResult = await findOrCreateOrg(supabase, input.organization_name);
    if (orgResult.error) return { error: orgResult.error };
    organization_id = orgResult.id;
  }

  const { error: updateError } = await supabase
    .from("contacts")
    .update({
      full_name: input.full_name.trim(),
      organization_id,
      job_title: input.job_title?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      country: input.country?.trim() || null,
      linkedin_url: input.linkedin_url?.trim() || null,
      priority: input.priority,
    })
    .eq("id", input.id);

  if (updateError) return { error: updateError.message };

  const existingLinks = await supabase
    .from("contact_events")
    .select("event_id")
    .eq("contact_id", input.id);

  const existingIds = new Set(
    (existingLinks.data ?? []).map((r) => (r as { event_id: string }).event_id)
  );
  const desiredIds = new Set(input.linked_event_ids);

  const toAdd = [...desiredIds].filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !desiredIds.has(id));

  if (toAdd.length > 0) {
    await supabase
      .from("contact_events")
      .insert(toAdd.map((event_id) => ({ contact_id: input.id, event_id })));
  }

  if (toRemove.length > 0) {
    await supabase
      .from("contact_events")
      .delete()
      .eq("contact_id", input.id)
      .in("event_id", toRemove);
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${input.id}`);
  return { success: true };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/contacts");
  redirect("/contacts");
}

export type CreateInteractionInput = {
  contact_id: string;
  event_id?: string;
  type: InteractionType;
  date: string;
  summary?: string;
  outcome?: string;
};

export async function createInteraction(input: CreateInteractionInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("interactions").insert({
    contact_id: input.contact_id,
    event_id: input.event_id || null,
    type: input.type,
    date: input.date,
    summary: input.summary?.trim() || null,
    outcome: input.outcome?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/contacts/${input.contact_id}`);
  return { success: true };
}

export async function deleteInteraction(id: string, contactId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("interactions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/contacts/${contactId}`);
  return { success: true };
}
