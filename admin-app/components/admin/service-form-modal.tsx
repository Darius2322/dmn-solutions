"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, X } from "lucide-react";
import { createService, updateService } from "@/lib/actions/admin/services";

type ServiceLike = {
  id: string; title: string; description: string; category: string;
  slug: string; icon: string; price_label: string | null; features: string[];
};

const CATEGORIES = [
  { value: "digital_technology", label: "Digital & Technology" },
  { value: "electrical", label: "Electrical" },
  { value: "computer_training", label: "Computer Training" },
  { value: "isp", label: "Internet / ISP" },
];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function ServiceFormModal({ service }: { service?: ServiceLike }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(service?.title ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [category, setCategory] = useState(service?.category ?? CATEGORIES[0].value);
  const [icon, setIcon] = useState(service?.icon ?? "wrench");
  const [priceLabel, setPriceLabel] = useState(service?.price_label ?? "");
  const [features, setFeatures] = useState(service?.features.join("\n") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input = {
      title,
      description,
      category,
      slug: service?.slug ?? slugify(title),
      icon,
      priceLabel: priceLabel || undefined,
      features: features.split("\n").map((f) => f.trim()).filter(Boolean),
    };
    startTransition(async () => {
      const result = service ? await updateService(service.id, input) : await createService(input);
      if (!result.success) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={service
          ? "rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background"
          : "flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"}
      >
        {service ? <Pencil className="h-3 w-3" /> : <Plus className="h-4 w-4" />}
        {service ? "Edit" : "Add Service"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form onSubmit={handleSubmit} className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{service ? "Edit service" : "Add service"}</h2>
              <button type="button" onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
                <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Icon (lucide name)</label>
                  <input value={icon} onChange={(e) => setIcon(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Price label (optional)</label>
                <input value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Features (one per line)</label>
                <textarea rows={4} value={features} onChange={(e) => setFeatures(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <button type="submit" disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {service ? "Save changes" : "Create service"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
