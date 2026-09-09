"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteProject } from "@/lib/actions/admin/portfolio";

export function ConfirmDeleteProject({ projectId }: { projectId: string }) {
  const router = useRouter();
  return (
    <ConfirmButton
      label="Delete"
      onConfirm={async () => { await deleteProject(projectId); router.refresh(); }}
    />
  );
}
