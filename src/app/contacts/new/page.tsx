"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createContact } from "../actions";
import type { Priority } from "@/types/database";

const priorityOptions: Array<{
  value: Priority;
  label: string;
  description: string;
  activeRing: string;
  activeBg: string;
  dot: string;
}> = [
  {
    value: "hot",
    label: "Hot",
    description: "Act this week",
    activeRing: "ring-red-400",
    activeBg: "bg-red-500/15",
    dot: "bg-red-400",
  },
  {
    value: "warm",
    label: "Warm",
    description: "Stay in touch",
    activeRing: "ring-amber-400",
    activeBg: "bg-amber-500/15",
    dot: "bg-amber-400",
  },
  {
    value: "cold",
    label: "Cold",
    description: "Keep on file",
    activeRing: "ring-sky-400",
    activeBg: "bg-sky-500/15",
    dot: "bg-sky-400",
  },
];

export default function NewContactPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<Priority>("warm");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Name is required");
      return;
    }
    setError("");

    startTransition(async () => {
      const result = await createContact({
        full_name: fullName,
        organization_name: orgName,
        job_title: jobTitle,
        note,
        priority,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-6 pb-24 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <Link
          href="/contacts"
          className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          ← Cancel
        </Link>
        <h1 className="text-lg font-semibold text-[#F1F5F9]">New contact</h1>
        <div className="w-12" />
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">
            Full name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Maria Santos"
            required
            autoFocus
            className="w-full h-14 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-lg text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">Organization</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="DFA, BCDA, Lockheed Martin…"
            className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">Job title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Director of Procurement"
            className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">Quick note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Where you met, what you discussed, what to follow up on…"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-3">Priority</label>
          <div className="grid grid-cols-3 gap-2">
            {priorityOptions.map((opt) => {
              const active = priority === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex flex-col items-center justify-center h-20 rounded-xl border transition-all ${
                    active
                      ? `${opt.activeBg} border-transparent ring-2 ${opt.activeRing}`
                      : "bg-[#0F2337] border-[#1E3A5F] hover:border-[#3B82F6]/50"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.dot} mb-1.5`} />
                  <span className="font-semibold text-[#F1F5F9] text-sm">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] mt-0.5">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending || !fullName.trim()}
          className="h-14 rounded-lg bg-[#3B82F6] text-white font-semibold text-base hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {isPending ? "Saving…" : "Save contact"}
        </button>
      </form>
    </main>
  );
}
