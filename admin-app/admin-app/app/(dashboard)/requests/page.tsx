import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { InternalNoteField } from "@/components/admin/internal-note-field";

export default async function AdminRequestsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: requests } = await supabase
    .from("service_requests")
    .select("id, tracking_number, customer_name, customer_email, status, created_at, internal_notes, services(title)")
    .order("created_at", { ascending: false });

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
                {/* @ts-expect-error joined relation shape */}
                <p className="text-xs text-muted-foreground">{r.services?.title ?? "—"}</p>
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
