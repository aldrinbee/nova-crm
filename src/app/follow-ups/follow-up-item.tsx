"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { completeFollowUp, snoozeFollowUp } from "./actions";
import type { Priority } from "@/types/database";

const priorityDot: Record<Priority, string> = {
  hot: "bg-red-400",
  warm: "bg-amber-400",
  cold: "bg-sky-400",
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

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays < 7) return `In ${diffDays} days`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FollowUpItem({
  row,
}: {
  row: {
    id: string;
    contact_id: string;
    description: string;
    due_date: string;
    priority: Priority;
    contact_name: string;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const [snoozeOpen, setSnoozeOpen] = useState(false);

  function handleComplete() {
    startTransition(async () => {
      await completeFollowUp(row.id, row.contact_id);
    });
  }

  function handleSnooze(days: number) {
    setSnoozeOpen(false);
    startTransition(async () => {
      await snoozeFollowUp(row.id, row.contact_id, days);
    });
  }

  return (
    <li className="flex items-stretch gap-2">
      <Link
        href={`/contacts/${row.contact_id}`}
        className={`flex-1 flex items-start gap-3 p-3 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors ${
          isPending ? "opacity-50" : ""
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${priorityDot[row.priority]} flex-shrink-0 mt-2`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#F1F5F9] line-clamp-2">{row.description}</p>
          <p className="text-xs text-[#94A3B8] mt-1">
            <span className="text-[#3B82F6]">{row.contact_name}</span>
            <span className="text-[#475569] mx-1.5">·</span>
            <span>{formatDueLabel(row.due_date)}</span>
          </p>
        </div>
      </Link>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleComplete}
          disabled={isPending}
          className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-lg bg-[#0F2337] border border-[#1E3A5F] hover:border-green-500/50 hover:bg-green-500/10 transition-colors disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
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
          <span className="text-[9px] font-medium text-[#94A3B8] uppercase tracking-wider">Done</span>
        </button>
        {snoozeOpen ? (
          <>
            {snoozeOptions.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => handleSnooze(opt.days)}
                disabled={isPending}
                className="w-14 h-9 flex items-center justify-center text-xs font-semibold rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#3B82F6]/25 transition-colors disabled:opacity-50"
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSnoozeOpen(false)}
              className="w-14 h-9 flex items-center justify-center text-sm rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#94A3B8] hover:border-[#3B82F6]/50 transition-colors"
            >
              ✕
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSnoozeOpen(true)}
            disabled={isPending}
            className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 rounded-lg bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/10 transition-colors disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
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
        )}
      </div>
    </li>
  );
}
