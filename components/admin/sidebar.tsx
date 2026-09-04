"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, Inbox } from "lucide-react";

function base() {
  return `/${process.env.NEXT_PUBLIC_ADMIN_ROUTE_SEGMENT ?? "portal-x7k2"}`;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const b = base();
  const links = [
    { href: b, label: "Dashboard", icon: LayoutDashboard },
    { href: `${b}/services`, label: "Services", icon: Wrench },
    { href: `${b}/requests`, label: "Requests", icon: Inbox },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface p-4">
      <p className="mb-6 px-2 text-sm font-semibold text-foreground">DMN Admin</p>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-background"}`}>
              <Icon className="h-4 w-4" /> {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
