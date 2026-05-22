import type { Priority } from "@/types/database";

export type ExportableContact = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  country: string | null;
  linkedin_url: string | null;
  priority: Priority;
  organization_name: string | null;
  updated_at?: string | null;
};

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return {
    first: parts.slice(0, -1).join(" "),
    last: parts[parts.length - 1],
  };
}

function csvCell(value: string | null | undefined): string {
  const v = value ?? "";
  if (v === "") return "";
  const escaped = v.replace(/"/g, '""');
  return `"${escaped}"`;
}

// Outlook-compatible CSV using their standard column names.
// Imports cleanly via Outlook Desktop → File → Open & Export → Import/Export → CSV.
export function buildContactsCsv(contacts: ExportableContact[]): string {
  const headers = [
    "First Name",
    "Last Name",
    "Company",
    "Job Title",
    "E-mail Address",
    "Business Phone",
    "Business Country/Region",
    "Web Page",
    "Notes",
    "Priority",
  ];

  const lines = [headers.join(",")];

  for (const c of contacts) {
    const { first, last } = splitName(c.full_name);
    const row = [
      csvCell(first),
      csvCell(last),
      csvCell(c.organization_name),
      csvCell(c.job_title),
      csvCell(c.email),
      csvCell(c.phone),
      csvCell(c.country),
      csvCell(c.linkedin_url),
      "", // Notes blank for now; could pull latest interaction summary later
      csvCell(c.priority),
    ];
    lines.push(row.join(","));
  }

  // CRLF line endings for maximum compatibility (Outlook prefers this)
  return lines.join("\r\n") + "\r\n";
}

function vcardEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildVCard(c: ExportableContact): string {
  const { first, last } = splitName(c.full_name);
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`FN:${vcardEscape(c.full_name)}`);
  lines.push(`N:${vcardEscape(last)};${vcardEscape(first)};;;`);

  if (c.organization_name) {
    lines.push(`ORG:${vcardEscape(c.organization_name)}`);
  }
  if (c.job_title) {
    lines.push(`TITLE:${vcardEscape(c.job_title)}`);
  }
  if (c.email) {
    lines.push(`EMAIL;TYPE=WORK:${c.email}`);
  }
  if (c.phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${c.phone}`);
  }
  if (c.linkedin_url) {
    lines.push(`URL:${c.linkedin_url}`);
  }
  if (c.country) {
    lines.push(`ADR;TYPE=WORK:;;;;;;${vcardEscape(c.country)}`);
  }

  lines.push(`NOTE:${vcardEscape(`Priority: ${c.priority}`)}`);

  if (c.updated_at) {
    lines.push(`REV:${new Date(c.updated_at).toISOString()}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n") + "\r\n";
}

export function csvFilename(prefix: string): string {
  const d = new Date();
  const iso = d.toISOString().slice(0, 10);
  const safePrefix = prefix.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${safePrefix || "nova"}-${iso}.csv`;
}

export function safeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "contact";
}
