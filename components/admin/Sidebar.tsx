// components/admin/Sidebar.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import {
  LayoutDashboard, Star, Briefcase, Settings2, Users,
  MessageSquare, ClipboardList, ChevronLeft, ChevronRight,
  LogOut, Moon, Sun,
} from 'lucide-react';

const NAV = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Overview'  },
  { href: '/admin/reviews',   icon: Star,            label: 'Reviews'   },
  { href: '/admin/portfolio', icon: Briefcase,       label: 'Portfolio' },
  { href: '/admin/services',  icon: Settings2,       label: 'Services'  },
  { href: '/admin/members',   icon: Users,           label: 'Members'   },
  { href: '/admin/requests',  icon: ClipboardList,   label: 'Requests'  },
  { href: '/admin/comments',  icon: MessageSquare,   label: 'Comments'  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 228 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-[#0d0d1a] border-r border-white/[0.06] flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/[0.06] ${collapsed ? 'justify-center' : 'gap-3'}`}>
        {collapsed
          ? <Logo size={36} showText={false} />
          : <Logo size={36} showText />
        }
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto custom-scroll">
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors relative ${
                  isActive ? 'text-white' : 'text-white/45 hover:text-white/80'
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                {isActive && (
                  <motion.span
                    layoutId="admin-active"
                    className="absolute inset-0 rounded-xl bg-electric/15 border border-electric/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={18} className={`relative z-10 flex-shrink-0 ${isActive ? 'text-electric' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      className="relative z-10 font-syne font-semibold text-sm whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-3 border-t border-white/[0.06] space-y-0.5">
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/45 hover:text-white/80 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span className="font-syne font-semibold text-sm">Toggle Theme</span>}
        </button>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
            {!collapsed && <span className="font-syne font-semibold text-sm">Sign Out</span>}
          </button>
        </form>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-electric/40 transition-all z-20"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
