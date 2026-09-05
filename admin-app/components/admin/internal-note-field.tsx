"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { updateInternalNote } from "@/lib/actions/admin/services";

export function InternalNoteField({ requestId, initialNote }: { requestId: string; initialNote: string }) {
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateInternalNote(requestId, note);
      setSaved(true);
    });
  }

  return (
    <div className="mt-3">
      <label className="mb-1 block text-xs font-medium text-muted-foreground">Internal notes (not visible to customer)</label>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false); }}
        onBlur={save}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="mt-1 flex justify-end text-xs text-muted-foreground">
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <Check className="h-3 w-3 text-success" /> : "Unsaved"}
      </div>
    </div>
  );
}
