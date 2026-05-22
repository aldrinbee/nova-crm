import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Priority } from "@/types/database";

const priorityStyle: Record<Priority, { dot: string; label: string }> = {
  hot: { dot: "bg-red-400", label: "Hot" },
  warm: { dot: "bg-amber-400", label: "Warm" },
  cold: { dot: "bg-sky-400", label: "Cold" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function ContactsPage() {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, full_name, job_title, priority, created_at, organizations(name)")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-8 pb-24 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">Network</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {contacts?.length ?? 0} {contacts?.length === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
        >
          + Add
        </Link>
      </header>

      {!contacts || contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0F2337] border border-[#1E3A5F] flex items-center justify-center mb-4">
            <span className="text-2xl text-[#475569]">+</span>
          </div>
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-2">
            No contacts yet
          </h2>
          <p className="text-sm text-[#94A3B8] mb-6 max-w-xs">
            Add your first contact after the next event, conversation, or introduction.
          </p>
          <Link
            href="/contacts/new"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] transition-colors"
          >
            Add first contact
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {contacts.map((c) => {
            const org = Array.isArray(c.organizations)
              ? c.organizations[0]?.name
              : (c.organizations as { name: string } | null)?.name;
            const pri = priorityStyle[c.priority as Priority];
            return (
              <li key={c.id}>
                <Link
                  href={`/contacts/${c.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${pri.dot} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F1F5F9] truncate">{c.full_name}</p>
                    <p className="text-sm text-[#94A3B8] truncate">
                      {[c.job_title, org].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <span className="text-xs text-[#475569] flex-shrink-0">
                    {formatDate(c.created_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
