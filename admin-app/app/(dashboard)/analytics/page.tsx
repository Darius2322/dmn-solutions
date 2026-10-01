import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const RANGES = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: null },
] as const;

// Kenya time (UTC+3, no daylight saving). All days/hours below are shown in EAT.
const EAT_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const eat = (iso: string) => new Date(new Date(iso).getTime() + EAT_MS);
const dayKey = (iso: string) => eat(iso).toISOString().slice(0, 10);

function startOfTodayEatUtc(): number {
  const nowEat = Date.now() + EAT_MS;
  return Math.floor(nowEat / DAY_MS) * DAY_MS - EAT_MS;
}

async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null }>
): Promise<T[]> {
  const out: T[] = [];
  const size = 1000;
  for (let from = 0; from < 50000; from += size) {
    const { data } = await build(from, from + size - 1);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < size) break;
  }
  return out;
}

function normalizePath(p: string): string {
  const clean = p.split("?")[0].replace(/\/+$/, "") || "/";
  if (/^\/track-order\/.+/.test(clean)) return "/track-order/[code]";
  return clean;
}

function classifySource(ref: string | null): string {
  if (!ref) return "Direct / unknown";
  let host = "";
  try {
    host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Other";
  }
  if (host.includes("google.")) return "Google";
  if (host.includes("bing.") || host.includes("duckduckgo") || host.includes("yahoo.") || host.includes("ecosia")) return "Other search engines";
  if (/(facebook|fb\.com|instagram|tiktok|twitter|x\.com|t\.co|linkedin|youtube|whatsapp|wa\.me|telegram|pinterest|reddit)/.test(host)) return "Social media";
  if (host.includes("vercel") || host.endsWith("dmnsolutions.co.ke")) return "Internal / Vercel";
  return "Other websites";
}

function refHost(ref: string | null): string | null {
  if (!ref) return null;
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function pct(n: number, d: number): string {
  if (!d) return "0%";
  return `${((n / d) * 100).toFixed(n / d < 0.1 ? 1 : 0)}%`;
}

function Delta({ now, before }: { now: number; before: number | null }) {
  if (before === null) return null;
  if (before === 0) return <span className="text-xs text-muted-foreground">{now > 0 ? "new" : "–"}</span>;
  const change = ((now - before) / before) * 100;
  const up = change >= 0;
  return (
    <span className={`text-xs font-medium ${up ? "text-green-600" : "text-red-600"}`}>
      {up ? "▲" : "▼"} {Math.abs(change).toFixed(0)}%
    </span>
  );
}

function StatCard({ label, value, hint, delta }: { label: string; value: string | number; hint?: string; delta?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {delta}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BarList({ rows, empty, total }: { rows: { label: string; value: number; extra?: string }[]; empty: string; total?: number }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-foreground">{r.label}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {r.value}
              {total ? ` · ${pct(r.value, total)}` : ""}
              {r.extra ? ` · ${r.extra}` : ""}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-border/60">
            <div className="h-1.5 rounded-full bg-primary/70" style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function tally<T>(items: T[], key: (i: T) => string): [string, number][] {
  const m = new Map<string, number>();
  for (const i of items) {
    const k = key(i);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: { range?: string } }) {
  const active = RANGES.find((r) => r.key === searchParams.range) ?? RANGES[1];
  const supabase = createSupabaseAdminClient();

  const todayStart = startOfTodayEatUtc();
  const sinceMs: number | null = active.days === null ? null : todayStart - (active.days - 1) * DAY_MS;
  const since = sinceMs === null ? null : new Date(sinceMs).toISOString();
  const prevSince = active.days === null || sinceMs === null ? null : new Date(sinceMs - active.days * DAY_MS).toISOString();

  type PV = { session_id: string; path: string; viewed_at: string };
  type Sess = { id: string; country: string | null; region: string | null; county: string | null; city: string | null; device_category: string | null; browser: string | null; os: string | null; referrer: string | null; first_seen: string; last_seen: string };
  type Ev = { event_type: string; created_at: string };

  const pvs = await fetchAll<PV>((from, to) => {
    let q = supabase.from("page_views").select("session_id, path, viewed_at").order("viewed_at", { ascending: true });
    if (since) q = q.gte("viewed_at", since);
    return q.range(from, to) as unknown as PromiseLike<{ data: PV[] | null }>;
  });
  const views = pvs.filter((v) => !v.path.startsWith("/admin"));

  const prevViews =
    prevSince && since
      ? await fetchAll<{ session_id: string }>((from, to) =>
          supabase
            .from("page_views")
            .select("session_id")
            .gte("viewed_at", prevSince)
            .lt("viewed_at", since)
            .range(from, to) as unknown as PromiseLike<{ data: { session_id: string }[] | null }>
        )
      : null;

  const sessionIds = new Set(views.map((v) => v.session_id));
  const sessions = (
    await fetchAll<Sess>((from, to) => {
      let q = supabase
        .from("visitor_sessions")
        .select("id, country, region, county, city, device_category, browser, os, referrer, first_seen, last_seen")
        .order("first_seen", { ascending: false });
      if (since) q = q.gte("last_seen", since);
      return q.range(from, to) as unknown as PromiseLike<{ data: Sess[] | null }>;
    })
  ).filter((s) => sessionIds.has(s.id));

  const events = await fetchAll<Ev>((from, to) => {
    let q = supabase.from("analytics_events").select("event_type, created_at");
    if (since) q = q.gte("created_at", since);
    return q.range(from, to) as unknown as PromiseLike<{ data: Ev[] | null }>;
  });

  const countSince = async (table: "service_requests" | "contact_messages" | "support_submissions" | "feedback") => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (since) q = q.gte("created_at", since);
    const { count } = await q;
    return count ?? 0;
  };
  const [requestCount, messageCount, supportCount, reviewCount] = await Promise.all([
    countSince("service_requests"),
    countSince("contact_messages"),
    countSince("support_submissions"),
    countSince("feedback"),
  ]);

  const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const { count: onlineNow } = await supabase
    .from("visitor_sessions")
    .select("id", { count: "exact", head: true })
    .gte("last_seen", fiveMinAgo);

  // ----- headline numbers -----
  const totalViews = views.length;
  const visitors = sessionIds.size;
  const prevTotal = prevViews ? prevViews.length : null;
  const prevVisitors = prevViews ? new Set(prevViews.map((v) => v.session_id)).size : null;

  const viewsPerSession = new Map<string, number>();
  const pathsPerSession = new Map<string, Set<string>>();
  for (const v of views) {
    viewsPerSession.set(v.session_id, (viewsPerSession.get(v.session_id) ?? 0) + 1);
    const set = pathsPerSession.get(v.session_id) ?? new Set<string>();
    set.add(normalizePath(v.path));
    pathsPerSession.set(v.session_id, set);
  }
  const bounced = [...viewsPerSession.values()].filter((n) => n === 1).length;
  const pagesPerVisit = visitors ? (totalViews / visitors).toFixed(1) : "0";

  let returning = 0;
  for (const s of sessions) {
    if (since && new Date(s.first_seen).getTime() < new Date(since).getTime()) returning++;
    else if (!since && dayKey(s.first_seen) !== dayKey(s.last_seen)) returning++;
  }

  // ----- daily trend (EAT) -----
  const firstViewDayStart = views.length
    ? Math.floor((new Date(views[0].viewed_at).getTime() + EAT_MS) / DAY_MS) * DAY_MS - EAT_MS
    : todayStart;
  const daysSinceFirst = Math.floor((todayStart - firstViewDayStart) / DAY_MS) + 1;
  const spanDays = active.days === null ? Math.min(90, Math.max(1, daysSinceFirst)) : Math.min(active.days, 90);
  const days: { date: string; views: number; visitors: number }[] = [];
  for (let i = spanDays - 1; i >= 0; i--) {
    const key = new Date(todayStart - i * DAY_MS + EAT_MS).toISOString().slice(0, 10);
    days.push({ date: key, views: 0, visitors: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  const daySessions = new Map<string, Set<string>>();
  for (const v of views) {
    const k = dayKey(v.viewed_at);
    const idx = dayIndex.get(k);
    if (idx === undefined) continue;
    days[idx].views++;
    const set = daySessions.get(k) ?? new Set<string>();
    set.add(v.session_id);
    daySessions.set(k, set);
  }
  for (const d of days) d.visitors = daySessions.get(d.date)?.size ?? 0;
  const maxDay = Math.max(1, ...days.map((d) => d.views));
  const bestDay = days.reduce((a, b) => (b.views > a.views ? b : a), days[0] ?? { date: "-", views: 0, visitors: 0 });

  // ----- hour of day (EAT) & weekday -----
  const hours = Array.from({ length: 24 }, () => 0);
  const weekdays = Array.from({ length: 7 }, () => 0);
  for (const v of views) {
    const d = eat(v.viewed_at);
    hours[d.getUTCHours()]++;
    weekdays[d.getUTCDay()]++;
  }
  const maxHour = Math.max(1, ...hours);
  const peakHour = hours.indexOf(Math.max(...hours));
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`;

  // ----- pages -----
  const pageStats = new Map<string, { views: number; visitors: Set<string> }>();
  for (const v of views) {
    const p = normalizePath(v.path);
    const cur = pageStats.get(p) ?? { views: 0, visitors: new Set<string>() };
    cur.views++;
    cur.visitors.add(v.session_id);
    pageStats.set(p, cur);
  }
  const pageRows = [...pageStats.entries()].sort((a, b) => b[1].views - a[1].views);
  const topPages = pageRows.slice(0, 12).map(([p, s]) => ({ label: p, value: s.views, extra: `${s.visitors.size} visitors` }));
  const portfolioRows = pageRows
    .filter(([p]) => p.startsWith("/portfolio/"))
    .slice(0, 10)
    .map(([p, s]) => ({ label: p.replace("/portfolio/", ""), value: s.views, extra: `${s.visitors.size} visitors` }));
  const serviceRows = pageRows
    .filter(([p]) => p.startsWith("/services/"))
    .slice(0, 10)
    .map(([p, s]) => ({ label: p.replace("/services/", "").replace(/-/g, " "), value: s.views, extra: `${s.visitors.size} visitors` }));

  // entry pages: first page of each session in this window
  const firstPage = new Map<string, string>();
  for (const v of views) if (!firstPage.has(v.session_id)) firstPage.set(v.session_id, normalizePath(v.path));
  const entryRows = tally([...firstPage.values()], (p) => p).slice(0, 8).map(([label, value]) => ({ label, value }));

  // ----- sources & tech -----
  const sourceRows = tally(sessions, (s) => classifySource(s.referrer)).map(([label, value]) => ({ label, value }));
  const hostRows = tally(
    sessions.filter((s) => refHost(s.referrer)),
    (s) => refHost(s.referrer)!
  )
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
  const deviceRows = tally(sessions, (s) => s.device_category ?? "unknown").map(([label, value]) => ({ label, value }));
  const browserRows = tally(sessions, (s) => s.browser ?? "unknown").map(([label, value]) => ({ label, value }));
  const osRows = tally(sessions, (s) => s.os ?? "unknown").map(([label, value]) => ({ label, value }));
  const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countryName = (code: string) => {
    try { return countryNames.of(code) ?? code; } catch { return code; }
  };
  const located = sessions.filter((s) => s.country);
  const countryRows = tally(located, (s) => countryName(s.country!)).slice(0, 10).map(([label, value]) => ({ label, value }));
  const kenyaSessions = located.filter((s) => s.country === "KE");
  const countyRows = tally(kenyaSessions.filter((s) => s.county), (s) => s.county!).slice(0, 12).map(([label, value]) => ({ label, value }));
  const regionRows = tally(
    located.filter((s) => s.region),
    (s) => (s.country === "KE" ? s.region! : `${s.region}, ${countryName(s.country!)}`)
  ).slice(0, 10).map(([label, value]) => ({ label, value }));
  const cityRows = tally(located.filter((s) => s.city), (s) => `${s.city}${s.country && s.country !== "KE" ? `, ${countryName(s.country)}` : ""}`)
    .slice(0, 12).map(([label, value]) => ({ label, value }));
  const googleVisitors = sessions.filter((s) => classifySource(s.referrer) === "Google").length;

  // ----- goals -----
  const eventRows = tally(events, (e) => e.event_type.replace(/_/g, " ")).map(([label, value]) => ({ label, value }));
  const requestEvents = events.filter((e) => e.event_type === "request_submitted").length;
  const conversions = Math.max(requestCount, requestEvents) + messageCount;

  const recent = [...sessions]
    .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground">
            {active.label}
            {since ? ` · from ${dayKey(since)}` : " · since tracking began"} · times in Kenya time (EAT) · admin pages excluded
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/analytics?range=${r.key}`}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                r.key === active.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-surface"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Page views" value={totalViews} delta={<Delta now={totalViews} before={prevTotal} />} hint={prevTotal !== null ? `vs ${prevTotal} previous period` : undefined} />
        <StatCard label="Unique visitors" value={visitors} delta={<Delta now={visitors} before={prevVisitors} />} hint={prevVisitors !== null ? `vs ${prevVisitors} previous period` : undefined} />
        <StatCard label="Pages per visit" value={pagesPerVisit} hint={`${pct(bounced, visitors)} left after 1 page`} />
        <StatCard label="Online now" value={onlineNow ?? 0} hint="active in the last 5 minutes" />
        <StatCard label="Returning visitors" value={returning} hint={`${pct(returning, visitors)} of visitors`} />
        <StatCard label="From Google" value={googleVisitors} hint={`${pct(googleVisitors, visitors)} of visitors`} />
        <StatCard label="Peak hour" value={totalViews ? hourLabel(peakHour) : "–"} hint="busiest time of day (EAT)" />
        <StatCard label="Best day" value={bestDay && bestDay.views ? bestDay.date.slice(5) : "–"} hint={bestDay?.views ? `${bestDay.views} views` : undefined} />
      </div>

      {/* Daily trend */}
      <Section title="Traffic by day" subtitle="Light bar = page views, dark bar = unique visitors">
        {days.every((d) => d.views === 0) ? (
          <p className="text-sm text-muted-foreground">No traffic in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1" style={{ height: "150px", minWidth: `${Math.max(days.length * 14, 280)}px` }}>
              {days.map((d, i) => (
                <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${d.views} views, ${d.visitors} visitors`}>
                  <div className="relative flex w-full items-end" style={{ height: "120px" }}>
                    <div className="absolute bottom-0 w-full rounded-t-sm bg-primary/25" style={{ height: `${d.views ? Math.max(3, (d.views / maxDay) * 120) : 0}px` }} />
                    <div className="absolute bottom-0 w-full rounded-t-sm bg-primary" style={{ height: `${d.visitors ? Math.max(3, (d.visitors / maxDay) * 120) : 0}px` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{i % Math.ceil(days.length / 10) === 0 ? d.date.slice(5) : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Busiest hours" subtitle="Page views by hour of day (Kenya time)">
          <div className="flex items-end gap-[3px]" style={{ height: "110px" }}>
            {hours.map((n, h) => (
              <div key={h} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${hourLabel(h)}: ${n} views`}>
                <div className="w-full rounded-t-sm bg-primary/70" style={{ height: `${n ? Math.max(3, (n / maxHour) * 90) : 0}px` }} />
                <span className="text-[8px] text-muted-foreground">{h % 3 === 0 ? hourLabel(h) : ""}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Busiest weekdays" subtitle="Page views by day of the week">
          <BarList rows={WD.map((label, i) => ({ label, value: weekdays[i] }))} empty="No data yet." total={totalViews} />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Most visited pages" subtitle="Views and unique visitors per page">
          <BarList rows={topPages} empty="No page views yet." />
        </Section>
        <Section title="Where visitors land first" subtitle="The first page of each visit">
          <BarList rows={entryRows} empty="No data yet." total={visitors} />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Portfolio projects viewed">
          <BarList rows={portfolioRows} empty="No portfolio project views yet." />
        </Section>
        <Section title="Services viewed">
          <BarList rows={serviceRows} empty="No service page views yet." />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Where visitors come from" subtitle="Based on the site that sent them">
          <BarList rows={sourceRows} empty="No data yet." total={visitors} />
          {hostRows.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Top referring sites</p>
              <BarList rows={hostRows} empty="" />
            </div>
          )}
        </Section>
        <Section title="Devices, browsers and systems">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Device</p>
          <BarList rows={deviceRows} empty="No data yet." total={visitors} />
          <p className="mb-2 mt-5 text-xs font-medium text-muted-foreground">Browser</p>
          <BarList rows={browserRows} empty="No data yet." total={visitors} />
          <p className="mb-2 mt-5 text-xs font-medium text-muted-foreground">Operating system</p>
          <BarList rows={osRows} empty="No data yet." total={visitors} />
        </Section>
      </div>

      <Section
        title="Where visitors are"
        subtitle={`Country, county, region and city. Recorded for ${located.length} of ${visitors} visitors; visits before location tracking was added show no location.`}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Country</p>
            <BarList rows={countryRows} empty="No location data yet. It fills in as new visitors arrive." total={located.length} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">County (Kenya)</p>
            <BarList rows={countyRows} empty="No county data yet." total={kenyaSessions.length} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Region</p>
            <BarList rows={regionRows} empty="No region data yet." total={located.length} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">City</p>
            <BarList rows={cityRows} empty="No city data yet." total={located.length} />
          </div>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Location comes from the visitor&apos;s internet connection, so it is approximate. Mobile data users are often placed in the nearest big city (usually Nairobi).
        </p>
      </Section>

      <Section title="Results (what visitors did)" subtitle="Actions taken in this period">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Service requests" value={requestCount} />
          <StatCard label="Contact messages" value={messageCount} />
          <StatCard label="Support submissions" value={supportCount} />
          <StatCard label="New reviews" value={reviewCount} />
          <StatCard label="Visitors who reached out" value={pct(conversions, visitors)} hint="requests + messages ÷ visitors" />
        </div>
        {eventRows.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Tracked events</p>
            <BarList rows={eventRows} empty="" />
          </div>
        )}
      </Section>

      <Section title="Latest visitors" subtitle="Most recent visits in this period">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Last seen (EAT)</th>
                <th className="py-2 pr-3 font-medium">Device</th>
                <th className="py-2 pr-3 font-medium">Browser</th>
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Pages</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-3">{eat(s.last_seen).toISOString().slice(5, 16).replace("T", " ")}</td>
                  <td className="py-2 pr-3">{s.device_category ?? "—"}</td>
                  <td className="py-2 pr-3">{s.browser ?? "—"}</td>
                  <td className="py-2 pr-3">{refHost(s.referrer) ?? "Direct"}</td>
                  <td className="py-2 pr-3">{viewsPerSession.get(s.id) ?? 0}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-sm text-muted-foreground">No visitors in this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <p className="text-xs text-muted-foreground">
        These numbers come from your own site tracking, so they include your own visits. For Google search data (impressions, clicks, search terms), use Google Search Console.
      </p>
    </div>
  );
}
