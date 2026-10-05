import type { Metadata } from "next";
import { getPortfolioProjects } from "@/lib/actions/portfolio";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { SiteWorkGallery, type SiteWork } from "@/components/site-work-gallery";

export const metadata: Metadata = { title: "Portfolio", description: "Portfolio of DMN Solutions: websites, software, electrical installations and site work completed for clients in Nairobi, Kisii, Nyamira and across Kenya." };

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();

  // Projects with a live link get a full case-study page; projects without one
  // (e.g. electrical installations, plumbing) live in the Site work gallery.
  const linked = projects.filter((p) => !!p.live_url?.trim());
  const siteWork: SiteWork[] = projects
    .filter((p) => !p.live_url?.trim())
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      photos: p.images && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : [],
    }))
    .filter((p) => p.photos.length > 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Portfolio</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">A selection of completed projects.</p>

      {projects.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">No projects published yet.</p>
      ) : (
        <>
          {linked.length > 0 && <PortfolioGrid projects={linked} />}
          {siteWork.length > 0 && <SiteWorkGallery items={siteWork} />}
        </>
      )}
    </main>
  );
}
