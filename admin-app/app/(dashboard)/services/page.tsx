import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ServiceStatusToggle } from "@/components/admin/service-status-toggle";
import { ServiceFormModal } from "@/components/admin/service-form-modal";
import { DeleteServiceButton } from "@/components/admin/delete-service-button";

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

      <div className="mt-6 space-y-3 lg:hidden">
        {(services ?? []).map((service) => (
          <div key={service.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{service.title}</p>
                <p className="text-xs text-muted-foreground">{service.category}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${service.active ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                {service.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ServiceFormModal service={service} />
              <ServiceStatusToggle serviceId={service.id} active={service.active} />
              <DeleteServiceButton serviceId={service.id} />
            </div>
          </div>
        ))}
        {(services ?? []).length === 0 && <p className="text-sm text-muted-foreground">No services yet.</p>}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-lg border border-border bg-surface lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(services ?? []).map((service) => (
              <tr key={service.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{service.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{service.category}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${service.active ? "bg-success/10 text-success" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                    {service.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <ServiceFormModal service={service} />
                    <ServiceStatusToggle serviceId={service.id} active={service.active} />
                    <DeleteServiceButton serviceId={service.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(services ?? []).length === 0 && <p className="p-6 text-sm text-muted-foreground">No services yet.</p>}
      </div>
    </div>
  );
}
