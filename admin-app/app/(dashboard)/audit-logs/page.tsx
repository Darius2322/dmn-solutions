import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminAuditLogPage() {
  const supabase = createSupabaseAdminClient();
  const { data: rawLogs } = await supabase
    .from("audit_log")
    .select("id, action, resource_type, resource_id, created_at, actor_id")
    .order("created_at", { ascending: false })
    .limit(200);

  const actorIds = Array.from(new Set((rawLogs ?? []).map((l) => l.actor_id).filter((id): id is string => !!id)));
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, email").in("id", actorIds)
    : { data: [] as { id: string; email: string }[] };
  const emailById = new Map((actors ?? []).map((a) => [a.id, a.email]));

  const logs = (rawLogs ?? []).map((l) => ({ ...l, adminEmail: l.actor_id ? emailById.get(l.actor_id) : null }));

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
                <td className="px-4 py-3 text-foreground">{log.adminEmail ?? "—"}</td>
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
