// components/admin/MembersTable.tsx
'use client';
import { useTransition, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldOff, Award, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { toggleMemberActive, removeMember, awardBadge } from '@/lib/actions';
import type { Profile } from '@/lib/supabase/types';

const BADGE_OPTIONS = [
  { key: 'star',    label: 'Top Reviewer',  icon: '⭐' },
  { key: 'vip',     label: 'VIP Client',    icon: '👑' },
  { key: 'early',   label: 'Early Adopter', icon: '🔥' },
  { key: 'premium', label: 'Premium',       icon: '💎' },
  { key: 'verified',label: 'Verified',      icon: '✅' },
  { key: 'power',   label: 'Power User',    icon: '🚀' },
  { key: 'loyal',   label: 'Loyal Client',  icon: '🎯' },
  { key: 'founder', label: 'Founder',       icon: '🌟' },
] as const;

export function MembersTable({ members }: { members: Profile[] }) {
  const [pending, startTransition] = useTransition();
  const [awardTarget, setAwardTarget] = useState<Profile | null>(null);

  function handleToggle(userId: string, current: boolean) {
    startTransition(async () => {
      const res = await toggleMemberActive(userId, !current);
      if (res.success) toast.success(current ? 'Member deactivated' : 'Member activated');
      else toast.error(res.error);
    });
  }

  function handleRemove(userId: string) {
    startTransition(async () => {
      const res = await removeMember(userId);
      if (res.success) toast.success('Member removed');
      else toast.error(res.error);
    });
  }

  async function handleAwardBadge(badgeKey: string) {
    if (!awardTarget) return;
    const badge = BADGE_OPTIONS.find((b) => b.key === badgeKey);
    if (!badge) return;
    const fd = new FormData();
    fd.set('user_email', awardTarget.email ?? '');
    fd.set('badge_key',  badge.key);
    fd.set('badge_label',badge.label);
    fd.set('badge_icon', badge.icon);
    startTransition(async () => {
      const res = await awardBadge(fd);
      if (res.success) { toast.success(`Badge awarded to ${awardTarget.full_name}`); setAwardTarget(null); }
      else toast.error(res.error);
    });
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
        className="glass-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-syne font-bold text-white text-sm">👥 Registered Members</h2>
          <span className="text-white/30 text-xs font-inter">{members.length} shown</span>
        </div>

        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Name', 'Role', 'Status', 'Last Seen', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-white/35 font-syne font-semibold text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white/90 text-xs">{m.full_name || '—'}</div>
                    <div className="text-white/35 text-[0.68rem] truncate max-w-[120px]">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-syne font-bold ${
                      m.role === 'admin' ? 'bg-electric/20 text-electric' : 'bg-green-500/15 text-green-400'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[0.68rem] font-semibold ${
                      m.is_active ? 'text-green-400' : 'text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.is_active ? 'bg-green-400' : 'bg-rose-400'}`} />
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/35 text-xs">
                    {m.last_seen_at ? new Date(m.last_seen_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(m.user_id, m.is_active)}
                        disabled={pending}
                        className={`p-1.5 rounded-lg transition-colors ${
                          m.is_active
                            ? 'text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10'
                            : 'text-green-400/60 hover:text-green-400 hover:bg-green-500/10'
                        }`}
                        title={m.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {m.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                      </button>
                      <button
                        onClick={() => setAwardTarget(m)}
                        className="p-1.5 rounded-lg text-electric/60 hover:text-electric hover:bg-electric/10 transition-colors"
                        title="Award badge"
                      >
                        <Award size={14} />
                      </button>
                      <button
                        onClick={() => handleRemove(m.user_id)}
                        disabled={pending}
                        className="p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="py-10 text-center text-white/25 font-inter text-sm">No members yet.</div>
          )}
        </div>
      </motion.div>

      {/* Badge award modal */}
      {awardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-white">Award Badge</h3>
              <button onClick={() => setAwardTarget(null)} className="text-white/40 hover:text-white text-lg leading-none">✕</button>
            </div>
            <p className="text-white/50 text-sm font-inter mb-5">
              Awarding badge to <strong className="text-white">{awardTarget.full_name || awardTarget.email}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BADGE_OPTIONS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => handleAwardBadge(b.key)}
                  disabled={pending}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-electric/40 hover:bg-electric/10 transition-all text-left"
                >
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-white/80 text-xs font-syne font-semibold">{b.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
