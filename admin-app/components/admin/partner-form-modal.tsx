"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, X } from "lucide-react";
import { createPartner, updatePartner } from "@/lib/actions/admin/partners";

type PartnerLike = {
  id: string; name: string; logo_url: string | null; website_url: string | null; sort_order: number;
};

export function PartnerFormModal({ partner }: { partner?: PartnerLike }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(partner?.name ?? "");
  const [logoUrl, setLogoUrl] = useState(partner?.logo_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(partner?.website_url ?? "");
  const [sortOrder, setSortOrder] = useState(String(partner?.sort_order ?? 0));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input = {
      name,
      logoUrl: logoUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      sortOrder: Number(sortOrder) || 0,
    };
    startTransition(async () => {
      const result = partner ? await updatePartner(partner.id, input) : await createPartner(input);
      if (!result.success) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={partner
          ? "rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background"
          : "flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"}
      >
        {partner ? <Pencil className="h-3 w-3" /> : <Plus className="h-4 w-4" />}
        {partner ? "Edit" : "Add Partner"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form onSubmit={handleSubmit} className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{partner ? "Edit partner" : "Add partner"}</h2>
              <button type="button" onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Logo URL</label>
                <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Website URL</label>
                <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-error">{error}</p>}
            <button type="submit" disabled={isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {partner ? "Save changes" : "Add partner"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
