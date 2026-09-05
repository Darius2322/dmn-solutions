import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PortfolioFormModal } from "@/components/admin/portfolio-form-modal";
import { ConfirmDeleteProject } from "@/components/admin/confirm-delete-project";
import { FeaturedToggle } from "@/components/admin/featured-toggle";

export default async function AdminPortfolioPage() {
  const supabase = createSupabaseAdminClient();
  const { data: projects } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
        <PortfolioFormModal />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(projects ?? []).map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-medium text-foreground">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.category}</p>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PortfolioFormModal project={p} />
              <FeaturedToggle projectId={p.id} featured={p.featured} />
              <ConfirmDeleteProject projectId={p.id} />
            </div>
          </div>
        ))}
        {(projects ?? []).length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
      </div>
    </div>
  );
}
