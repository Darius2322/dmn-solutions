import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, ImageIcon } from "lucide-react";
import { getPortfolioBySlug } from "@/lib/actions/portfolio";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getPortfolioBySlug(params.slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  const project = await getPortfolioBySlug(params.slug);
  if (!project) notFound();

  const gallery: string[] = project.images && project.images.length > 0
    ? project.images
    : project.image_url
    ? [project.image_url]
    : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {gallery.length > 1 ? (
        <div className="mb-8 grid gap-3 grid-cols-2">
          {gallery.map((src, i) => (
            <div key={i} className={`relative h-40 overflow-hidden rounded-lg bg-surface sm:h-52 ${i === 0 ? "col-span-2 h-56 sm:h-72" : ""}`}>
              <Image src={src} alt={`${project.title} photo ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : gallery.length === 1 ? (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg bg-surface sm:h-80">
          <Image src={gallery[0]} alt={project.title} fill className="object-cover" />
        </div>
      ) : (
        <div className="mb-8 flex h-40 w-full items-center justify-center rounded-lg bg-surface-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
      )}

      <p className="text-xs uppercase tracking-wide text-muted-foreground">{project.category}</p>
      <h1 className="mt-1 text-2xl font-semibold text-foreground">{project.title}</h1>
      {project.client_name && <p className="mt-1 text-sm text-muted-foreground">Client: {project.client_name}</p>}

      <p className="mt-6 text-base text-muted-foreground">{project.description}</p>

      {project.technologies?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech: string) => (
            <span key={tech} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            Visit live project
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
        <Link
          href={{
            pathname: "/request-service",
            query: { similar: project.title, similarUrl: project.live_url ?? undefined },
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Request something similar
        </Link>
      </div>
    </main>
  );
}
