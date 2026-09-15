import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/actions/portfolio";
import { PortfolioGrid } from "@/components/portfolio-grid";

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
        <PortfolioGrid projects={projects} />
      )}
    </main>
  );
}
