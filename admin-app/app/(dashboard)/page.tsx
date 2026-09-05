import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Inbox, Wrench, FolderKanban, Star, Share2, HandHeart, MessageSquare, Users } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = createSupabaseAdminClient();

  const [
    { count: requestCount },
    { count: pendingCount },
    { count: serviceCount },
    { count: portfolioCount },
    { count: reviewCount },
    { count: referralCount },
    { count: supportCount },
    { count: messageCount },
    { count: customerCount },
  ] = await Promise.all([
    supabase.from("service_requests").select("*", { count: "exact", head: true }),
    supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "reviewing"),
    supabase.from("services").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("portfolio").select("*", { count: "exact", head: true }),
    supabase.from("feedback").select("*", { count: "exact", head: true }).eq("approved", true),
    supabase.from("referrals").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("support_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total requests", value: requestCount ?? 0, icon: Inbox },
    { label: "Pending review", value: pendingCount ?? 0, icon: Star },
    { label: "Active services", value: serviceCount ?? 0, icon: Wrench },
    { label: "Portfolio projects", value: portfolioCount ?? 0, icon: FolderKanban },
    { label: "Approved reviews", value: reviewCount ?? 0, icon: Star },
    { label: "New referrals", value: referralCount ?? 0, icon: Share2 },
    { label: "Pending support", value: supportCount ?? 0, icon: HandHeart },
    { label: "Unread messages", value: messageCount ?? 0, icon: MessageSquare },
    { label: "Customers", value: customerCount ?? 0, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Live counts from your Supabase project.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
}
