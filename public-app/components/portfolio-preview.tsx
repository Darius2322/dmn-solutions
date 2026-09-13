"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function PortfolioPreview({ liveUrl, title }: { liveUrl: string; title: string }) {
  const [closed, setClosed] = useState(false);

  if (closed) {
    return (
      <button
        type="button"
        onClick={() => setClosed(false)}
        className="mb-8 w-full rounded-lg border border-border bg-surface-muted px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40"
      >
        Show live preview
      </button>
    );
  }

  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-2 flex-1 truncate text-xs text-muted-foreground">{liveUrl}</span>
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="Close preview"
          className="rounded p-0.5 hover:bg-background"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <iframe src={liveUrl} title={title} loading="lazy" className="h-64 w-full bg-surface sm:h-96" />
      <p className="border-t border-border bg-surface-muted px-3 py-1.5 text-[11px] text-muted-foreground">
        Preview not loading? Some sites block embedding — use "Visit live project" below instead.
      </p>
    </div>
  );
}
