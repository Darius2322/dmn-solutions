import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const RANGES = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "all", label: "All time", days: null },
] as const;

function rangeStart(days: number | null) {
  if (days === null) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const activeRange = RANGES.find((r) => r.key === searchParams.range) ?? RANGES[1];
  const since = rangeStart(activeRange.days);

  const supabase = createSupabaseAdminClient();

  let pageViewsQuery = supabase.from("page_views").select("path, viewed_at");
  let eventsQuery = supabase.from("analytics_events").select("event_type, created_at");
  let requestsQuery = supabase.from("service_requests").select("id", { count: "exact", head: true });
  let messagesQuery = supabase.from("contact_messages").select("id", { count: "exact", head: true });
  let submissionsQuery = supabase.from("support_submissions").select("id", { count: "exact", head: true });

  if (since) {
    pageViewsQuery = pageViewsQuery.gte("viewed_at", since);
    eventsQuery = eventsQuery.gte("created_at", since);
    requestsQuery = requestsQuery.gte("created_at", since);
    messagesQuery = messagesQuery.gte("created_at", since);
    submissionsQuery = submissionsQuery.gte("created_at", since);
  }

  const [{ data: pageViews }, { data: events }, { count: requestCount }, { count: messageCount }, { count: submissionCount }] =
    await Promise.all([pageViewsQuery, eventsQuery, requestsQuery, messagesQuery, submissionsQuery]);

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

  const chartDays = activeRange.key === "today" ? 1 : Math.min(activeRange.days ?? 14, 14);
  const dailyCounts: { date: string; count: number }[] = [];
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = (pageViews ?? []).filter((v) => v.viewed_at.slice(0, 10) === key).length;
    dailyCounts.push({ date: key, count });
  }
  const maxCount = Math.max(1, ...dailyCounts.map((d) => d.count));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/analytics?range=${r.key}`}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                r.key === activeRange.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-surface"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Page views" value={pageViews?.length ?? 0} />
        <StatCard label="New requests" value={requestCount ?? 0} />
        <StatCard label="Contact messages" value={messageCount ?? 0} />
        <StatCard label="Support submissions" value={submissionCount ?? 0} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Page views by day</h2>
        {dailyCounts.every((d) => d.count === 0) ? (
          <p className="mt-4 text-sm text-muted-foreground">No page view data for this period.</p>
        ) : (
          <div className="mt-4 flex items-end gap-1.5" style={{ height: "120px" }}>
            {dailyCounts.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-primary/70"
                  style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}px` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="text-[9px] text-muted-foreground">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
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
