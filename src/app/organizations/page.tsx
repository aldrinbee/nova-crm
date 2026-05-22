import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationsPage() {
  const supabase = await createClient();

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, type, country, contacts(count)")
    .order("name", { ascending: true });

  const rows = (orgs ?? []).map((o) => {
    const countObj = Array.isArray(o.contacts) ? o.contacts[0] : o.contacts;
    return {
      id: o.id,
      name: o.name,
      type: o.type,
      country: o.country,
      contactCount: (countObj as { count: number } | null)?.count ?? 0,
    };
  });

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-8 pb-32 max-w-2xl mx-auto w-full">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Organizations</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          {rows.length} {rows.length === 1 ? "organization" : "organizations"}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0F2337] border border-[#1E3A5F] flex items-center justify-center mb-4">
            <span className="text-2xl text-[#475569]">⌂</span>
          </div>
          <p className="text-sm text-[#94A3B8] max-w-xs">
            Organizations are created automatically when you add a contact with a company or government body.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((o) => (
            <li key={o.id}>
              <Link
                href={`/organizations/${o.id}`}
                className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#F1F5F9] truncate">{o.name}</p>
                  <p className="text-sm text-[#94A3B8] truncate">
                    {[o.type, o.country].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-semibold text-[#3B82F6]">{o.contactCount}</p>
                  <p className="text-[10px] text-[#475569] uppercase tracking-wider">
                    {o.contactCount === 1 ? "contact" : "contacts"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
