import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { RequestStatusSelect } from "@/components/admin/request-status-select";

export default async function AdminRequestsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: requests } = await supabase
    .from("service_requests")
    .select("id, tracking_number, customer_name, customer_email, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Service Requests</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Received</th>
            </tr>
          </thead>
          <tbody>
            {(requests ?? []).map((request) => (
              <tr key={request.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{request.tracking_number}</td>
                <td className="px-4 py-3 text-foreground">
                  {request.customer_name}
                  <span className="block text-xs text-muted-foreground">{request.customer_email}</span>
                </td>
                <td className="px-4 py-3">
                  <RequestStatusSelect requestId={request.id} currentStatus={request.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(requests ?? []).length === 0 && <p className="p-6 text-sm text-muted-foreground">No requests yet.</p>}
      </div>
    </div>
  );
}
