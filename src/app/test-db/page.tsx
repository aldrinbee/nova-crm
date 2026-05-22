import { createClient } from "@/lib/supabase/server";

export default async function TestDbPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("contacts").select("count").single();

  const tables = ["contacts", "organizations", "events", "interactions", "follow_ups", "contact_events"] as const;
  const tableResults = await Promise.all(
    tables.map(async (table) => {
      const { error } = await supabase.from(table).select("count").single();
      return { table, ok: !error || error.code === "PGRST116" };
    })
  );

  const allOk = tableResults.every((r) => r.ok);

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-[#F1F5F9] mb-6">Database Status</h1>

        <div className={`rounded-xl border p-4 mb-6 ${allOk ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <p className={`font-medium ${allOk ? "text-green-400" : "text-red-400"}`}>
            {allOk ? "✓ Connected successfully" : "✗ Connection issues detected"}
          </p>
          <p className="text-[#94A3B8] text-sm mt-1">
            Signed in as: {user?.email ?? "not signed in"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {tableResults.map(({ table, ok }) => (
            <div key={table} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#0F2337] border border-[#1E3A5F]">
              <span className="text-[#94A3B8] text-sm font-mono">{table}</span>
              <span className={`text-sm font-medium ${ok ? "text-green-400" : "text-red-400"}`}>
                {ok ? "✓" : "✗ missing"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
