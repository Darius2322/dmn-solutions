"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const PAGES = [
  { href: "/", label: "Dashboard" },
  { href: "/requests", label: "Requests" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/customers", label: "Customers" },
  { href: "/reviews", label: "Reviews" },
  { href: "/messages", label: "Messages" },
  { href: "/referrals", label: "Referrals" },
  { href: "/support", label: "Support" },
  { href: "/partners", label: "Partners" },
  { href: "/visitors", label: "Visitors" },
  { href: "/analytics", label: "Analytics" },
  { href: "/media", label: "Media" },
  { href: "/content", label: "Content" },
  { href: "/settings", label: "Settings" },
  { href: "/audit-logs", label: "Audit Logs" },
];

export function GlobalSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));

  function go(href: string) {
    router.push(href);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={`flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground ${className}`}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search…</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-surface shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[0]) go(results[0].href);
                }}
                placeholder="Search admin pages…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setOpen(false)} aria-label="Close search">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">No pages found.</p>
              )}
              {results.map((p) => (
                <button
                  key={p.href}
                  onClick={() => go(p.href)}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-background"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
