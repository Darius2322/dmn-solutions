import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PortfolioFormModal } from "@/components/admin/portfolio-form-modal";
import { PortfolioImportButtons } from "@/components/admin/portfolio-import-buttons";
import { PortfolioStatusToggle } from "@/components/admin/portfolio-status-toggle";
import { ConfirmDeleteProject } from "@/components/admin/confirm-delete-project";
import { FeaturedToggle } from "@/components/admin/featured-toggle";
import { DetailsModal } from "@/components/admin/details-modal";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default async function AdminPortfolioPage() {
  const supabase = createSupabaseAdminClient();
  const { data: projects } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
        <div className="flex flex-wrap items-center gap-2">
          <PortfolioImportButtons />
          <PortfolioFormModal />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(projects ?? []).map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{p.title}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${p.active ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {p.active ? "Visible" : "Hidden"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{p.category}</p>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PortfolioFormModal project={p} />
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
        ))}
        {(projects ?? []).length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
      </div>
    </div>
  );
}
