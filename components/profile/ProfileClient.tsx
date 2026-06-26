// components/profile/ProfileClient.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Home, Star, Send, MessageSquare, Bell, History,
  Settings, Share2, Headphones, LogOut, ChevronLeft, Menu, X,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Profile, Feedback, Request, Comment, Badge, Notification } from '@/lib/supabase/types';

interface ProfileClientProps {
  user: User; profile: Profile | null;
  reviews: Feedback[]; requests: Request[];
  comments: Comment[]; badges: Badge[];
  notifications: Notification[];
}

const NAV = [
  { key: 'overview',      icon: Home,         label: 'Overview'       },
  { key: 'reviews',       icon: Star,         label: 'My Reviews'     },
  { key: 'requests',      icon: Send,         label: 'My Requests'    },
  { key: 'comments',      icon: MessageSquare,label: 'My Comments'    },
  { key: 'notifications', icon: Bell,         label: 'Notifications'  },
  { key: 'activity',      icon: History,      label: 'Activity Log'   },
  { key: 'settings',      icon: Settings,     label: 'Settings', gold: true },
];

const STATUS_STYLES: Record<string, string> = {
  open:        'bg-amber-500/15 text-amber-400',
  in_progress: 'bg-electric/15 text-electric',
  resolved:    'bg-green-500/15 text-green-400',
  closed:      'bg-white/[0.06] text-white/40',
};

export function ProfileClient({ user, profile, reviews, requests, comments, badges, notifications }: ProfileClientProps) {
  const [tab, setTab]         = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const db = createSupabaseBrowserClient();
  const name = user.user_metadata?.full_name ?? user.email ?? 'Member';
  const initial = name[0].toUpperCase();
  const unread = notifications.filter((n) => !n.is_read).length;

  async function signOut() {
    await db.auth.signOut();
    router.push('/');
  }

  function switchTab(key: string) {
    setTab(key);
    setSidebarOpen(false);
  }

  function shareProfileSite() {
    if (navigator.share) navigator.share({ title: 'DMN Solutions', url: window.location.origin });
    else navigator.clipboard?.writeText(window.location.origin).then(() => alert('Link copied!'));
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const Sidebar = (
    <aside className="w-[270px] bg-[#0d0d1a] h-full flex flex-col flex-shrink-0 overflow-y-auto">
      {/* User card */}
      <div className="bg-gradient-to-br from-electric to-neon p-6 text-center flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-white/25 border-2 border-white/50 flex items-center justify-center font-syne font-black text-2xl text-white mx-auto mb-3">
          {initial}
        </div>
        <p className="font-syne font-bold text-white text-sm">{name}</p>
        <p className="text-white/65 text-xs font-inter mt-1 break-all">{user.email}</p>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mt-3">
            {badges.slice(0, 3).map((b) => (
              <span key={b.id} className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[0.65rem] font-syne font-bold">
                {b.badge_icon} {b.badge_label}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
          {[['Reviews', reviews.length], ['Requests', requests.length], ['Badges', badges.length]].map(([l, v]) => (
            <div key={l as string}>
              <div className="font-syne font-black text-lg text-white">{v}</div>
              <div className="text-white/60 text-[0.65rem] font-inter">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(({ key, icon: Icon, label, gold }) => (
          <button key={key} onClick={() => switchTab(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors font-syne font-semibold text-sm relative ${
              tab === key ? 'bg-electric/15 text-electric' : `hover:bg-white/[0.05] ${gold ? 'text-amber-400' : 'text-white/50 hover:text-white'}`
            }`}>
            {tab === key && (
              <motion.span layoutId="profile-active" className="absolute inset-0 rounded-xl bg-electric/15 border border-electric/30"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <Icon size={16} className="relative z-10 flex-shrink-0" />
            <span className="relative z-10">{label}</span>
            {key === 'notifications' && unread > 0 && (
              <span className="relative z-10 ml-auto bg-rose-500 text-white text-[0.62rem] px-1.5 py-0.5 rounded-full font-bold">{unread}</span>
            )}
          </button>
        ))}

        <div className="h-px bg-white/[0.06] my-2" />

        {[
          { icon: Home,       label: 'Browse Services', action: () => { router.push('/#services'); } },
          { icon: Share2,     label: 'Share Site',      action: shareProfileSite                     },
          { icon: Headphones, label: 'Contact Admin',   action: () => window.open(`https://wa.me/254110554040`, '_blank') },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors font-syne font-semibold text-sm">
            <Icon size={16} className="flex-shrink-0" /> {label}
          </button>
        ))}

        <div className="h-px bg-white/[0.06] my-2" />
        <button onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-syne font-semibold text-sm">
          <LogOut size={16} className="flex-shrink-0" /> Sign Out
        </button>
      </nav>
    </aside>
  );

  // ── Panel content ──────────────────────────────────────────────────────────
  const Panel = () => {
    const BACK = (
      <button onClick={() => setTab('overview')} className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-syne mb-4 transition-colors">
        <ChevronLeft size={16} /> Back
      </button>
    );

    if (tab === 'overview') return (
      <div>
        <h2 className="font-syne font-extrabold text-xl text-white mb-6">Overview</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[['⭐', reviews.length, 'Reviews Left', 'reviews'], ['📋', requests.length, 'Service Requests', 'requests']].map(([emoji, count, label, t]) => (
            <button key={t as string} onClick={() => setTab(t as string)}
              className="glass-card p-5 text-left hover:border-electric/30 transition-colors">
              <div className="text-2xl mb-2">{emoji}</div>
              <div className="font-syne font-black text-2xl text-white">{count}</div>
              <div className="text-white/40 text-xs font-inter mt-1">{label}</div>
            </button>
          ))}
        </div>
        <button onClick={() => { router.push('/#services'); }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm flex items-center justify-center gap-2 mb-6">
          <Home size={16} /> Browse & Request a Service
        </button>
        {reviews.length > 0 || requests.length > 0 ? (
          <div className="glass-card p-5">
            <h3 className="font-syne font-bold text-white/60 text-xs uppercase tracking-wider mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[...reviews.slice(0,2).map(r => ({ text:`Left a ${r.rating}★ review for ${r.service||'General'}`, date: r.created_at })),
                ...requests.slice(0,2).map(r => ({ text:`Submitted request: "${r.title}"`, date: r.created_at }))]
                .sort((a,b) => new Date(b.date??0).getTime() - new Date(a.date??0).getTime())
                .slice(0,5).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/70 text-sm font-inter">{a.text}</p>
                    <p className="text-white/25 text-xs mt-0.5">{a.date ? new Date(a.date).toLocaleDateString('en-KE',{month:'short',day:'numeric'}) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-white/25 font-inter text-sm">Your activity will appear here</div>
        )}
      </div>
    );

    if (tab === 'reviews') return (
      <div>{BACK}
        <h2 className="font-syne font-extrabold text-xl text-white mb-6">My Reviews</h2>
        {reviews.length === 0 ? <div className="glass-card p-10 text-center text-white/25 font-inter text-sm">No reviews yet.</div>
          : reviews.map(r => (
          <div key={r.id} className="glass-card p-5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-amber-400 font-mono">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
              <span className="px-2 py-0.5 bg-electric/10 text-electric text-[0.68rem] rounded-md font-syne font-semibold">{r.service||'General'}</span>
            </div>
            <p className="text-white/60 text-sm font-inter">{r.comment||'—'}</p>
            <p className="text-white/25 text-xs mt-2">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-KE') : ''}</p>
          </div>
        ))}
      </div>
    );

    if (tab === 'requests') return (
      <div>{BACK}
        <h2 className="font-syne font-extrabold text-xl text-white mb-6">Service Requests</h2>
        {requests.length === 0 ? <div className="glass-card p-10 text-center text-white/25 font-inter text-sm">No requests yet.</div>
          : requests.map(r => (
          <div key={r.id} className="glass-card p-5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-syne font-bold text-white text-sm">{r.title}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-syne font-bold ${STATUS_STYLES[r.status]||''}`}>{r.status}</span>
            </div>
            <p className="text-white/50 text-sm font-inter mb-3">{r.description}</p>
            {r.admin_reply && <div className="bg-electric/8 border-l-2 border-electric px-3 py-2 rounded-r-xl text-sm text-white/70 font-inter"><strong className="text-electric">Admin:</strong> {r.admin_reply}</div>}
            <p className="text-white/25 text-xs mt-2">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-KE') : ''}</p>
          </div>
        ))}
      </div>
    );

    if (tab === 'comments') return (
      <div>{BACK}
        <h2 className="font-syne font-extrabold text-xl text-white mb-6">My Comments</h2>
        {comments.length === 0 ? <div className="glass-card p-10 text-center text-white/25 font-inter text-sm">No comments yet.</div>
          : comments.map(c => (
          <div key={c.id} className="glass-card p-5 mb-3">
            <span className="text-xs font-syne font-bold text-electric bg-electric/10 px-2 py-0.5 rounded-md">{c.type}</span>
            <p className="text-white/60 text-sm font-inter mt-2">{c.message}</p>
            <p className="text-white/25 text-xs mt-2">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-KE') : ''}</p>
          </div>
        ))}
      </div>
    );

    if (tab === 'notifications') return (
      <div>{BACK}
        <h2 className="font-syne font-extrabold text-xl text-white mb-6">Notifications</h2>
        {notifications.length === 0 ? <div className="glass-card p-10 text-center text-white/25 font-inter text-sm">No notifications.</div>
          : notifications.map(n => (
          <div key={n.id} className={`glass-card p-4 mb-2 ${!n.is_read ? 'border-electric/30' : ''}`}>
            <p className={`font-syne font-semibold text-sm ${n.is_read ? 'text-white/60' : 'text-white'}`}>{n.title}</p>
            {n.message && <p className="text-white/45 text-xs font-inter mt-1">{n.message}</p>}
          </div>
        ))}
      </div>
    );

    if (tab === 'settings') return (
      <div>{BACK}
        <h2 className="font-syne font-extrabold text-xl text-white mb-6">Settings</h2>
        <div className="space-y-4">
          {[
            { label: 'Change Display Name',   placeholder: user.user_metadata?.full_name ?? '', type: 'text',     cta: 'Save Name'     },
            { label: 'Change Email Address',   placeholder: user.email ?? '',                    type: 'email',    cta: 'Update Email'  },
            { label: 'Change Password',        placeholder: 'New password (min 6 chars)',         type: 'password', cta: 'Set Password'  },
          ].map(({ label, placeholder, type, cta }) => (
            <div key={label} className="glass-card p-5">
              <h3 className="font-syne font-bold text-white text-sm mb-3">{label}</h3>
              <input type={type} placeholder={placeholder}
                className="w-full bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/80 text-sm font-inter outline-none focus:border-electric/50 placeholder:text-white/20 mb-3" />
              <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-xs">
                {cta}
              </button>
            </div>
          ))}
          <button onClick={signOut} className="w-full py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-syne font-bold text-sm">
            Sign Out
          </button>
        </div>
      </div>
    );

    return <div className="text-white/30 font-inter text-sm">Select a section from the menu.</div>;
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#07070f] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-electric to-neon flex-shrink-0">
        <button onClick={() => setSidebarOpen((o) => !o)}
          className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <span className="font-syne font-extrabold text-white text-base flex-1">My Account</span>
        <Link href="/" className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-syne font-semibold px-3 py-1.5 rounded-xl">
          <ChevronLeft size={14} /> Back to Site
        </Link>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-10 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          className="absolute md:relative z-20 md:z-auto h-full md:flex"
          initial={false}
          animate={{ x: sidebarOpen || window?.innerWidth >= 768 ? 0 : -280 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          {Sidebar}
        </motion.div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 custom-scroll">
          <Panel />
        </main>
      </div>
    </div>
  );
}
