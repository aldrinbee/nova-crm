import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Priority } from "@/types/database";

const priorityDot: Record<Priority, string> = {
  hot: "bg-red-400",
  warm: "bg-amber-400",
  cold: "bg-sky-400",
};

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, type, country, website, sector, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !org) notFound();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, full_name, job_title, priority")
    .eq("organization_id", id)
    .order("full_name", { ascending: true });

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-6 pb-32 max-w-2xl mx-auto w-full">
      <header className="mb-6">
        <Link
          href="/organizations"
          className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors inline-block mb-4"
        >
          ← Organizations
        </Link>
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">{org.name}</h1>
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          {org.type && <span className="capitalize">{org.type}</span>}
          {org.type && org.country && <span className="text-[#475569]">·</span>}
          {org.country && <span>{org.country}</span>}
          {!org.type && !org.country && <span className="text-[#475569]">No metadata yet</span>}
        </div>
        {org.website && (
          <a
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#3B82F6] hover:underline mt-2 inline-block"
          >
            {org.website}
          </a>
        )}
      </header>

      <section>
        <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
          Contacts ({contacts?.length ?? 0})
        </h2>
        {!contacts || contacts.length === 0 ? (
          <p className="text-sm text-[#475569] italic">No contacts in this organization yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contacts/${c.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${priorityDot[c.priority as Priority]} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#F1F5F9] truncate">{c.full_name}</p>
                    {c.job_title && (
                      <p className="text-sm text-[#94A3B8] truncate">{c.job_title}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
