"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, ChevronDown } from "lucide-react";
import { updateSiteContent } from "@/lib/actions/admin/moderation";

export function ContentEditor({ contentKey, label, value }: { contentKey: string; label: string; value: unknown }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("Not valid JSON — check for a missing comma or quote.");
      return;
    }
    startTransition(async () => {
      const result = await updateSiteContent(contentKey, parsed);
      if (!result.success) { setError(result.error); return; }
      setSaved(true);
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-foreground">{label}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border p-4">
          <textarea
            rows={8}
            value={text}
            onChange={(e) => { setText(e.target.value); setSaved(false); }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
          />
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="mt-3 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            Save
          </button>
        </div>
      )}
    </div>
  );
}
