"use client";

import { useState } from "react";
import { X } from "lucide-react";

type DetailRow = { label: string; value: string };

export function DetailsModal({ title, rows }: { title: string; rows: DetailRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background"
      >
        Details
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-border bg-surface shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2 p-4">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-right font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
