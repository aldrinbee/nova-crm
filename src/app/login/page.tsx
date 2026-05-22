"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Step = "email" | "code";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const response = await fetch(`${url}/auth/v1/otp`, {
        method: "POST",
        headers: {
          apikey: key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          create_user: true,
          gotrue_meta_security: {},
        }),
        referrerPolicy: "no-referrer",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.msg ||
            data.error_description ||
            data.message ||
            `HTTP ${response.status}`
        );
      }

      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  if (step === "code") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">NOVA</h1>
            <p className="text-[#94A3B8] text-sm">
              Check <span className="text-[#F1F5F9]">{email}</span> for your code
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">
                6-digit verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                autoFocus
                className="w-full h-14 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="h-12 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifying..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              className="text-[#94A3B8] text-sm hover:text-[#F1F5F9] transition-colors"
            >
              Use a different email
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">NOVA</h1>
          <p className="text-[#94A3B8] text-sm">Sign in to your network</p>
        </div>

        <form onSubmit={handleSendCode} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send verification code"}
          </button>
        </form>
      </div>
    </main>
  );
}
