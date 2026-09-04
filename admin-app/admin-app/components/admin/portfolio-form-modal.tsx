"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, X } from "lucide-react";
import { createProject, updateProject } from "@/lib/actions/admin/portfolio";

type ProjectLike = {
  id: string; title: string; slug: string; description: string; category: string;
  technologies: string[]; image_url: string | null; live_url: string | null;
  client_name: string | null; completion_date: string | null; tags: string[]; featured: boolean;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function PortfolioFormModal({ project }: { project?: ProjectLike }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState(project?.category ?? "business");
  const [technologies, setTechnologies] = useState(project?.technologies.join(", ") ?? "");
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.live_url ?? "");
  const [clientName, setClientName] = useState(project?.client_name ?? "");
  const [tags, setTags] = useState(project?.tags.join(", ") ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const input = {
      title,
      slug: project?.slug ?? slugify(title),
      description,
      category,
      technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrl: imageUrl || undefined,
      liveUrl: liveUrl || undefined,
      clientName: clientName || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured,
    };
    startTransition(async () => {
      const result = project ? await updateProject(project.id, input) : await createProject(input);
      if (!result.success) { setError(result.error); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={project
          ? "rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-background"
          : "flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"}
      >
        {project ? <Pencil className="h-3 w-3" /> : <Plus className="h-4 w-4" />}
        {project ? "Edit" : "Add Project"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form onSubmit={handleSubmit} className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{project ? "Edit project" : "Add project"}</h2>
              <button type="button" onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <textarea required rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="business">Business</option>
                  <option value="saas">SaaS</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="fashion">Fashion</option>
                </select>
                <input placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <input placeholder="Live URL" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <input placeholder="Technologies (comma-separated)" value={technologies} onChange={(e) => setTechnologies(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                Featured (shown first)
              </label>
              {error && <p className="text-sm text-error">{error}</p>}
              <button type="submit" disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {project ? "Save changes" : "Create project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
