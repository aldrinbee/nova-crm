"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  icon: React.ReactNode;
};

const tabs: Tab[] = [
  {
    href: "/",
    label: "Home",
    match: (p) => p === "/" || p.startsWith("/follow-ups"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/contacts",
    label: "People",
    match: (p) => p === "/contacts" || p.startsWith("/contacts/"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/organizations",
    label: "Orgs",
    match: (p) => p.startsWith("/organizations"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01" />
        <path d="M9 12v.01" />
        <path d="M9 15v.01" />
        <path d="M9 18v.01" />
      </svg>
    ),
  },
  {
    href: "/events",
    label: "Events",
    match: (p) => p.startsWith("/events"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#0A1525]/95 backdrop-blur-xl border-t border-[#1E3A5F]">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg flex-1 max-w-[110px] transition-colors ${
                active ? "text-[#3B82F6]" : "text-[#64748B] hover:text-[#94A3B8]"
              }`}
            >
              {tab.icon}
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
