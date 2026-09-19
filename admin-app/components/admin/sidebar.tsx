"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  FolderKanban,
  Users,
  Star,
  MessageSquare,
  Share2,
  HandHeart,
  Handshake,
  HelpCircle,
  Activity,
  BarChart3,
  ImageIcon,
  FileText,
  Settings,
  ScrollText,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";
import { NotificationBell } from "./notification-bell";
import { getUnreadCountsByType } from "@/lib/actions/admin/notifications";

const BADGE_TYPE_BY_HREF: Record<string, string> = {
  "/requests": "service_request",
  "/messages": "contact_message",
  "/support": "support_submission",
};

const NAV_GROUPS: { label: string | null; items: { href: string; label: string; icon: any }[] }[] = [
  {
    label: null,
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Website",
    items: [
      { href: "/services", label: "Services", icon: Wrench },
      { href: "/portfolio", label: "Portfolio", icon: FolderKanban },
      { href: "/partners", label: "Partners", icon: Handshake },
      { href: "/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/reviews", label: "Reviews", icon: Star },
      { href: "/content", label: "Content", icon: FileText },
      { href: "/media", label: "Media", icon: ImageIcon },
    ],
  },
  {
    label: "Requests & Communication",
    items: [
      { href: "/requests", label: "Requests", icon: Inbox },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/messages", label: "Messages", icon: MessageSquare },
      { href: "/referrals", label: "Referrals", icon: Share2 },
      { href: "/support", label: "Support", icon: HandHeart },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/visitors", label: "Visitors", icon: Activity },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function refresh() {
      const counts = await getUnreadCountsByType();
      setBadgeCounts(counts);
    }
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group, gi) => (
        <div key={group.label ?? `group-${gi}`} className={gi > 0 ? "mt-3" : ""}>
          {group.label && (
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              const badgeType = BADGE_TYPE_BY_HREF[href];
              const badgeCount = badgeType ? badgeCounts[badgeType] ?? 0 : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badgeCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-medium text-white">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-md border border-border p-2 hover:bg-background"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">DMN Solutions Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">DMN Solutions Admin</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-2 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="border-t border-border px-3 py-3">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-foreground">DMN Solutions</span>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>
          <GlobalSearch className="mt-3 w-full justify-start" />
        </div>
        <NavLinks />
        <div className="border-t border-border px-3 py-3">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
