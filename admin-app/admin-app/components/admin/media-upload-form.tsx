"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { uploadMedia } from "@/lib/actions/admin/media";

export function MediaUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await uploadMedia(formData);
      if (!result.success) { setError(result.error); return; }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <input type="file" name="file" required accept="image/*" className="text-sm sm:col-span-1" />
        <input name="altText" placeholder="Alt text" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input name="usageContext" placeholder="Used for (e.g. portfolio hero)" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
      <button type="submit" disabled={isPending}
        className="mt-3 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload
      </button>
    </form>
  );
}
