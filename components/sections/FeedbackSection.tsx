// components/sections/FeedbackSection.tsx
'use client';
import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { submitFeedback } from '@/lib/actions';
import type { Feedback } from '@/lib/supabase/types';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((star) => (
        <motion.button
          key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.15 }}
        >
          <Star
            size={28}
            fill={(hover || value) >= star ? '#f59e0b' : 'transparent'}
            stroke={(hover || value) >= star ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
            className="transition-colors"
          />
        </motion.button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Feedback }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-1 mb-3">
        {[1,2,3,4,5].map((s) => (
          <Star key={s} size={14} fill={review.rating >= s ? '#f59e0b' : 'transparent'} stroke={review.rating >= s ? '#f59e0b' : 'rgba(255,255,255,0.15)'} />
        ))}
        <span className="text-white/30 text-xs ml-2">({review.rating}/5)</span>
      </div>
      <p className="text-white/70 text-sm font-inter leading-relaxed mb-4 line-clamp-3">
        &ldquo;{review.comment || 'Great experience!'}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-syne font-bold text-xs">{review.user_name || 'Anonymous'}</p>
          <p className="text-white/30 text-[0.68rem] font-inter mt-0.5">{review.service || 'General'}</p>
        </div>
        <span className="text-white/20 text-[0.68rem]">
          {review.created_at ? new Date(review.created_at).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : ''}
        </span>
      </div>
    </motion.div>
  );
}

export function FeedbackSection({ reviews }: { reviews: Feedback[] }) {
  const [rating, setRating] = useState(0);
  const [pending, startTransition] = useTransition();
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) { toast.error('Please select a star rating'); return; }
    const fd = new FormData(e.currentTarget);
    fd.set('rating', String(rating));
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await submitFeedback(fd);
      if (res.success) {
        toast.success('Thank you for your review! 🎉');
        form.reset(); setRating(0);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <section id="feedback" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-syne font-semibold tracking-wider mb-4">
          CLIENT REVIEWS
        </span>
        <h2 className="font-syne font-extrabold text-4xl sm:text-5xl text-white mb-2">
          What Clients <span className="gradient-text">Say</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="font-syne font-black text-3xl text-amber-400">{avgRating}</span>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => <Star key={s} size={16} fill="#f59e0b" stroke="#f59e0b" />)}
          </div>
          <span className="text-white/40 text-sm font-inter">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <h3 className="font-syne font-bold text-white text-base">Rate Our Service</h3>
            {/* Guest fields */}
            <div>
              <label className="text-white/40 text-xs font-syne font-semibold mb-1.5 block">YOUR NAME</label>
              <input name="user_name" placeholder="Optional — or submit anonymously"
                className="w-full bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/80 text-sm font-inter outline-none focus:border-electric/50 placeholder:text-white/20" />
            </div>
            <div>
              <label className="text-white/40 text-xs font-syne font-semibold mb-1.5 block">STAR RATING *</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="text-white/40 text-xs font-syne font-semibold mb-1.5 block">SERVICE</label>
              <select name="service"
                className="w-full bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/80 text-sm font-inter outline-none focus:border-electric/50">
                <option value="">Select a service…</option>
                {['Web Development','Mobile App','E-commerce','SEO & Marketing','UI/UX Design','Cloud & SaaS','WiFi Networks','Electrical','General'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/40 text-xs font-syne font-semibold mb-1.5 block">COMMENT</label>
              <textarea name="comment" rows={3} placeholder="Share your experience…"
                className="w-full bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/80 text-sm font-inter outline-none focus:border-electric/50 placeholder:text-white/20 resize-none" />
            </div>
            <motion.button type="submit" disabled={pending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm disabled:opacity-50"
              whileTap={{ scale: 0.97 }}>
              {pending ? 'Submitting…' : '✈ Submit Review'}
            </motion.button>
          </form>
        </div>

        {/* Reviews grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {reviews.slice(0, 6).map((r) => <ReviewCard key={r.id} review={r} />)}
          {reviews.length === 0 && (
            <div className="col-span-2 py-16 text-center text-white/25 font-inter">
              Be the first to leave a review!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
