"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, ImageIcon, MoreVertical, Trash2, EyeOff, Eye, X } from "lucide-react";
import { PortfolioFormModal } from "@/components/admin/portfolio-form-modal";
import { PortfolioStatusToggle } from "@/components/admin/portfolio-status-toggle";
import { FeaturedToggle } from "@/components/admin/featured-toggle";
import { ConfirmDeleteProject } from "@/components/admin/confirm-delete-project";
import { DetailsModal } from "@/components/admin/details-modal";
import { deleteProject, updateProjectStatus } from "@/lib/actions/admin/portfolio";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

type Project = {
  id: string; title: string; slug: string; description: string; category: string;
  active: boolean; featured: boolean; created_at: string; updated_at: string | null;
  client_name: string | null; live_url: string | null; image_url: string | null;
};

export function PortfolioAdminList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "featured">("newest");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects]
  );

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      const matchesQuery = query.trim() === "" || p.title.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      const matchesStatus = status === "all" || (status === "visible" ? p.active : !p.active);
      return matchesQuery && matchesCategory && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      if (sort === "featured") return Number(b.featured) - Number(a.featured);
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });

    return list;
  }, [projects, query, category, status, sort]);

  function toggleSelectMode() {
    setSelectMode((v) => !v);
    setSelected(new Set());
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(action: "hide" | "show" | "delete") {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "delete" && !window.confirm(`Delete ${ids.length} project(s)? This cannot be undone.`)) return;

    startTransition(async () => {
      if (action === "delete") {
        await Promise.all(ids.map((id) => deleteProject(id)));
      } else {
        await Promise.all(ids.map((id) => updateProjectStatus(id, action === "show")));
      }
      setSelected(new Set());
      setSelectMode(false);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search portfolio..."
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          <option value="all">All statuses</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="featured">Featured first</option>
        </select>
        <button
          type="button"
          onClick={toggleSelectMode}
          aria-label="Toggle selection mode"
          className={`rounded-md border p-2 ${selectMode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-background"}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {selectMode && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2">
          <span className="text-xs font-medium text-foreground">{selected.size} selected</span>
          <button disabled={selected.size === 0 || isPending} onClick={() => runBulk("hide")}
            className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-background disabled:opacity-50">
            <EyeOff className="h-3.5 w-3.5" /> Hide
          </button>
          <button disabled={selected.size === 0 || isPending} onClick={() => runBulk("show")}
            className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-background disabled:opacity-50">
            <Eye className="h-3.5 w-3.5" /> Show
          </button>
          <button disabled={selected.size === 0 || isPending} onClick={() => runBulk("delete")}
            className="flex items-center gap-1 rounded-md border border-error/30 bg-surface px-3 py-1.5 text-xs text-error hover:bg-error/5 disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button onClick={toggleSelectMode} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-lg border border-border bg-surface">
            {selectMode && (
              <label className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border border-border bg-surface">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleItem(p.id)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            )}
            {p.image_url ? (
              <div className="relative h-28 w-full bg-background">
                <Image src={p.image_url} alt={p.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-28 w-full items-center justify-center bg-surface-muted">
                <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
            )}
            <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{p.title}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${p.active ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {p.active ? "Visible" : "Hidden"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{p.category}</p>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PortfolioFormModal project={p as any} />
              <PortfolioStatusToggle projectId={p.id} active={p.active} />
              <FeaturedToggle projectId={p.id} featured={p.featured} />
              <DetailsModal
                title={p.title}
                rows={[
                  { label: "Added", value: formatDate(p.created_at) },
                  { label: "Last edited", value: formatDate(p.updated_at) },
                  { label: "Status", value: p.active ? "Visible" : "Hidden" },
                  { label: "Featured", value: p.featured ? "Yes" : "No" },
                  { label: "Slug", value: p.slug },
                  { label: "Client", value: p.client_name ?? "—" },
                  { label: "Live URL", value: p.live_url ?? "—" },
                ]}
              />
              <ConfirmDeleteProject projectId={p.id} />
            </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No projects match your filters.</p>}
      </div>
    </div>
  );
}
