import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ServiceStatusToggle } from "@/components/admin/service-status-toggle";

export default async function AdminServicesPage() {
  const supabase = createSupabaseAdminClient();
  const { data: services } = await supabase.from("services").select("*").order("sort_order");

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Services</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
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
                <td className="px-4 py-3 text-right">
                  <ServiceStatusToggle serviceId={service.id} active={service.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(services ?? []).length === 0 && <p className="p-6 text-sm text-muted-foreground">No services yet.</p>}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        A full create/edit form is the natural next addition here — this table
        demonstrates the read + status-toggle pattern; createService already
        exists in lib/actions/admin/services.ts and just needs a form UI.
      </p>
    </div>
  );
}
