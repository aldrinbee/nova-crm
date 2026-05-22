"use client";

import { useState, useTransition } from "react";
import { completeFollowUp, snoozeFollowUp, deleteFollowUp } from "@/app/follow-ups/actions";
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

  const pending = followUps.filter((f) => f.status === "pending");
  const done = followUps.filter((f) => f.status === "done");

  function handleComplete(id: string) {
    startTransition(async () => {
      await completeFollowUp(id, contactId);
    });
  }

  function handleSnooze(id: string) {
    startTransition(async () => {
      await snoozeFollowUp(id, contactId, 7);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteFollowUp(id, contactId);
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
            return (
              <li
                key={f.id}
                className={`flex items-start gap-3 p-3 rounded-xl bg-[#0F2337] border border-[#1E3A5F] ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${priorityDot[f.priority]} flex-shrink-0 mt-2`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F1F5F9]">{f.description}</p>
                  <p className={`text-xs mt-1 ${due.overdue ? "text-red-400" : "text-[#94A3B8]"}`}>
                    {due.label}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleComplete(f.id)}
                    disabled={isPending}
                    className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-green-500/15 transition-colors disabled:opacity-50"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider">Done</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(f.id)}
                    disabled={isPending}
                    className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-[#3B82F6]/15 transition-colors disabled:opacity-50"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#94A3B8]">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider">Snooze</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    disabled={isPending}
                    className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-red-500/15 transition-colors disabled:opacity-50 group"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#94A3B8] group-hover:text-red-400">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider group-hover:text-red-400">Delete</span>
                  </button>
                </div>
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
              <li key={f.id} className="p-3 rounded-xl bg-[#0F2337]/50 border border-[#1E3A5F]/50">
                <p className="text-sm text-[#94A3B8] line-through">{f.description}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
