"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon, Search } from "lucide-react";

const PAGE_SIZE = 6;

type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  live_url: string | null;
};

export function PortfolioGrid({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects]
  );

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesQuery = query.trim() === "" || p.title.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [projects, query, category]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="Search projects..."
            className="w-full rounded-md border border-border bg-surface py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setVisibleCount(PAGE_SIZE); }}
          className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">No projects match your search.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug}`}
                className="overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary/40"
              >
                {project.image_url ? (
                  <div className="relative h-40 w-full bg-background">
                    <Image src={project.image_url} alt={project.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-surface-muted">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{project.category}</p>
                  <h2 className="mt-1 text-sm font-medium text-foreground">{project.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="rounded-md border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
              >
                View more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
