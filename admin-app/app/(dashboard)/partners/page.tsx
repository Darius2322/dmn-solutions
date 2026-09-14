import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PartnerFormModal } from "@/components/admin/partner-form-modal";
import { PartnerStatusToggle } from "@/components/admin/partner-status-toggle";
import { ConfirmDeletePartner } from "@/components/admin/confirm-delete-partner";

export default async function AdminPartnersPage() {
  const supabase = createSupabaseAdminClient();
  const { data: partners } = await supabase.from("partners").select("*").order("sort_order");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Partners</h1>
        <PartnerFormModal />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(partners ?? []).map((partner) => (
          <div key={partner.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{partner.name}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${partner.active ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {partner.active ? "Visible" : "Hidden"}
              </span>
            </div>
            {partner.website_url && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{partner.website_url}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <PartnerFormModal partner={partner} />
              <PartnerStatusToggle partnerId={partner.id} active={partner.active} />
              <ConfirmDeletePartner partnerId={partner.id} />
            </div>
          </div>
        ))}
        {(partners ?? []).length === 0 && <p className="text-sm text-muted-foreground">No partners yet.</p>}
      </div>
    </div>
  );
}
