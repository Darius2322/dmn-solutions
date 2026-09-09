"use client";

import { useState, useTransition } from "react";
import { updateRequestStatus } from "@/lib/actions/admin/services";

const STATUSES = [
  "request_received", "reviewing", "quote_prepared", "payment_pending",
  "work_started", "in_progress", "review_testing", "completed", "delivered", "cancelled",
];

export function RequestStatusSelect({ requestId, currentStatus }: { requestId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleChange(newStatus: string) {
    startTransition(async () => {
      const result = await updateRequestStatus(requestId, newStatus);
      if (result.success) setStatus(newStatus);
    });
  }

  return (
    <select value={status} disabled={isPending} onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground disabled:opacity-60">
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
      ))}
    </select>
  );
}
