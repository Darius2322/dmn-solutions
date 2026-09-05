"use client";

import { useState, useTransition } from "react";
import { toggleFeatured } from "@/lib/actions/admin/portfolio";

export function FeaturedToggle({ projectId, featured }: { projectId: string; featured: boolean }) {
  const [current, setCurrent] = useState(featured);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => {
        const result = await toggleFeatured(projectId, !current);
        if (result.success) setCurrent(!current);
      })}
      className={`rounded-md border px-3 py-1 text-xs disabled:opacity-60 ${current ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
    >
      {current ? "Featured" : "Not featured"}
    </button>
  );
}
