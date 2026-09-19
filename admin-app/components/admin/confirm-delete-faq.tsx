"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteFaq } from "@/lib/actions/admin/faqs";

export function ConfirmDeleteFaq({ faqId }: { faqId: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete"
      onConfirm={async () => { await deleteFaq(faqId); router.refresh(); }}
    />
  );
}
