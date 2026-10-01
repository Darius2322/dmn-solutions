import { useCallback, useEffect, useState } from 'react';
import { Wallet, Plus, ArrowUpFromLine, Loader2, WifiOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Row { id: string; kind: 'deposit' | 'withdrawal' | 'used' | 'adjustment'; amount: number; method: string | null; reference: string | null; note: string | null; created_at: string }
const KIND: Record<Row['kind'], string> = { deposit: 'Deposit', withdrawal: 'Withdrawal', used: 'Used for purchase', adjustment: 'Adjustment' };
const METHODS = ['Cash', 'M-Pesa', 'Bank', 'Other'];

/** Customer prepaid balance: the customer puts money in ("deposit"), and it can later be used or paid back. The
 * ledger is append-only and written by the database (record_customer_deposit), which checks the caller's business
 * and permission and refuses to let a balance go negative. Needs a connection so that two devices can never spend
 * the same money. */
export function DepositCard({ customerId, currency, canEdit }: { customerId: string; currency: string; canEdit: boolean }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [mode, setMode] = useState<null | 'deposit' | 'withdrawal'>(null);
  const [amount, setAmount] = useState(''); const [method, setMethod] = useState('Cash'); const [ref, setRef] = useState(''); const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [offline, setOffline] = useState(!navigator.onLine);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !navigator.onLine) { setOffline(true); return; }
    setOffline(false); setLoadFailed(false);
    const [b, l] = await Promise.all([
      supabase.rpc('customer_deposit_balance', { p_customer_id: customerId }),
      supabase.from('customer_deposits').select('id,kind,amount,method,reference,note,created_at').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(15)
    ]);
    if (b.error || l.error) { setLoadFailed(true); return; }
    setBalance(Number(b.data ?? 0)); setRows(((l.data as any[]) ?? []).map((r) => ({ ...r, amount: Number(r.amount) })));
  }, [customerId]);
  useEffect(() => { void load(); const on = () => void load(); const off = () => setOffline(true); window.addEventListener('online', on); window.addEventListener('offline', off); return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); }; }, [load]);

  async function save() {
    if (!supabase || !mode) return;
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) { setError('Enter an amount greater than zero.'); return; }
    setBusy(true); setError(null);
    const { error: e } = await supabase.rpc('record_customer_deposit', { p_customer_id: customerId, p_kind: mode, p_amount: n, p_method: method, p_reference: ref || null, p_note: note || null });
    setBusy(false);
    if (e) { setError(/Balance is only/.test(e.message) ? e.message : /permission/i.test(e.message) ? "You don't have permission to record deposits." : 'Could not save. Check your connection and try again.'); return; }
    setMode(null); setAmount(''); setRef(''); setNote(''); await load();
  }

  return (
    <section className="card p-4 mt-4" aria-label="Customer deposit">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Deposit balance</h2>
          <div className="tnum text-2xl font-semibold mt-1">{balance == null ? '—' : `${currency} ${balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}</div>
          <p className="text-xs text-slate-500">Money the customer has paid in advance.</p>
        </div>
        {canEdit && !offline && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <button onClick={() => { setMode('deposit'); setError(null); }} className="btn-primary min-h-[40px] px-3 text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add deposit</button>
            {(balance ?? 0) > 0 && <button onClick={() => { setMode('withdrawal'); setError(null); }} className="btn-secondary min-h-[40px] px-3 text-sm flex items-center gap-1.5"><ArrowUpFromLine className="w-4 h-4" /> Pay out</button>}
          </div>
        )}
      </div>
      {offline && <p className="flex items-center gap-1.5 text-xs text-amber-600 mt-3"><WifiOff className="w-3.5 h-3.5" /> Deposits need a connection so balances stay correct across devices.</p>}
      {loadFailed && <p role="alert" className="text-xs text-rust-600 mt-3">Couldn't load the deposit balance. <button onClick={() => void load()} className="underline">Retry</button></p>}

      {mode && (
        <div className="mt-3 rounded-card bg-slate-50 p-3 space-y-2.5">
          <div className="text-sm font-medium">{mode === 'deposit' ? 'Record a deposit' : 'Pay money back to the customer'}</div>
          <input className="input tnum text-lg" type="number" inputMode="decimal" min="0" step="any" placeholder={`Amount (${currency})`} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Payment method">{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            <input className="input" placeholder="Reference (e.g. M-Pesa code)" value={ref} maxLength={80} onChange={(e) => setRef(e.target.value)} />
          </div>
          <input className="input" placeholder="Note (optional)" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
          {error && <p role="alert" className="text-sm text-rust-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setMode(null)} className="btn-secondary flex-1 min-h-[44px]">Cancel</button>
            <button onClick={save} disabled={busy} className="btn-primary flex-1 min-h-[44px] flex items-center justify-center gap-1.5">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save</button>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <ul className="divide-y divide-slate-100 mt-3">
          {rows.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0"><div>{KIND[r.kind]}{r.method ? ` · ${r.method}` : ''}</div><div className="text-xs text-slate-500 truncate">{new Date(r.created_at).toLocaleString()}{r.reference ? ` · ${r.reference}` : ''}{r.note ? ` · ${r.note}` : ''}</div></div>
              <div className={`tnum font-medium shrink-0 ${r.kind === 'deposit' || r.kind === 'adjustment' ? 'text-field-600' : 'text-rust-600'}`}>{r.kind === 'deposit' || r.kind === 'adjustment' ? '+' : '−'}{r.amount.toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
