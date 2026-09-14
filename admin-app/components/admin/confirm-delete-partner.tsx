"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deletePartner } from "@/lib/actions/admin/partners";

export function ConfirmDeletePartner({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete"
      onConfirm={async () => { await deletePartner(partnerId); router.refresh(); }}
    />
  );
}
