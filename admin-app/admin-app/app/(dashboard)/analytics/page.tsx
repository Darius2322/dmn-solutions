import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = createSupabaseAdminClient();

  const [{ count: totalPageViews }, { data: pageViews }, { data: events }] = await Promise.all([
    supabase.from("page_views").select("*", { count: "exact", head: true }),
    supabase.from("page_views").select("path"),
    supabase.from("analytics_events").select("event_type"),
  ]);

  const topPages = Object.entries(
    (pageViews ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.path] = (acc[row.path] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const eventCounts = Object.entries(
    (events ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.event_type] = (acc[row.event_type] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <p className="text-2xl font-semibold text-foreground">{totalPageViews ?? 0}</p>
        <p className="text-xs text-muted-foreground">Total page views recorded</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Most visited pages</h2>
          <div className="mt-3 space-y-1.5">
            {topPages.map(([path, count]) => (
              <div key={path} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span className="truncate text-foreground">{path}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
            {topPages.length === 0 && <p className="text-sm text-muted-foreground">No page view data yet.</p>}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Events</h2>
          <div className="mt-3 space-y-1.5">
            {eventCounts.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span className="text-foreground">{type.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
            {eventCounts.length === 0 && <p className="text-sm text-muted-foreground">No events recorded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
