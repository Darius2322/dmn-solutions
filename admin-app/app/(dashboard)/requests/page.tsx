import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { InternalNoteField } from "@/components/admin/internal-note-field";

export default async function AdminRequestsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: rawRequests } = await supabase
    .from("service_requests")
    .select("id, tracking_number, customer_name, customer_email, status, created_at, internal_notes, service_id")
    .order("created_at", { ascending: false });

  const serviceIds = Array.from(new Set((rawRequests ?? []).map((r) => r.service_id).filter((id): id is string => !!id)));
  const { data: services } = serviceIds.length
    ? await supabase.from("services").select("id, title").in("id", serviceIds)
    : { data: [] as { id: string; title: string }[] };
  const titleById = new Map((services ?? []).map((s) => [s.id, s.title]));

  const requests = (rawRequests ?? []).map((r) => ({ ...r, serviceTitle: r.service_id ? titleById.get(r.service_id) : null }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Requests</h1>
      <div className="mt-6 space-y-3">
        {(requests ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-primary">{r.tracking_number}</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{r.customer_name}</p>
                <p className="text-xs text-muted-foreground">{r.customer_email}</p>
                <p className="text-xs text-muted-foreground">{r.serviceTitle ?? "—"}</p>
              </div>
              <RequestStatusSelect requestId={r.id} currentStatus={r.status} />
            </div>
            <InternalNoteField requestId={r.id} initialNote={r.internal_notes ?? ""} />
          </div>
        ))}
        {(requests ?? []).length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
      </div>
    </div>
  );
}
