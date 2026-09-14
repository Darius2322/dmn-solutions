"use client";

import { useState, useTransition } from "react";
import { updatePartnerStatus } from "@/lib/actions/admin/partners";

export function PartnerStatusToggle({ partnerId, active }: { partnerId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [currentActive, setCurrentActive] = useState(active);

  function handleToggle() {
    startTransition(async () => {
      const result = await updatePartnerStatus(partnerId, !currentActive);
      if (result.success) setCurrentActive(!currentActive);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background disabled:opacity-60"
    >
      {currentActive ? "Hide" : "Show"}
    </button>
  );
}
