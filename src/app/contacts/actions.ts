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

    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .ilike("name", orgName)
      .maybeSingle();

    if (existingOrg) {
      organization_id = existingOrg.id;
    } else {
      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: orgName })
        .select("id")
        .single();

      if (orgError) return { error: orgError.message };
      organization_id = newOrg.id;
    }
  }

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      full_name: input.full_name.trim(),
      organization_id,
      job_title: input.job_title?.trim() || null,
      priority: input.priority,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (input.note?.trim()) {
    await supabase.from("interactions").insert({
      contact_id: contact.id,
      type: "met_in_person",
      date: new Date().toISOString().slice(0, 10),
      summary: input.note.trim(),
    });
  }

  revalidatePath("/contacts");
  redirect("/contacts");
}
