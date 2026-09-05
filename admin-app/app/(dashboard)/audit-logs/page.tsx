import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminAuditLogPage() {
  const supabase = createSupabaseAdminClient();
  const { data: logs } = await supabase
    .from("audit_log")
    .select("id, action, resource_type, resource_id, created_at, profiles(email)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Audit Logs</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every create, update, and delete any admin makes is recorded here automatically. Read-only by design.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">When</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Admin</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Resource</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                {/* @ts-expect-error joined relation shape */}
                <td className="px-4 py-3 text-foreground">{log.profiles?.email ?? "—"}</td>
                <td className="px-4 py-3 text-foreground">{log.action}</td>
                <td className="px-4 py-3 text-muted-foreground">{log.resource_type} {log.resource_id ? `#${String(log.resource_id).slice(0, 8)}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(logs ?? []).length === 0 && <p className="p-6 text-sm text-muted-foreground">No actions logged yet.</p>}
      </div>
    </div>
  );
}
