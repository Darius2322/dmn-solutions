"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";

export type SiteWork = {
  id: string;
  title: string;
  description: string;
  category: string;
  photos: string[];
};

export function SiteWorkGallery({ items }: { items: SiteWork[] }) {
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState<{ item: SiteWork; index: number } | null>(null);

  const categories = useMemo(() => ["all", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const visible = items.filter((i) => category === "all" || i.category === category);

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((o) => (o ? { ...o, index: (o.index + dir + o.item.photos.length) % o.item.photos.length } : o)),
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <section className="mt-16" aria-labelledby="site-work-heading">
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-secondary" aria-hidden />
        <h2 id="site-work-heading" className="text-xl font-semibold text-foreground">Site work</h2>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Hands-on jobs such as electrical installations and plumbing, shown through photos from site.
      </p>

      {categories.length > 2 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpen({ item, index: 0 })}
            className="group overflow-hidden rounded-lg border border-border bg-surface text-left transition-colors hover:border-primary/40"
          >
            <div className="relative aspect-[4/3] bg-surface-muted">
              <Image
                src={item.photos[0]}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {item.photos.length > 1 && (
                <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
                  {item.photos.length} photos
                </span>
              )}
            </div>
            <div className="p-3.5">
              <p className="text-[11px] uppercase tracking-wide text-secondary">{item.category}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.item.title}
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image
              src={open.item.photos[open.index]}
              alt={`${open.item.title} photo ${open.index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {open.item.photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => step(1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <div className="pt-3 text-center text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium">{open.item.title}</p>
            {open.item.description && <p className="mx-auto mt-1 max-w-xl text-xs text-white/70">{open.item.description}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
