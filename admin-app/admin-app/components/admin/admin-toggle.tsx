"use client";

import { useState, useTransition } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { setAdminStatus } from "@/lib/actions/admin/moderation";

export function AdminToggle({ profileId, isAdmin }: { profileId: string; isAdmin: boolean }) {
  const [current, setCurrent] = useState(isAdmin);
  const [isPending] = useTransition();

  if (current) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Admin</span>
        <ConfirmButton
          label="Revoke admin"
          confirmLabel="Remove admin access?"
          onConfirm={async () => {
            const result = await setAdminStatus(profileId, false);
            if (result.success) setCurrent(false);
          }}
        />
      </div>
    );
  }

  return (
    <ConfirmButton
      label="Make admin"
      confirmLabel="Grant admin access?"
      className="rounded-md border border-primary px-3 py-1 text-xs text-primary hover:bg-primary/10"
      onConfirm={async () => {
        const result = await setAdminStatus(profileId, true);
        if (result.success) setCurrent(true);
      }}
    />
  );
}
