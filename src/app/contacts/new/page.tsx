import { createClient } from "@/lib/supabase/server";
import { NewContactForm } from "./new-contact-form";

export default async function NewContactPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, start_date")
    .order("start_date", { ascending: false, nullsFirst: false })
    .limit(20);

  return (
    <NewContactForm
      events={(events ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        start_date: e.start_date,
      }))}
    />
  );
}
