// components/layout/NavActions.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, LayoutDashboard, Bell } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavActionsProps {
  user:    SupabaseUser | null;
  isAdmin: boolean;
}

export function NavActions({ user, isAdmin }: NavActionsProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const db = createSupabaseBrowserClient();

  async function signOut() {
    await db.auth.signOut();
    router.refresh();
    setOpen(false);
  }

  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? 'U';

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login"
          className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-syne font-semibold text-sm transition-colors">
          Sign In
        </Link>
        <Link href="/login?tab=signup"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm">
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Notification bell */}
      <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors">
        <Bell size={18} />
      </button>

      {/* Avatar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric to-neon flex items-center justify-center font-syne font-black text-white text-sm ring-2 ring-electric/30 hover:ring-electric/60 transition-all"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-56 glass-card p-2 shadow-2xl"
            >
              {/* User info */}
              <div className="px-3 py-3 border-b border-white/[0.06] mb-1">
                <p className="font-syne font-bold text-white text-sm truncate">
                  {user.user_metadata?.full_name ?? 'Member'}
                </p>
                <p className="text-white/35 text-xs font-inter truncate">{user.email}</p>
              </div>

              {[
                { href: '/profile', icon: User,            label: 'My Profile'      },
                ...(isAdmin ? [{ href: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard' }] : []),
                { href: '/profile?tab=settings', icon: Settings, label: 'Settings' },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors text-sm font-syne font-semibold">
                  <Icon size={15} className="text-electric" />
                  {label}
                </Link>
              ))}

              <div className="border-t border-white/[0.06] mt-1 pt-1">
                <button onClick={signOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-syne font-semibold">
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
