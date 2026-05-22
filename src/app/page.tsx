"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/contacts");
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <main className="flex flex-1 items-center justify-center min-h-screen">
      <div className="w-5 h-5 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
    </main>
  );
}
