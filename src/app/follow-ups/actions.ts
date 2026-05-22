"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Priority } from "@/types/database";

export type CreateFollowUpInput = {
  contact_id: string;
  description: string;
  due_date: string;
  priority: Priority;
};

export async function createFollowUp(input: CreateFollowUpInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("follow_ups").insert({
    contact_id: input.contact_id,
    description: input.description.trim(),
    due_date: input.due_date,
    priority: input.priority,
  });
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/follow-ups");
  revalidatePath(`/contacts/${input.contact_id}`);
  return { success: true };
}

export async function completeFollowUp(id: string, contactId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "done" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/follow-ups");
  revalidatePath(`/contacts/${contactId}`);
  return { success: true };
}

export async function snoozeFollowUp(id: string, contactId: string, days: number) {
  const supabase = await createClient();
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + days);
  const iso = newDate.toISOString().slice(0, 10);

  const { error } = await supabase
    .from("follow_ups")
    .update({ due_date: iso, status: "pending" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/follow-ups");
  revalidatePath(`/contacts/${contactId}`);
  return { success: true };
}

export async function deleteFollowUp(id: string, contactId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("follow_ups").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/follow-ups");
  revalidatePath(`/contacts/${contactId}`);
  return { success: true };
}
