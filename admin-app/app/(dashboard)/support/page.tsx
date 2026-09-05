import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/admin/status-select";
import { updateSupportStatus } from "@/lib/actions/admin/moderation";

const SUPPORT_STATUSES = ["pending", "acknowledged", "received"];

export default async function AdminSupportPage() {
  const supabase = createSupabaseAdminClient();
  const { data: submissions } = await supabase
    .from("support_submissions")
    .select("id, type, donor_name, donor_email, donor_phone, details, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Support</h1>
      <div className="mt-6 space-y-3">
        {(submissions ?? []).map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {s.type === "equipment_donation" ? "Equipment donation" : "Financial support"}
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">{s.donor_name ?? "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">{s.donor_email} {s.donor_phone ? `· ${s.donor_phone}` : ""}</p>
                <p className="mt-2 text-sm text-foreground">{s.details}</p>
              </div>
              <StatusSelect id={s.id} currentStatus={s.status} options={SUPPORT_STATUSES} action={updateSupportStatus} />
            </div>
          </div>
        ))}
        {(submissions ?? []).length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
      </div>
    </div>
  );
}
