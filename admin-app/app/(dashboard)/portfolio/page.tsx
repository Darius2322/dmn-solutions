import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PortfolioFormModal } from "@/components/admin/portfolio-form-modal";
import { PortfolioImportButtons } from "@/components/admin/portfolio-import-buttons";
import { PortfolioAdminList } from "@/components/admin/portfolio-admin-list";

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
      <div className="mt-6">
        <PortfolioAdminList projects={projects ?? []} />
      </div>
    </div>
  );
}
