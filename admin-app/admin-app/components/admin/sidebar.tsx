"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/portfolio", label: "Portfolio", icon: FolderKanban },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/referrals", label: "Referrals", icon: Share2 },
  { href: "/support", label: "Support", icon: HandHeart },
  { href: "/visitors", label: "Visitors", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
            {label}
          </Link>
        );
      })}
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
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <span className="text-sm font-semibold text-foreground">DMN Solutions Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-md p-2 hover:bg-background">
          <Menu className="h-5 w-5" />
        </button>
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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="border-b border-border px-4 py-4">
          <span className="text-sm font-semibold text-foreground">DMN Solutions</span>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
        <NavLinks />
        <div className="border-t border-border px-3 py-3">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
