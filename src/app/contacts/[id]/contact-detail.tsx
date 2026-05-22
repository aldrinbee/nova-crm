"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateContact, deleteContact } from "../actions";
import { LogInteractionForm } from "./log-interaction-form";
import { ContactFollowUps } from "./contact-follow-ups";
import type { Priority, InteractionType } from "@/types/database";

type Contact = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  country: string | null;
  linkedin_url: string | null;
  priority: Priority;
  created_at: string;
  organization_id: string | null;
  organization_name: string | null;
};

type Interaction = {
  id: string;
  type: InteractionType;
  date: string;
  summary: string | null;
  outcome: string | null;
  created_at: string;
};

type LinkedEvent = {
  id: string;
  name: string;
  start_date: string | null;
  location: string | null;
  country: string | null;
};

type EventOption = {
  id: string;
  name: string;
  start_date: string | null;
};

type FollowUp = {
  id: string;
  description: string;
  due_date: string;
  status: string;
  priority: Priority;
  created_at: string;
};

const priorityStyle: Record<Priority, { dot: string; label: string; activeBg: string; activeRing: string }> = {
  hot: { dot: "bg-red-400", label: "Hot", activeBg: "bg-red-500/15", activeRing: "ring-red-400" },
  warm: { dot: "bg-amber-400", label: "Warm", activeBg: "bg-amber-500/15", activeRing: "ring-amber-400" },
  cold: { dot: "bg-sky-400", label: "Cold", activeBg: "bg-sky-500/15", activeRing: "ring-sky-400" },
};

const interactionLabel: Record<InteractionType, string> = {
  met_in_person: "Met in person",
  call: "Call",
  email: "Email",
  other: "Note",
};

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ContactDetail({
  contact,
  interactions,
  linkedEvents,
  allEvents,
  followUps,
}: {
  contact: Contact;
  interactions: Interaction[];
  linkedEvents: LinkedEvent[];
  allEvents: EventOption[];
  followUps: FollowUp[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loggingInteraction, setLoggingInteraction] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState(contact.full_name);
  const [orgName, setOrgName] = useState(contact.organization_name ?? "");
  const [jobTitle, setJobTitle] = useState(contact.job_title ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [country, setCountry] = useState(contact.country ?? "");
  const [linkedin, setLinkedin] = useState(contact.linkedin_url ?? "");
  const [priority, setPriority] = useState<Priority>(contact.priority);
  const [eventIds, setEventIds] = useState<string[]>(linkedEvents.map((e) => e.id));

  function toggleEvent(eventId: string) {
    setEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await updateContact({
        id: contact.id,
        full_name: fullName,
        organization_name: orgName,
        job_title: jobTitle,
        email,
        phone,
        country,
        linkedin_url: linkedin,
        priority,
        linked_event_ids: eventIds,
      });
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteContact(contact.id);
      if (result?.error) setError(result.error);
    });
  }

  const pri = priorityStyle[contact.priority];

  if (editing) {
    return (
      <main className="flex flex-1 flex-col min-h-screen px-4 pt-6 pb-32 max-w-2xl mx-auto w-full">
        <header className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError("");
              setEventIds(linkedEvents.map((e) => e.id));
            }}
            className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            ← Cancel
          </button>
          <h1 className="text-lg font-semibold text-[#F1F5F9]">Edit contact</h1>
          <div className="w-12" />
        </header>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Full name" required>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </Field>
          <Field label="Organization">
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </Field>
          <Field label="Job title">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </Field>
          <Field label="Country">
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/…"
              className="w-full h-12 px-4 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </Field>

          {allEvents.length > 0 && (
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Met at</label>
              <p className="text-xs text-[#475569] mb-3">
                Tap to link or unlink. A contact can be met at multiple events.
              </p>
              <div className="flex flex-col gap-2">
                {allEvents.map((ev) => {
                  const selected = eventIds.includes(ev.id);
                  const date = formatShortDate(ev.start_date);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => toggleEvent(ev.id)}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-all ${
                        selected
                          ? "bg-[#3B82F6]/15 border-[#3B82F6]"
                          : "bg-[#0F2337] border-[#1E3A5F] hover:border-[#3B82F6]/50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F1F5F9] truncate">{ev.name}</p>
                        {date && <p className="text-xs text-[#94A3B8]">{date}</p>}
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? "border-[#3B82F6] bg-[#3B82F6]" : "border-[#475569]"
                        }`}
                      >
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-[#94A3B8] mb-3">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(["hot", "warm", "cold"] as Priority[]).map((p) => {
                const s = priorityStyle[p];
                const active = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex items-center justify-center gap-2 h-12 rounded-lg border transition-all ${
                      active
                        ? `${s.activeBg} border-transparent ring-2 ${s.activeRing}`
                        : "bg-[#0F2337] border-[#1E3A5F]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-sm font-medium text-[#F1F5F9]">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isPending || !fullName.trim()}
            className="h-14 rounded-lg bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] disabled:opacity-50 transition-colors mt-2"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col min-h-screen px-4 pt-6 pb-32 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/contacts"
          className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          ← Network
        </Link>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
        >
          Edit
        </button>
      </header>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">{contact.full_name}</h1>
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <span className={`w-2 h-2 rounded-full ${pri.dot}`} />
          <span>{pri.label}</span>
          <span className="text-[#475569]">·</span>
          <span>Added {formatLongDate(contact.created_at)}</span>
        </div>
      </div>

      <section className="bg-[#0F2337] border border-[#1E3A5F] rounded-xl p-5 mb-6">
        <DetailRow
          label="Organization"
          value={contact.organization_name}
          link={contact.organization_id ? `/organizations/${contact.organization_id}` : null}
          internal
        />
        <DetailRow label="Job title" value={contact.job_title} />
        <DetailRow label="Email" value={contact.email} />
        <DetailRow label="Phone" value={contact.phone} />
        <DetailRow label="Country" value={contact.country} />
        <DetailRow
          label="LinkedIn"
          value={contact.linkedin_url}
          link={contact.linkedin_url}
          isLast
        />
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
          Met at ({linkedEvents.length})
        </h2>
        {linkedEvents.length === 0 ? (
          <p className="text-sm text-[#475569] italic">
            No events linked yet. Tap Edit to link this contact to events you&apos;ve attended together.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {linkedEvents.map((ev) => {
              const date = formatShortDate(ev.start_date);
              const location = [ev.location, ev.country].filter(Boolean).join(", ");
              return (
                <li key={ev.id}>
                  <Link
                    href={`/events/${ev.id}`}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#0F2337] border border-[#1E3A5F] hover:border-[#3B82F6]/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#F1F5F9] truncate">{ev.name}</p>
                      <p className="text-sm text-[#94A3B8] truncate">
                        {[date, location].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <span className="text-[#475569] text-sm">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ContactFollowUps contactId={contact.id} followUps={followUps} />

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider">
            Interactions ({interactions.length})
          </h2>
          {!loggingInteraction && (
            <button
              type="button"
              onClick={() => setLoggingInteraction(true)}
              className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            >
              + Log
            </button>
          )}
        </div>

        {loggingInteraction && (
          <LogInteractionForm
            contactId={contact.id}
            events={allEvents}
            onSaved={() => setLoggingInteraction(false)}
            onCancel={() => setLoggingInteraction(false)}
          />
        )}

        {interactions.length === 0 ? (
          !loggingInteraction && (
            <p className="text-sm text-[#475569] italic">
              No interactions logged yet. Tap <span className="text-[#3B82F6]">+ Log</span> to record a meeting, call, or email.
            </p>
          )
        ) : (
          <ul className="flex flex-col gap-2">
            {interactions.map((i) => (
              <li key={i.id} className="bg-[#0F2337] border border-[#1E3A5F] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#3B82F6]">
                    {interactionLabel[i.type]}
                  </span>
                  <span className="text-xs text-[#475569]">{formatLongDate(i.date)}</span>
                </div>
                {i.summary && <p className="text-sm text-[#F1F5F9]">{i.summary}</p>}
                {i.outcome && (
                  <p className="text-xs text-[#94A3B8] mt-1">Outcome: {i.outcome}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-auto">
        {confirmDelete ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-[#F1F5F9] mb-3">
              Delete <span className="font-semibold">{contact.full_name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
                className="flex-1 h-11 rounded-lg bg-[#0F2337] border border-[#1E3A5F] text-[#F1F5F9] font-medium hover:border-[#3B82F6]/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 h-11 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full h-11 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            Delete contact
          </button>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-[#94A3B8] mb-2">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  link,
  internal,
  isLast,
}: {
  label: string;
  value: string | null;
  link?: string | null;
  internal?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-2.5 ${
        !isLast ? "border-b border-[#1E3A5F]" : ""
      }`}
    >
      <span className="text-sm text-[#94A3B8] flex-shrink-0">{label}</span>
      {value ? (
        link ? (
          internal ? (
            <Link
              href={link}
              className="text-sm text-[#3B82F6] hover:underline text-right break-words"
            >
              {value}
            </Link>
          ) : (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#3B82F6] hover:underline text-right break-all"
            >
              {value}
            </a>
          )
        ) : (
          <span className="text-sm text-[#F1F5F9] text-right break-words">{value}</span>
        )
      ) : (
        <span className="text-sm text-[#475569]">—</span>
      )}
    </div>
  );
}
