"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EventType } from "@/types/database";

export type CreateEventInput = {
  name: string;
  type?: EventType;
  location?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
};

export async function createEvent(input: CreateEventInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
      name: input.name.trim(),
      type: input.type ?? null,
      location: input.location?.trim() || null,
      country: input.country?.trim() || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/events");
  redirect(`/events/${(data as { id: string }).id}`);
}
