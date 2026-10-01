import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/** Public review form. There is no "anonymous" checkbox: leave the name blank and the review is posted as
 * "Anonymous" (the database enforces this too). Use it in place of the form on the landing page. */
export function ReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [name, setName] = useState(''); const [rating, setRating] = useState(0); const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [done, setDone] = useState(false);
  async function submit() {
    if (!supabase) return;
    if (rating < 1) { setError('Please choose a star rating.'); return; }
    if (body.trim().length < 10) { setError('Please write at least 10 characters.'); return; }
    setBusy(true); setError(null);
    const { error: e } = await supabase.rpc('submit_public_review', { p_name: name.trim(), p_rating: rating, p_body: body.trim() });
    setBusy(false);
    if (e) { setError(e.message.replace(/^.*?:\s*/, '') || 'Could not submit your review. Please try again.'); return; }
    setDone(true); onSubmitted?.();
  }
  if (done) return <p className="text-sm text-field-700 bg-field-50 rounded-card p-4" role="status">Thank you! Your review has been posted.</p>;
  return (
    <div className="space-y-3">
      <label className="block"><span className="block text-sm font-medium mb-1.5">Your name <span className="text-slate-400 font-normal">(optional)</span></span>
        <input className="input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Leave blank to post as Anonymous" autoComplete="name" /></label>
      <div><span className="block text-sm font-medium mb-1.5">Rating</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)} className="w-11 h-11 flex items-center justify-center"><Star className={`w-7 h-7 ${n <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} /></button>
        ))}</div></div>
      <label className="block"><span className="block text-sm font-medium mb-1.5">Your review</span><textarea className="input min-h-[96px]" value={body} maxLength={1000} onChange={(e) => setBody(e.target.value)} /></label>
      {error && <p role="alert" className="text-sm text-rust-600">{error}</p>}
      <button onClick={submit} disabled={busy} className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Post review</button>
    </div>
  );
}
