"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteService } from "@/lib/actions/admin/services";

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete"
      onConfirm={async () => {
        await deleteService(serviceId);
        router.refresh();
      }}
    />
  );
}
