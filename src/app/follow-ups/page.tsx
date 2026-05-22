import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FollowUpItem } from "./follow-up-item";
import type { Priority } from "@/types/database";

type FollowUpRow = {
  id: string;
  contact_id: string;
  description: string;
  due_date: string;
  priority: Priority;
  contact_name: string;
};

function bucketise(rows: FollowUpRow[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const inAWeek = new Date(today);
  inAWeek.setDate(inAWeek.getDate() + 7);

  const overdue: FollowUpRow[] = [];
  const dueToday: FollowUpRow[] = [];
  const thisWeek: FollowUpRow[] = [];
  const later: FollowUpRow[] = [];

  for (const r of rows) {
    const d = new Date(r.due_date);
    d.setHours(0, 0, 0, 0);
    if (d < today) overdue.push(r);
    else if (d < tomorrow) dueToday.push(r);
    else if (d < inAWeek) thisWeek.push(r);
    else later.push(r);
  }
  return { overdue, dueToday, thisWeek, later };
}

export default async function FollowUpsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follow_ups")
    .select("id, contact_id, description, due_date, priority, contacts(full_name)")
    .eq("status", "pending")
    .order("due_date", { ascending: true });

  const rows: FollowUpRow[] = (data ?? []).map((r) => {
    const c = Array.isArray(r.contacts) ? r.contacts[0] : r.contacts;
    return {
      id: r.id,
      contact_id: r.contact_id,
      description: r.description,
      due_date: r.due_date,
      priority: r.priority as Priority,
      contact_name: (c as { full_name: string } | null)?.full_name ?? "Unknown",
    };
  });

  const { overdue, dueToday, thisWeek, later } = bucketise(rows);

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-8 pb-32 max-w-2xl mx-auto w-full">
      <header className="mb-6">
        <Link
          href="/"
          className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors inline-block mb-3"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Follow-ups</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          {rows.length} pending {rows.length === 1 ? "item" : "items"}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0F2337] border border-[#1E3A5F] flex items-center justify-center mb-4">
            <span className="text-2xl text-[#475569]">✓</span>
          </div>
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-2">All caught up</h2>
          <p className="text-sm text-[#94A3B8] max-w-xs">
            No pending follow-ups. Open a contact and tap <span className="text-[#3B82F6]">+ Follow-up</span> to add one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Bucket title="Overdue" rows={overdue} tone="overdue" />
          <Bucket title="Due today" rows={dueToday} tone="today" />
          <Bucket title="This week" rows={thisWeek} tone="upcoming" />
          <Bucket title="Later" rows={later} tone="future" />
        </div>
      )}
    </main>
  );
}

function Bucket({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: FollowUpRow[];
  tone: "overdue" | "today" | "upcoming" | "future";
}) {
  if (rows.length === 0) return null;

  const toneStyle = {
    overdue: "text-red-400",
    today: "text-amber-400",
    upcoming: "text-[#3B82F6]",
    future: "text-[#94A3B8]",
  }[tone];

  return (
    <section>
      <h2 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${toneStyle}`}>
        {title} ({rows.length})
      </h2>
      <ul className="flex flex-col gap-2">
        {rows.map((r) => (
          <FollowUpItem key={r.id} row={r} />
        ))}
      </ul>
    </section>
  );
}
