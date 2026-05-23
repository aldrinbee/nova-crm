import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditEventForm } from "./edit-event-form";
import type { EventType } from "@/types/database";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, type, location, country, start_date, end_date, notes")
    .eq("id", id)
    .maybeSingle();

  if (error || !event) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const refDate = event.end_date ?? event.start_date;
  if (refDate && refDate < today) {
    redirect(`/events/${id}`);
  }

  return (
    <EditEventForm
      event={{
        id: event.id,
        name: event.name,
        type: event.type as EventType | null,
        location: event.location,
        country: event.country,
        start_date: event.start_date,
        end_date: event.end_date,
        notes: event.notes,
      }}
    />
  );
}
