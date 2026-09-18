import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { RequestRow } from "@/components/admin/request-row";

export default async function AdminRequestsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: rawRequests } = await supabase
    .from("service_requests")
    .select(
      "id, tracking_number, customer_name, customer_email, customer_phone, status, created_at, internal_notes, service_id, description, location, budget_range, preferred_contact"
    )
    .order("created_at", { ascending: false });

  const serviceIds = Array.from(new Set((rawRequests ?? []).map((r) => r.service_id).filter((id): id is string => !!id)));
  const { data: services } = serviceIds.length
    ? await supabase.from("services").select("id, title").in("id", serviceIds)
    : { data: [] as { id: string; title: string }[] };
  const titleById = new Map((services ?? []).map((s) => [s.id, s.title]));

  const requests = (rawRequests ?? []).map((r) => ({ ...r, serviceTitle: r.service_id ? titleById.get(r.service_id) ?? null : null }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Requests</h1>
      <div className="mt-6 space-y-3">
        {requests.map((r) => (
          <RequestRow key={r.id} request={r} />
        ))}
        {requests.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
      </div>
    </div>
  );
}
