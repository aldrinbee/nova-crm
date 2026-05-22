import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Suppress the Referer header — GoTrue uses it as an implicit redirect
        // URL and fails validation when Site URL isn't configured.
        fetch: (url, options = {}) =>
          fetch(url, { ...options, referrerPolicy: "no-referrer" }),
      },
    }
  );
}
