import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FollowUpItem } from "./follow-ups/follow-up-item";
import type { Priority } from "@/types/database";

const priorityDot: Record<Priority, string> = {
  hot: "bg-red-400",
  warm: "bg-amber-400",
  cold: "bg-sky-400",
};

function formatRelative(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10);
  const oneWeekOut = new Date(today);
  oneWeekOut.setDate(oneWeekOut.getDate() + 7);
  const oneWeekOutIso = oneWeekOut.toISOString().slice(0, 10);

  const [
    followUpsRes,
    recentContactsRes,
    contactsCountRes,
    orgsCountRes,
    eventsCountRes,
    userRes,
  ] = await Promise.all([
    supabase
      .from("follow_ups")
      .select("id, contact_id, description, due_date, priority, contacts(full_name)")
      .eq("status", "pending")
      .lte("due_date", oneWeekOutIso)
      .order("due_date", { ascending: true })
      .limit(10),
    supabase
      .from("contacts")
      .select("id, full_name, job_title, priority, created_at, organizations(name)")
      .gte("created_at", sevenDaysAgoIso)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.auth.getUser(),
  ]);

  const followUps = (followUpsRes.data ?? []).map((r) => {
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

  const overdue = followUps.filter((f) => f.due_date < todayIso);
  const upcoming = followUps.filter((f) => f.due_date >= todayIso);
  const recentContacts = recentContactsRes.data ?? [];

  const userEmail = userRes.data.user?.email ?? "";
  const firstName = userEmail.split("@")[0].split(".")[0];
  const greeting = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "Welcome";

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-8 pb-32 max-w-2xl mx-auto w-full">
      <header className="mb-8">
        <p className="text-sm text-[#94A3B8] mb-1">{dateLabel}</p>
        <h1 className="text-3xl font-bold text-[#F1F5F9]">Hi, {greeting}.</h1>
      </header>

      {overdue.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-red-400">
              Overdue ({overdue.length})
            </h2>
            <Link
              href="/follow-ups"
              className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              See all →
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {overdue.map((r) => (
              <FollowUpItem key={r.id} row={r} />
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
              This week ({upcoming.length})
            </h2>
            <Link
              href="/follow-ups"
              className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              See all →
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {upcoming.map((r) => (
              <FollowUpItem key={r.id} row={r} />
            ))}
          </ul>
        </section>
      )}

      {overdue.length === 0 && upcoming.length === 0 && (
        <section className="mb-8">
          <div className="bg-[#0F2337] border border-[#1E3A5F] rounded-xl p-5 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm font-medium text-[#F1F5F9] mb-1">No follow-ups due</p>
            <p className="text-xs text-[#94A3B8]">
              Open a contact and tap <span className="text-[#3B82F6]">+ Follow-up</span> to set a reminder.
            </p>
          </div>
        </section>
      )}

      {recentContacts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Recently added
            </h2>
            <Link
              href="/contacts"
              className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              See all →
            </Link>
          </div>
          <ul className="flex flex-col gap-2">
            {recentContacts.map((c) => {
              const org = Array.isArray(c.organizations)
                ? c.organizations[0]?.name
                : (c.organizations as { name: string } | null)?.name;
              return (
                <li key={c.id}>
                  <Link
                    href={`/contacts/${c.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${priorityDot[c.priority as Priority]} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F1F5F9] truncate">{c.full_name}</p>
                      <p className="text-xs text-[#94A3B8] truncate">
                        {[c.job_title, org].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <span className="text-xs text-[#475569] flex-shrink-0">
                      {formatRelative(c.created_at)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
          Network
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="People" value={contactsCountRes.count ?? 0} href="/contacts" />
          <StatCard label="Orgs" value={orgsCountRes.count ?? 0} href="/organizations" />
          <StatCard label="Events" value={eventsCountRes.count ?? 0} href="/events" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
          Quick add
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/contacts/new"
            className="flex items-center justify-center h-14 rounded-xl bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
          >
            + Person
          </Link>
          <Link
            href="/events/new"
            className="flex items-center justify-center h-14 rounded-xl bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] font-medium hover:border-[#3B82F6]/50 transition-colors"
          >
            + Event
          </Link>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center h-20 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
    >
      <span className="text-2xl font-bold text-[#F1F5F9]">{value}</span>
      <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider mt-0.5">{label}</span>
    </Link>
  );
}
