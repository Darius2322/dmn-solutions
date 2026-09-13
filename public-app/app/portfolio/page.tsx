import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/actions/portfolio";

export const metadata: Metadata = { title: "Portfolio", description: "Recent work from DMN Solutions." };

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Portfolio</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">A selection of completed projects.</p>

      {projects.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">No projects published yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.slug}`}
              className="overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary/40"
            >
              {project.live_url ? (
                <div className="relative h-40 w-full overflow-hidden bg-background">
                  <iframe
                    src={project.live_url}
                    title={project.title}
                    loading="lazy"
                    scrolling="no"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                    style={{ width: "400%", height: "400%", transform: "scale(0.25)" }}
                  />
                </div>
              ) : project.image_url ? (
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
      )}
    </main>
  );
}
