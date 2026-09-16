import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ServiceFormModal } from "@/components/admin/service-form-modal";
import { ServicesAdminList } from "@/components/admin/services-admin-list";

export default async function AdminServicesPage() {
  const supabase = createSupabaseAdminClient();
  const { data: services, error } = await supabase.from("services").select("*").order("sort_order");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Services</h1>
        <ServiceFormModal />
      </div>

      {error && <p className="mt-4 text-sm text-error">Could not load services. Try refreshing.</p>}

      <ServicesAdminList services={services ?? []} />
    </div>
  );
}
