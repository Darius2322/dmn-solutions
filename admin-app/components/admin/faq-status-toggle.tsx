"use client";

import { useState, useTransition } from "react";
import { updateFaqStatus } from "@/lib/actions/admin/faqs";

export function FaqStatusToggle({ faqId, active }: { faqId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [currentActive, setCurrentActive] = useState(active);

  function handleToggle() {
    startTransition(async () => {
      const result = await updateFaqStatus(faqId, !currentActive);
      if (result.success) setCurrentActive(!currentActive);
    });
  }

  return (
    <button onClick={handleToggle} disabled={isPending}
      className="rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background disabled:opacity-60">
      {currentActive ? "Hide" : "Show"}
    </button>
  );
}
