"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Priority } from "@/types/database";

export type CreateContactInput = {
  full_name: string;
  organization_name?: string;
  job_title?: string;
  note?: string;
  priority: Priority;
};

export async function createContact(input: CreateContactInput) {
  const supabase = await createClient();

  let organization_id: string | null = null;

  if (input.organization_name?.trim()) {
    const orgName = input.organization_name.trim();

    const lookup = await supabase
      .from("organizations")
      .select("id")
      .ilike("name", orgName)
      .maybeSingle();

    const existingOrg = lookup.data as { id: string } | null;

    if (existingOrg) {
      organization_id = existingOrg.id;
    } else {
      const insert = await supabase
        .from("organizations")
        .insert({ name: orgName })
        .select("id")
        .single();

      if (insert.error) return { error: insert.error.message };
      organization_id = (insert.data as { id: string }).id;
    }
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

  if (input.note?.trim()) {
    await supabase.from("interactions").insert({
      contact_id: contactId,
      type: "met_in_person",
      date: new Date().toISOString().slice(0, 10),
      summary: input.note.trim(),
    });
  }

  revalidatePath("/contacts");
  redirect("/contacts");
}
