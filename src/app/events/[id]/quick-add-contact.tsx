"use client";

import { useState, useRef, useTransition } from "react";
import { quickAddContactForEvent } from "@/app/contacts/actions";
import type { Priority } from "@/types/database";

const priorityStyle: Record<Priority, { dot: string; label: string; activeRing: string; activeBg: string }> = {
  hot: { dot: "bg-red-400", label: "Hot", activeRing: "ring-red-400", activeBg: "bg-red-500/15" },
  warm: { dot: "bg-amber-400", label: "Warm", activeRing: "ring-amber-400", activeBg: "bg-amber-500/15" },
  cold: { dot: "bg-sky-400", label: "Cold", activeRing: "ring-sky-400", activeBg: "bg-sky-500/15" },
};

export function QuickAddContact({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [justSavedName, setJustSavedName] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [priority, setPriority] = useState<Priority>("warm");

  const nameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    const savedName = fullName.trim();

    startTransition(async () => {
      const result = await quickAddContactForEvent({
        event_id: eventId,
        full_name: fullName,
        organization_name: orgName,
        priority,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setFullName("");
        setOrgName("");
        setPriority("warm");
        setJustSavedName(savedName);
        nameRef.current?.focus();
        setTimeout(() => setJustSavedName(null), 2500);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-14 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition-colors mb-4"
      >
        + Add person here
      </button>
    );
  }

  return (
    <div className="bg-[#0F2337] border border-[#3B82F6]/30 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#F1F5F9]">Quick capture</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setFullName("");
            setOrgName("");
            setPriority("warm");
            setError("");
            setJustSavedName(null);
          }}
          className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          Close
        </button>
      </div>

      {justSavedName && (
        <div className="bg-green-500/15 border border-green-500/30 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 flex-shrink-0">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-xs text-[#F1F5F9]">
            Saved <span className="font-medium">{justSavedName}</span>. Add another?
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={nameRef}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          required
          autoFocus
          className="w-full h-12 px-4 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
        />
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Organization (optional)"
          className="w-full h-11 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
        />

        <div className="grid grid-cols-3 gap-2">
          {(["hot", "warm", "cold"] as Priority[]).map((p) => {
            const s = priorityStyle[p];
            const active = priority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex items-center justify-center gap-2 h-10 rounded-lg border transition-all ${
                  active
                    ? `${s.activeBg} border-transparent ring-2 ${s.activeRing}`
                    : "bg-[#0A1525] border-[#1E3A5F]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs font-medium text-[#F1F5F9]">{s.label}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isPending || !fullName.trim()}
          className="h-12 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors text-sm"
        >
          {isPending ? "Saving…" : "Save & add another"}
        </button>
      </form>
    </div>
  );
}
