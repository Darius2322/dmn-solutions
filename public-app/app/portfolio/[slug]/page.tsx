import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getPortfolioBySlug } from "@/lib/actions/portfolio";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getPortfolioBySlug(params.slug);
  if (!project) return {};
  return { title: project.title, description: project.description };
}

export default async function PortfolioDetailPage({ params }: { params: { slug: string } }) {
  const project = await getPortfolioBySlug(params.slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {project.image_url && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg bg-surface sm:h-80">
          <Image src={project.image_url} alt={project.title} fill className="object-cover" />
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

      {project.live_url && (
        <a
          href={project.live_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Visit live project
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}
    </main>
  );
}
