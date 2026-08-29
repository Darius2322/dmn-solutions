import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Inbox, Wrench, FolderKanban, Star } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createSupabaseAdminClient();

  const [{ count: requestCount }, { count: pendingCount }, { count: serviceCount }, { count: portfolioCount }] = await Promise.all([
    supabase.from("service_requests").select("*", { count: "exact", head: true }),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "reviewing"),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("portfolio").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total requests", value: requestCount ?? 0, icon: Inbox },
    { label: "Pending review", value: pendingCount ?? 0, icon: Star },
    { label: "Active services", value: serviceCount ?? 0, icon: Wrench },
    { label: "Portfolio projects", value: portfolioCount ?? 0, icon: FolderKanban },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-border bg-surface p-5">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Visitor analytics, realtime notifications, and the remaining CRUD sections
        (portfolio, referrals, reviews, media, content, settings, audit logs) follow
        the same pattern as Services/Requests below — replicate lib/actions/admin/services.ts
        for each.
      </p>
    </div>
  );
}
