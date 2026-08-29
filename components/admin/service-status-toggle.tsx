"use client";

import { useState, useTransition } from "react";
import { updateServiceStatus } from "@/lib/actions/admin/services";

export function ServiceStatusToggle({ serviceId, active }: { serviceId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [currentActive, setCurrentActive] = useState(active);

  function handleToggle() {
    startTransition(async () => {
      const result = await updateServiceStatus(serviceId, !currentActive);
      if (result.success) setCurrentActive(!currentActive);
    });
  }

  return (
    <button onClick={handleToggle} disabled={isPending}
      className="rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background disabled:opacity-60">
      {currentActive ? "Deactivate" : "Activate"}
    </button>
  );
}
