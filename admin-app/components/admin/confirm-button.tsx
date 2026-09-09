"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

export function ConfirmButton({
  onConfirm,
  label,
  confirmLabel = "Are you sure?",
  className,
}: {
  onConfirm: () => Promise<unknown>;
  label: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{confirmLabel}</span>
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => { await onConfirm(); setConfirming(false); })}
          className="rounded-md bg-error px-2 py-1 text-xs font-medium text-white disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
        </button>
        <button onClick={() => setConfirming(false)} className="rounded-md border border-border px-2 py-1 text-xs">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className={className ?? "rounded-md border border-border px-3 py-1 text-xs text-error hover:bg-error/10"}>
      {label}
    </button>
  );
}
