// components/admin/ReviewsTable.tsx
'use client';
import { useTransition } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteFeedback } from '@/lib/actions';
import type { Feedback } from '@/lib/supabase/types';

const STARS = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
const STAR_COLOR = ['', '#f43f5e', '#f97316', '#f59e0b', '#84cc16', '#10b981'];

export function ReviewsTable({ reviews }: { reviews: Feedback[] }) {
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteFeedback(id);
      if (res.success) toast.success('Review deleted');
      else toast.error(res.error);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2 className="font-syne font-bold text-white text-sm">
          ⭐ Recent Reviews
        </h2>
        <span className="text-white/30 text-xs font-inter">{reviews.length} shown</span>
      </div>

      <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['Member', 'Rating', 'Service', 'Comment', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-white/35 font-syne font-semibold text-xs uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr
                key={r.id}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-white/90 text-xs truncate max-w-[100px]">
                    {r.user_name || 'Anonymous'}
                  </div>
                  <div className="text-white/35 text-[0.68rem] truncate max-w-[100px]">
                    {r.user_email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: STAR_COLOR[r.rating] }}
                  >
                    {STARS(r.rating)}
                  </span>
                  <span className="text-white/40 text-xs ml-1">({r.rating}/5)</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md bg-electric/10 text-electric text-[0.68rem] font-syne font-semibold">
                    {r.service || 'General'}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  <p className="text-white/55 text-xs truncate">{r.comment || '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={pending}
                    className="p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <div className="py-10 text-center text-white/25 font-inter text-sm">No reviews yet.</div>
        )}
      </div>
    </motion.div>
  );
}
