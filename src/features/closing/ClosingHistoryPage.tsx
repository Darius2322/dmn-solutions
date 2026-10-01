import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, WifiOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface Closing {
  id: string; business_date: string; total_sales: number; cash_sales: number; mpesa_sales: number; card_sales: number; bank_sales: number; credit_sales: number; other_sales: number;
  refunds_total: number; expenses_total: number; expected_cash: number; actual_cash: number; cash_difference: number; created_at: string; discrepancy_reason: string | null; notes: string | null;
  reopened_at: string | null; closed_by: string | null;
}
const n = (v: unknown) => Number(v ?? 0);

/** Every day that has been closed, newest first. Tap a day for the full breakdown. Reads the business's own
 * closings from the server (row-level security keeps it to this business). */
export function ClosingHistoryPage() {
  const navigate = useNavigate();
  const { business, branches, activeBranchId } = useAuth();
  const cur = business?.currency ?? 'KES';
  const [rows, setRows] = useState<Closing[] | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(30);
  const money = (v: number) => `${cur} ${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  useEffect(() => {
    if (!supabase || !business) return;
    if (!navigator.onLine) { setError('offline'); return; }
    setError(null);
    let q = supabase.from('daily_closings').select('*').eq('business_id', business.id).order('business_date', { ascending: false }).limit(limit);
    if (activeBranchId) q = q.eq('branch_id', activeBranchId);
    void q.then(async ({ data, error: e }) => {
      if (e) { setError('failed'); return; }
      const list = (data as Closing[]) ?? [];
      setRows(list);
      const ids = [...new Set(list.map((r) => r.closed_by).filter(Boolean))] as string[];
      if (ids.length) {
        const { data: ps } = await supabase!.from('profiles').select('user_id, full_name').in('user_id', ids);
        setNames(Object.fromEntries((ps ?? []).map((p: any) => [p.user_id, p.full_name])));
      }
    });
  }, [business?.id, activeBranchId, limit]);

  const totalAll = (rows ?? []).reduce((s, r) => s + n(r.total_sales), 0);
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      <button onClick={() => navigate('/end-of-day')} className="flex items-center gap-1 text-sm text-slate-500 mb-3 min-h-[40px]"><ArrowLeft className="w-4 h-4" /> End of Day</button>
      <h1 className="font-display text-2xl font-semibold">Previous days</h1>
      <p className="text-sm text-slate-500 mb-4">{activeBranchId ? `${branches.find((b) => b.id === activeBranchId)?.name ?? 'This branch'} · ` : ''}Closed days, newest first.</p>

      {error === 'offline' && <p className="flex items-center gap-2 text-sm text-amber-600"><WifiOff className="w-4 h-4" /> Previous days need a connection to load.</p>}
      {error === 'failed' && <p role="alert" className="text-sm text-rust-600">Couldn't load previous days. Please try again.</p>}
      {!error && rows === null && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>}
      {rows && rows.length === 0 && <p className="text-sm text-slate-500 py-10 text-center">No days have been closed yet.</p>}

      {rows && rows.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="card p-3"><div className="tnum font-semibold text-lg">{rows.length}</div><div className="text-[11px] text-slate-500">Days shown</div></div>
            <div className="card p-3"><div className="tnum font-semibold text-lg">{money(totalAll)}</div><div className="text-[11px] text-slate-500">Total sales</div></div>
          </div>
          <ul className="card divide-y divide-slate-100 overflow-hidden">
            {rows.map((r) => {
              const isOpen = open === r.id; const diff = n(r.cash_difference);
              return (
                <li key={r.id}>
                  <button onClick={() => setOpen(isOpen ? null : r.id)} aria-expanded={isOpen} className="w-full flex items-center gap-3 p-4 min-h-[64px] text-left hover:bg-slate-50 active:bg-slate-100">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{new Date(`${r.business_date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs text-slate-500">Closed {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{r.closed_by && names[r.closed_by] ? ` by ${names[r.closed_by]}` : ''}{r.reopened_at ? ' · reopened' : ''}</div>
                    </div>
                    <div className="text-right shrink-0"><div className="tnum font-semibold">{money(n(r.total_sales))}</div><div className={`text-xs tnum ${diff === 0 ? 'text-slate-500' : diff < 0 ? 'text-rust-600' : 'text-amber-600'}`}>{diff === 0 ? 'Cash balanced' : `${diff > 0 ? 'Over' : 'Short'} ${money(Math.abs(diff))}`}</div></div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      {([['Cash', r.cash_sales], ['M-Pesa', r.mpesa_sales], ['Card', r.card_sales], ['Bank', r.bank_sales], ['On credit', r.credit_sales], ['Other', r.other_sales], ['Refunds', r.refunds_total], ['Expenses', r.expenses_total], ['Expected cash', r.expected_cash], ['Counted cash', r.actual_cash]] as [string, number][]).map(([l, v]) => (
                        <div key={l} className="flex justify-between"><span className="text-slate-500">{l}</span><span className="tnum">{money(n(v))}</span></div>
                      ))}
                      {r.discrepancy_reason && <p className="col-span-2 text-xs text-slate-600 mt-1"><b>Reason for difference:</b> {r.discrepancy_reason}</p>}
                      {r.notes && <p className="col-span-2 text-xs text-slate-600"><b>Notes:</b> {r.notes}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {rows.length >= limit && <button onClick={() => setLimit((l) => l + 30)} className="btn-secondary w-full min-h-[46px] mt-3">Show earlier days</button>}
        </>
      )}
    </div>
  );
}
