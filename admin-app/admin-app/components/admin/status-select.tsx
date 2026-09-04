"use client";

import { useState, useTransition } from "react";

type ActionResult = { success: boolean; error?: string };

export function StatusSelect({
  id,
  currentStatus,
  options,
  action,
}: {
  id: string;
  currentStatus: string;
  options: string[];
  action: (id: string, status: string) => Promise<ActionResult>;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(newStatus: string) {
    startTransition(async () => {
      const result = await action(id, newStatus);
      if (result.success) setStatus(newStatus);
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="shrink-0 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground disabled:opacity-60"
    >
      {options.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
      ))}
    </select>
  );
}
