import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, WifiOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { PersonAvatar } from '../../components/PersonAvatar';

interface Row { id: string; customer_id: string; kind: 'deposit' | 'withdrawal' | 'used' | 'adjustment'; amount: number; method: string | null; created_at: string }
const KIND = { deposit: 'Deposit', withdrawal: 'Pay-out', used: 'Used', adjustment: 'Adjustment' } as const;

/** "Debit" side of customer accounts: money customers have paid in advance. Balances per customer, then a
 * time-stamped list of the latest movements. Tap a customer to open their page. */
export function DepositsTab({ customers, currency }: { customers: { id: string; name: string; phone?: string | null }[]; currency: string }) {
  const navigate = useNavigate();
  const { business } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<'offline' | 'failed' | null>(null);
  useEffect(() => {
    if (!supabase || !business) return;
    if (!navigator.onLine) { setError('offline'); return; }
    void supabase.from('customer_deposits').select('id,customer_id,kind,amount,method,created_at').eq('business_id', business.id).order('created_at', { ascending: false }).limit(500)
      .then(({ data, error: e }) => { if (e) setError('failed'); else setRows(((data as any[]) ?? []).map((r) => ({ ...r, amount: Number(r.amount) }))); });
  }, [business?.id]);
  const name = (id: string) => customers.find((c) => c.id === id)?.name ?? 'Customer';
  const balances = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) m.set(r.customer_id, (m.get(r.customer_id) ?? 0) + (r.kind === 'deposit' || r.kind === 'adjustment' ? r.amount : -r.amount));
    return [...m.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const total = balances.reduce((s, [, v]) => s + v, 0);
  const fmt = (v: number) => `${currency} ${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  if (error === 'offline') return <p className="flex items-center gap-2 text-sm text-amber-600 py-6"><WifiOff className="w-4 h-4" /> Deposits need a connection to load.</p>;
  if (error === 'failed') return <p role="alert" className="text-sm text-rust-600 py-6">Couldn't load deposits. Please try again.</p>;
  if (!rows) return <div className="flex items-center gap-2 text-sm text-slate-500 py-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="card p-3"><div className="tnum font-semibold text-lg text-field-700">{fmt(total)}</div><div className="text-[11px] text-slate-500">Held for customers</div></div>
        <div className="card p-3"><div className="tnum font-semibold text-lg">{balances.length}</div><div className="text-[11px] text-slate-500">Customers with a balance</div></div>
      </div>
      {rows.length === 0 ? <p className="text-sm text-slate-500 py-8 text-center">No deposits recorded yet. Use “Add deposit” to record one.</p> : (
        <>
          <section><h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Balances</h2>
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {balances.map(([id, v]) => (
                <li key={id}><button onClick={() => navigate(`/customers/${id}`)} className="w-full flex items-center gap-3 px-4 min-h-[60px] text-left hover:bg-slate-50 active:bg-slate-100"><PersonAvatar name={name(id)} size={36} /><span className="flex-1 text-sm font-medium truncate">{name(id)}</span><span className="tnum font-semibold">{fmt(v)}</span><ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" /></button></li>
              ))}
            </ul>
          </section>
          <section><h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Latest activity</h2>
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {rows.slice(0, 40).map((r) => (
                <li key={r.id}><button onClick={() => navigate(`/customers/${r.customer_id}`)} className="w-full flex items-center gap-3 px-4 min-h-[60px] text-left hover:bg-slate-50 active:bg-slate-100">
                  <PersonAvatar name={name(r.customer_id)} size={36} />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium truncate">{name(r.customer_id)}</span><span className="block text-xs text-slate-500">{KIND[r.kind]}{r.method ? ` · ${r.method}` : ''} · {new Date(r.created_at).toLocaleString()}</span></span>
                  <span className={`tnum font-medium ${r.kind === 'deposit' || r.kind === 'adjustment' ? 'text-field-600' : 'text-rust-600'}`}>{r.kind === 'deposit' || r.kind === 'adjustment' ? '+' : '−'}{r.amount.toLocaleString()}</span>
                </button></li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
