"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteMedia } from "@/lib/actions/admin/media";

export function DeleteMediaButton({ mediaId, storagePath }: { mediaId: string; storagePath: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete"
      className="mt-1 text-xs text-error hover:underline"
      onConfirm={async () => { await deleteMedia(mediaId, storagePath); router.refresh(); }}
    />
  );
}
