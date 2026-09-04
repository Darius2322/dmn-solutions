"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setReviewApproval, deleteReview } from "@/lib/actions/admin/moderation";
import { ConfirmButton } from "@/components/admin/confirm-button";

export function ReviewActions({ reviewId, approved }: { reviewId: string; approved: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = useState(approved);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => {
          const result = await setReviewApproval(reviewId, !current);
          if (result.success) setCurrent(!current);
        })}
        className="rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background disabled:opacity-60"
      >
        {current ? "Hide" : "Approve"}
      </button>
      <ConfirmButton label="Delete" onConfirm={async () => { await deleteReview(reviewId); router.refresh(); }} />
    </>
  );
}
