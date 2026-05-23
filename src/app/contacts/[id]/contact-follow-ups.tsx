"use client";

import { useState, useTransition } from "react";
import {
  completeFollowUp,
  snoozeFollowUp,
  deleteFollowUp,
  updateFollowUp,
} from "@/app/follow-ups/actions";
import { AddFollowUpForm } from "./add-follow-up-form";
import type { Priority } from "@/types/database";

type FollowUp = {
  id: string;
  description: string;
  due_date: string;
  status: string;
  priority: Priority;
  created_at: string;
};

const priorityDot: Record<Priority, string> = {
  hot: "bg-red-400",
  warm: "bg-amber-400",
  cold: "bg-sky-400",
};

const priorityStyle: Record<
  Priority,
  { dot: string; label: string; activeRing: string; activeBg: string }
> = {
  hot: { dot: "bg-red-400", label: "Hot", activeRing: "ring-red-400", activeBg: "bg-red-500/15" },
  warm: { dot: "bg-amber-400", label: "Warm", activeRing: "ring-amber-400", activeBg: "bg-amber-500/15" },
  cold: { dot: "bg-sky-400", label: "Cold", activeRing: "ring-sky-400", activeBg: "bg-sky-500/15" },
};

const snoozeOptions = [
  { label: "+1d", days: 1 },
  { label: "+3d", days: 3 },
  { label: "+1w", days: 7 },
  { label: "+2w", days: 14 },
] as const;

function formatDueLabel(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return { label: "Today", overdue: false };
  if (diffDays === 1) return { label: "Tomorrow", overdue: false };
  if (diffDays === -1) return { label: "Yesterday", overdue: true };
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, overdue: true };
  if (diffDays < 7) return { label: `In ${diffDays} days`, overdue: false };
  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overdue: false,
  };
}

export function ContactFollowUps({
  contactId,
  followUps,
}: {
  contactId: string;
  followUps: FollowUp[];
}) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [snoozeOpenId, setSnoozeOpenId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<FollowUp | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("warm");
  const [editError, setEditError] = useState("");

  const pending = followUps.filter((f) => f.status === "pending");
  const done = followUps.filter((f) => f.status === "done");

  function handleComplete(id: string) {
    startTransition(async () => {
      await completeFollowUp(id, contactId);
    });
  }

  function handleSnooze(id: string, days: number) {
    setSnoozeOpenId(null);
    startTransition(async () => {
      await snoozeFollowUp(id, contactId, days);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteFollowUp(id, contactId);
    });
  }

  function startEdit(f: FollowUp) {
    setSnoozeOpenId(null);
    setEditItem(f);
    setEditDesc(f.description);
    setEditDueDate(f.due_date);
    setEditPriority(f.priority);
    setEditError("");
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editDesc.trim() || !editItem) return;
    setEditError("");
    startTransition(async () => {
      const result = await updateFollowUp(editItem.id, contactId, {
        description: editDesc,
        due_date: editDueDate,
        priority: editPriority,
      });
      if (result?.error) setEditError(result.error);
      else setEditItem(null);
    });
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
          Follow-ups ({pending.length})
        </h2>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
          >
            + Follow-up
          </button>
        )}
      </div>

      {adding && (
        <AddFollowUpForm
          contactId={contactId}
          onSaved={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      )}

      {pending.length === 0 && done.length === 0 && !adding && (
        <p className="text-sm text-[#475569] italic">
          No follow-ups yet. Tap <span className="text-[#3B82F6]">+ Follow-up</span> to set a reminder.
        </p>
      )}

      {pending.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pending.map((f) => {
            const due = formatDueLabel(f.due_date);

            if (editItem?.id === f.id) {
              return (
                <li
                  key={f.id}
                  className={`p-3 rounded-xl bg-[#0F2337] border border-[#3B82F6]/50 ${
                    isPending ? "opacity-60" : ""
                  }`}
                >
                  <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      autoFocus
                      required
                      className="w-full h-10 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
                    />
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {(["hot", "warm", "cold"] as Priority[]).map((p) => {
                        const s = priorityStyle[p];
                        const active = editPriority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEditPriority(p)}
                            className={`flex items-center justify-center gap-2 h-9 rounded-lg border transition-all ${
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
                    {editError && <p className="text-red-400 text-xs">{editError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditItem(null)}
                        disabled={isPending}
                        className="flex-1 h-9 rounded-lg bg-[#0A1525] border border-[#1E3A5F] text-[#F1F5F9] text-sm font-medium hover:border-[#3B82F6]/50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPending || !editDesc.trim()}
                        className="flex-1 h-9 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
                      >
                        {isPending ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </form>
                </li>
              );
            }

            return (
              <li
                key={f.id}
                className={`flex items-start gap-3 p-3 rounded-xl bg-[#0F2337] border border-[#1E3A5F] ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${priorityDot[f.priority]} flex-shrink-0 mt-2`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F1F5F9]">{f.description}</p>
                  <p className={`text-xs mt-1 ${due.overdue ? "text-red-400" : "text-[#94A3B8]"}`}>
                    {due.label}
                  </p>
                </div>
                {snoozeOpenId === f.id ? (
                  <div className="flex gap-1 flex-shrink-0">
                    {snoozeOptions.map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => handleSnooze(f.id, opt.days)}
                        disabled={isPending}
                        className="h-12 px-2 text-xs font-semibold rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] hover:bg-[#3B82F6]/25 transition-colors disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSnoozeOpenId(null)}
                      className="w-9 h-12 flex items-center justify-center rounded-lg hover:bg-[#1E3A5F] transition-colors text-[#94A3B8] text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleComplete(f.id)}
                      disabled={isPending}
                      className="w-10 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-green-500/15 transition-colors disabled:opacity-50"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-400"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider">
                        Done
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(f)}
                      disabled={isPending}
                      className="w-10 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-[#3B82F6]/15 transition-colors disabled:opacity-50"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#94A3B8]"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider">
                        Edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSnoozeOpenId(f.id)}
                      disabled={isPending}
                      className="w-10 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-[#3B82F6]/15 transition-colors disabled:opacity-50"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#94A3B8]"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider">
                        Snooze
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(f.id)}
                      disabled={isPending}
                      className="w-10 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-red-500/15 transition-colors disabled:opacity-50 group"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#94A3B8] group-hover:text-red-400"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider group-hover:text-red-400">
                        Delete
                      </span>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {done.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-[#475569] cursor-pointer hover:text-[#94A3B8]">
            {done.length} completed
          </summary>
          <ul className="flex flex-col gap-2 mt-2">
            {done.map((f) => (
              <li
                key={f.id}
                className="p-3 rounded-xl bg-[#0F2337]/50 border border-[#1E3A5F]/50"
              >
                <p className="text-sm text-[#94A3B8] line-through">{f.description}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
