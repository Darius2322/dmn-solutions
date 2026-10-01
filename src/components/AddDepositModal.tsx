import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

const METHODS = ['Cash', 'M-Pesa', 'Bank', 'Other'];
/** Record money a customer pays in advance. Needs a connection (the database checks the balance). */
export function AddDepositModal({ customers, customerId, onClose, onDone }: { customers: { id: string; name: string }[]; customerId?: string; onClose: () => void; onDone?: () => void }) {
  const { business } = useAuth();
  const [cid, setCid] = useState(customerId ?? ''); const [amount, setAmount] = useState(''); const [method, setMethod] = useState('Cash'); const [ref, setRef] = useState(''); const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  async function save() {
    if (!supabase) return;
    if (!navigator.onLine) { setError("You're offline. Deposits need a connection so balances stay correct across devices."); return; }
    const n = parseFloat(amount);
    if (!cid) { setError('Choose a customer.'); return; }
    if (!Number.isFinite(n) || n <= 0) { setError('Enter an amount greater than zero.'); return; }
    setBusy(true); setError(null);
    const { error: e } = await supabase.rpc('record_customer_deposit', { p_customer_id: cid, p_kind: 'deposit', p_amount: n, p_method: method, p_reference: ref || null, p_note: note || null });
    setBusy(false);
    if (e) { setError(/permission/i.test(e.message) ? "You don't have permission to record deposits." : 'Could not save. Please try again.'); return; }
    onDone?.(); onClose();
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Add deposit">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative bg-paper-raised w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Add deposit</h2><button onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
        {!customerId && <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Customer</span><select className="input" value={cid} onChange={(e) => setCid(e.target.value)}><option value="">Choose…</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Amount ({business?.currency ?? 'KES'})</span><input className="input tnum text-lg" type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus /></label>
        <div className="grid grid-cols-2 gap-2"><select className="input" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Method">{METHODS.map((m) => <option key={m}>{m}</option>)}</select><input className="input" placeholder="Reference (e.g. M-Pesa code)" maxLength={80} value={ref} onChange={(e) => setRef(e.target.value)} /></div>
        <input className="input" placeholder="Note (optional)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        {error && <p role="alert" className="text-sm text-rust-600">{error}</p>}
        <div className="flex gap-2"><button onClick={onClose} className="btn-secondary flex-1 min-h-[46px]">Cancel</button><button onClick={save} disabled={busy} className="btn-primary flex-1 min-h-[46px] flex items-center justify-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Save deposit</button></div>
      </div>
    </div>
  );
}
