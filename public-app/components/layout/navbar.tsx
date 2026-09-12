"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  PackageSearch,
  Home,
  Wrench,
  Image as ImageIcon,
  Info,
  LifeBuoy,
  Mail,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/portfolio", label: "Portfolio", icon: ImageIcon },
  { href: "/about", label: "About", icon: Info },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          DMN Solutions
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            href="/track-order"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <PackageSearch className="h-4 w-4" aria-hidden />
            Track My Order
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
        </button>
      </nav>

      {open && (
        <div className="max-h-[75vh] overflow-y-auto border-t border-border bg-ink px-6 py-6 md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-4 text-ink-foreground transition-colors active:bg-white/10"
                >
                  <Icon className="h-5 w-5 text-ink-foreground" aria-hidden />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
          <Link
            href="/track-order"
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            <PackageSearch className="h-4 w-4" aria-hidden />
            Track My Order
          </Link>
        </div>
      )}
    </header>
  );
}
