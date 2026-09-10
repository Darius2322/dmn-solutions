import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminVisitorsPage() {
  const supabase = createSupabaseAdminClient();
  const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60_000).toISOString();

  const { data: liveVisitors } = await supabase
    .from("visitor_sessions")
    .select("id, device_category, browser, os, last_seen")
    .gte("last_seen", fiveMinAgo);
  const { count: last24h } = await supabase
    .from("visitor_sessions")
    .select("*", { count: "exact", head: true })
    .gte("first_seen", dayAgo);
  const { data: recentSessions } = await supabase
    .from("visitor_sessions")
    .select("id, device_category, browser, os, country, first_seen, last_seen")
    .order("last_seen", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Visitors</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-2xl font-semibold text-foreground">{liveVisitors?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Online right now (active in last 5 min)</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-2xl font-semibold text-foreground">{last24h ?? 0}</p>
          <p className="text-xs text-muted-foreground">New sessions in the last 24 hours</p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-foreground">Recent sessions</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Device</th>
              <th className="px-3 py-2 font-medium">Browser</th>
              <th className="px-3 py-2 font-medium">OS</th>
              <th className="px-3 py-2 font-medium">Country</th>
              <th className="px-3 py-2 font-medium">First seen</th>
              <th className="px-3 py-2 font-medium">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {(recentSessions ?? []).map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{s.device_category ?? "—"}</td>
                <td className="px-3 py-2">{s.browser ?? "—"}</td>
                <td className="px-3 py-2">{s.os ?? "—"}</td>
                <td className="px-3 py-2">{s.country ?? "—"}</td>
                <td className="px-3 py-2">{new Date(s.first_seen).toLocaleString()}</td>
                <td className="px-3 py-2">{new Date(s.last_seen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
