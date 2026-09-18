"use client";

import { useState } from "react";
import { ChevronDown, Mail, Phone, MessageCircle, MapPin, Wallet } from "lucide-react";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { InternalNoteField } from "@/components/admin/internal-note-field";
import { getRequestStatusHistory } from "@/lib/actions/admin/services";

type HistoryEntry = { status: string; changedAt: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

type Request = {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  status: string;
  created_at: string;
  internal_notes: string | null;
  description: string | null;
  location: string | null;
  budget_range: string | null;
  preferred_contact: string | null;
  serviceTitle: string | null;
};

export function RequestRow({ request: r }: { request: Request }) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && history === null) {
      setLoadingHistory(true);
      const h = await getRequestStatusHistory(r.id);
      setHistory(h);
      setLoadingHistory(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={toggleExpand}
        className="flex w-full flex-wrap items-start justify-between gap-2 p-4 text-left"
      >
        <div>
          <p className="font-mono text-xs text-primary">{r.tracking_number}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{r.customer_name}</p>
          <p className="text-xs text-muted-foreground">{r.customer_email}</p>
          <p className="text-xs text-muted-foreground">{r.serviceTitle ?? "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs capitalize text-primary">
            {r.status.replace(/_/g, " ")}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${r.customer_email}`} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-background">
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
            {r.customer_phone && (
              <>
                <a href={`tel:${r.customer_phone}`} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-background">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <a href={`https://wa.me/${r.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-background">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </>
            )}
            {r.preferred_contact && (
              <span className="flex items-center gap-1 rounded-md bg-surface-muted px-2 py-1.5 text-[11px] text-muted-foreground">
                Prefers: {r.preferred_contact}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {r.description && <p className="text-foreground">{r.description}</p>}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {r.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.location}</span>
              )}
              {r.budget_range && (
                <span className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {r.budget_range}</span>
              )}
              <span>Submitted {formatDate(r.created_at)}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Status history</p>
            {loadingHistory && <p className="text-xs text-muted-foreground">Loading…</p>}
            {!loadingHistory && history && history.length === 0 && (
              <p className="text-xs text-muted-foreground">No status changes yet.</p>
            )}
            {!loadingHistory && history && history.length > 0 && (
              <ul className="space-y-1.5">
                {history.map((h, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-foreground">{h.status.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground">{formatDate(h.changedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <RequestStatusSelect requestId={r.id} currentStatus={r.status} />
          </div>
          <InternalNoteField requestId={r.id} initialNote={r.internal_notes ?? ""} />
        </div>
      )}
    </div>
  );
}
