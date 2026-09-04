import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { AdminToggle } from "@/components/admin/admin-toggle";

export default async function AdminCustomersPage() {
  const supabase = createSupabaseAdminClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everyone who has signed up. Granting admin here is the only way admin access is ever given —
        it flips a database column, checked by every page and every RLS policy in this app.
      </p>
      <div className="mt-6 space-y-2">
        {(profiles ?? []).map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{p.full_name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{p.email}</p>
            </div>
            <AdminToggle profileId={p.id} isAdmin={p.is_admin} />
          </div>
        ))}
        {(profiles ?? []).length === 0 && <p className="text-sm text-muted-foreground">No registered customers yet.</p>}
      </div>
    </div>
  );
}
