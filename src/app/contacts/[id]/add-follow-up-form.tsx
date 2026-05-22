"use client";

import { useState, useTransition } from "react";
import { createFollowUp } from "@/app/follow-ups/actions";
import type { Priority } from "@/types/database";

const priorityStyle: Record<Priority, { dot: string; label: string; activeRing: string; activeBg: string }> = {
  hot: { dot: "bg-red-400", label: "Hot", activeRing: "ring-red-400", activeBg: "bg-red-500/15" },
  warm: { dot: "bg-amber-400", label: "Warm", activeRing: "ring-amber-400", activeBg: "bg-amber-500/15" },
  cold: { dot: "bg-sky-400", label: "Cold", activeRing: "ring-sky-400", activeBg: "bg-sky-500/15" },
};

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function AddFollowUpForm({
  contactId,
  onSaved,
  onCancel,
}: {
  contactId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [priority, setPriority] = useState<Priority>("warm");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await createFollowUp({
        contact_id: contactId,
        description,
        due_date: dueDate,
        priority,
      });
      if (result?.error) setError(result.error);
      else onSaved();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0F2337] border border-[#1E3A5F] rounded-xl p-4 mb-3 flex flex-col gap-4"
    >
      <div>
        <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">
          What to do
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Send brief on F-16 sustainment, intro to Col. Reyes…"
          required
          autoFocus
          className="w-full h-11 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">
          Due
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="w-full h-11 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">
          Priority
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["hot", "warm", "cold"] as Priority[]).map((p) => {
            const s = priorityStyle[p];
            const active = priority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex items-center justify-center gap-2 h-11 rounded-lg border transition-all ${
                  active
                    ? `${s.activeBg} border-transparent ring-2 ${s.activeRing}`
                    : "bg-[#0A1525] border-[#1E3A5F]"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-sm font-medium text-[#F1F5F9]">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 h-11 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] font-medium hover:border-[#3B82F6]/50 transition-colors text-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || !description.trim()}
          className="flex-1 h-11 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors text-sm"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
