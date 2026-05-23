"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateEvent } from "../../actions";
import type { EventType } from "@/types/database";

const eventTypes: Array<{ value: EventType; label: string }> = [
  { value: "conference", label: "Conference" },
  { value: "trade_mission", label: "Trade Mission" },
  { value: "bilateral", label: "Bilateral" },
  { value: "dinner", label: "Dinner" },
  { value: "other", label: "Other" },
];

type EventData = {
  id: string;
  name: string;
  type: EventType | null;
  location: string | null;
  country: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
};

export function EditEventForm({ event }: { event: EventData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(event.name);
  const [type, setType] = useState<EventType | "">(event.type ?? "");
  const [location, setLocation] = useState(event.location ?? "");
  const [country, setCountry] = useState(event.country ?? "");
  const [startDate, setStartDate] = useState(event.start_date ?? "");
  const [endDate, setEndDate] = useState(event.end_date ?? "");
  const [notes, setNotes] = useState(event.notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await updateEvent(event.id, {
        name,
        type: type || undefined,
        location,
        country,
        start_date: startDate,
        end_date: endDate,
        notes,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-6 pb-32 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <Link
          href={`/events/${event.id}`}
          className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          ← Cancel
        </Link>
        <h1 className="text-lg font-semibold text-[#F1F5F9]">Edit event</h1>
        <div className="w-12" />
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">
            Event name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="DSEI 2026, ADAS, ASEAN Defense Ministers Meeting…"
            required
            autoFocus
            className="w-full h-14 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-lg text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {eventTypes.map((t) => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(active ? "" : t.value)}
                  className={`h-11 px-2 rounded-lg text-sm font-medium border transition-all ${
                    active
                      ? "bg-[#3B82F6]/15 border-[#3B82F6] text-[#F1F5F9]"
                      : "bg-[#0F2337] border-[#1E3A5F] text-[#94A3B8] hover:border-[#3B82F6]/50"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="ExCeL London, Manila Hotel…"
            className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Philippines, UK, USA…"
            className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-[#94A3B8] mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Who's hosting, what's on the agenda, key delegations…"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="h-14 rounded-lg bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] disabled:opacity-50 transition-colors mt-2"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </main>
  );
}
