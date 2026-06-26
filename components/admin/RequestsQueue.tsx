// components/admin/RequestsQueue.tsx
'use client';
import { useTransition, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { toast } from 'sonner';
import { updateRequestStatus } from '@/lib/actions';
import type { Request } from '@/lib/supabase/types';

const STATUS_STYLES = {
  open:        { bg: 'bg-amber-500/15',  text: 'text-amber-400',  label: 'Open'        },
  in_progress: { bg: 'bg-electric/15',   text: 'text-electric',   label: 'In Progress' },
  resolved:    { bg: 'bg-green-500/15',  text: 'text-green-400',  label: 'Resolved'    },
  closed:      { bg: 'bg-white/[0.06]',  text: 'text-white/40',   label: 'Closed'      },
} as const;

function RequestRow({ req }: { req: Request }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reply, setReply] = useState(req.admin_reply ?? '');
  const [status, setStatus] = useState(req.status);
  const style = STATUS_STYLES[status];

  function handleSave() {
    const fd = new FormData();
    fd.set('id', req.id);
    fd.set('status', status);
    fd.set('admin_reply', reply);
    startTransition(async () => {
      const res = await updateRequestStatus(fd);
      if (res.success) toast.success('Request updated');
      else toast.error(res.error);
    });
  }

  return (
    <motion.div layout className="border-b border-white/[0.04] last:border-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <span className={`px-2.5 py-1 rounded-full text-[0.68rem] font-syne font-bold flex-shrink-0 ${style.bg} ${style.text}`}>
          {style.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white/85 font-semibold text-sm truncate">{req.title}</p>
          <p className="text-white/35 text-xs font-inter truncate">{req.user_name} · {req.service || 'General'}</p>
        </div>
        <span className="text-white/25 text-xs font-inter flex-shrink-0">
          {req.created_at ? new Date(req.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) : ''}
        </span>
        {expanded ? <ChevronUp size={16} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {req.description && (
                <div className="bg-white/[0.03] rounded-xl p-4 text-white/60 text-sm font-inter leading-relaxed">
                  {req.description}
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-white/40 text-xs font-syne font-semibold mb-1.5 block">STATUS</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Request['status'])}
                    className="w-full bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2 text-white/80 text-sm font-inter outline-none focus:border-electric/50"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex-[2]">
                  <label className="text-white/40 text-xs font-syne font-semibold mb-1.5 block">ADMIN REPLY</label>
                  <div className="flex gap-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply to the member…"
                      className="flex-1 bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2 text-white/80 text-sm font-inter outline-none focus:border-electric/50 placeholder:text-white/20"
                    />
                    <button
                      onClick={handleSave}
                      disabled={pending}
                      className="px-4 py-2 rounded-xl bg-electric text-white font-syne font-bold text-xs flex items-center gap-1.5 hover:bg-electric/90 transition-colors disabled:opacity-50"
                    >
                      <Send size={13} /> Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RequestsQueue({ requests }: { requests: Request[] }) {
  const counts = {
    open:        requests.filter((r) => r.status === 'open').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2 className="font-syne font-bold text-white text-sm">📋 Requests Queue</h2>
        <div className="flex gap-2">
          {counts.open > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[0.68rem] font-syne font-bold">
              {counts.open} open
            </span>
          )}
          {counts.in_progress > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-electric/15 text-electric text-[0.68rem] font-syne font-bold">
              {counts.in_progress} in progress
            </span>
          )}
        </div>
      </div>
      <div>
        {requests.map((r) => <RequestRow key={r.id} req={r} />)}
        {requests.length === 0 && (
          <div className="py-10 text-center text-white/25 font-inter text-sm">No requests yet.</div>
        )}
      </div>
    </motion.div>
  );
}
