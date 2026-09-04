import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/admin/status-select";
import { updateReferralStatus } from "@/lib/actions/admin/moderation";

const REFERRAL_STATUSES = ["submitted", "contacted", "converted", "declined"];

export default async function AdminReferralsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, reference_number, referrer_name, referrer_email, referred_name, referred_contact, service_interested, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Referrals</h1>
      <div className="mt-6 space-y-3">
        {(referrals ?? []).map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-primary">{r.reference_number}</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">Referred: {r.referred_name}</p>
                <p className="text-xs text-muted-foreground">Contact: {r.referred_contact}</p>
                <p className="text-xs text-muted-foreground">Interested in: {r.service_interested ?? "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">By {r.referrer_name} ({r.referrer_email})</p>
              </div>
              <StatusSelect
                id={r.id}
                currentStatus={r.status}
                options={REFERRAL_STATUSES}
                action={updateReferralStatus}
              />
            </div>
          </div>
        ))}
        {(referrals ?? []).length === 0 && <p className="text-sm text-muted-foreground">No referrals yet.</p>}
      </div>
    </div>
  );
}
