"use client";

import { useState, useTransition } from "react";
import { createInteraction } from "../actions";
import type { InteractionType } from "@/types/database";

type EventOption = {
  id: string;
  name: string;
  start_date: string | null;
};

const interactionTypes: Array<{ value: InteractionType; label: string; icon: string }> = [
  { value: "met_in_person", label: "Met", icon: "🤝" },
  { value: "call", label: "Call", icon: "📞" },
  { value: "email", label: "Email", icon: "✉️" },
  { value: "other", label: "Note", icon: "📝" },
];

function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function LogInteractionForm({
  contactId,
  events,
  onSaved,
  onCancel,
}: {
  contactId: string;
  events: EventOption[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [type, setType] = useState<InteractionType>("met_in_person");
  const [date, setDate] = useState(todayIso());
  const [eventId, setEventId] = useState("");
  const [summary, setSummary] = useState("");
  const [outcome, setOutcome] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createInteraction({
        contact_id: contactId,
        event_id: eventId || undefined,
        type,
        date,
        summary,
        outcome,
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
          Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {interactionTypes.map((t) => {
            const active = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex flex-col items-center justify-center h-14 rounded-lg border transition-all ${
                  active
                    ? "bg-[#3B82F6]/15 border-[#3B82F6]"
                    : "bg-[#0A1525] border-[#1E3A5F] hover:border-[#3B82F6]/50"
                }`}
              >
                <span className="text-lg leading-none mb-0.5">{t.icon}</span>
                <span className="text-[11px] text-[#F1F5F9] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full h-11 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
          />
        </div>
        {events.length > 0 && (
          <div>
            <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">
              Event (optional)
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm appearance-none"
            >
              <option value="">—</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">
          Summary
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="What was discussed, agreed, or learned…"
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">
          Outcome (optional)
        </label>
        <input
          type="text"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Action item, next step…"
          className="w-full h-11 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
        />
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
          disabled={isPending}
          className="flex-1 h-11 rounded-lg bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors text-sm"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
