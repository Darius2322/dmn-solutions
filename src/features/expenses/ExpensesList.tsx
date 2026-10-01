import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, X, ChevronRight, Repeat, Loader2 } from 'lucide-react';
import { db, enqueueSync, newRecordBase } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { profileHasPermission } from '../../lib/permissions';
import { PersonAvatar } from '../../components/PersonAvatar';
import type { Expense } from '../../lib/types';

const METHODS = ['cash', 'mpesa', 'bank', 'card', 'other'];
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

/** Expenses. The whole row opens the expense; "Repeat" records the same expense again for today in one tap. */
export function ExpensesList() {
  const navigate = useNavigate();
  const { business, profile, userId, activeBranchId, branches } = useAuth();
  const currency = business?.currency ?? 'KES';
  const canAdd = profileHasPermission(profile, 'expenses.add');
  const branchId = activeBranchId ?? branches[0]?.id ?? null;
  const [query, setQuery] = useState(''); const [cat, setCat] = useState('all'); const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [adding, setAdding] = useState<null | Partial<Expense>>(null);

  const all = useLiveQuery(() => (business ? db.expenses.where('businessId').equals(business.id).toArray() : []), [business?.id]) ?? [];
  const people = useLiveQuery(async () => Object.fromEntries((business ? await db.profiles.filter((p: any) => p.businessId === business.id).toArray() : []).map((p: any) => [p.userId, p.fullName])) as Record<string, string>, [business?.id]) ?? {};
  const live = all.filter((e) => !e.deletedAt);
  const categories = useMemo(() => [...new Set(live.map((e) => e.category))].sort(), [live]);

  const since = useMemo(() => {
    const now = new Date();
    if (range === 'today') return startOfDay();
    if (range === 'week') { const d = startOfDay(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
    if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    return null;
  }, [range]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live.filter((e) => (!since || new Date(e.createdAt) >= since) && (cat === 'all' || e.category === cat) && (!q || e.category.toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [live, since, cat, query]);
  const total = rows.reduce((s, e) => s + e.amount, 0);
  const today = live.filter((e) => new Date(e.createdAt) >= startOfDay()).reduce((s, e) => s + e.amount, 0);
  const top = useMemo(() => { const m = new Map<string, number>(); rows.forEach((e) => m.set(e.category, (m.get(e.category) ?? 0) + e.amount)); return [...m.entries()].sort((a, b) => b[1] - a[1])[0]; }, [rows]);
  const money = (n: number) => `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  async function repeat(e: Expense) {
    if (!business || !userId || !branchId) return;
    const rec = { ...newRecordBase(), businessId: business.id, branchId, category: e.category, amount: e.amount, paymentMethod: e.paymentMethod ?? null, description: e.description ?? null, userId, createdAt: new Date().toISOString() } as any;
    await db.expenses.add(rec); await enqueueSync('expenses', rec.id, 'create');
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="font-display text-2xl font-semibold">Expenses</h1>
        {canAdd && <button onClick={() => setAdding({})} disabled={!userId || !branchId} className="btn-primary inline-flex items-center gap-1.5 !py-2 !px-3.5 text-sm"><Plus className="w-4 h-4" /> Add expense</button>}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card p-2.5"><div className="tnum font-semibold text-base break-words">{money(today)}</div><div className="text-[11px] text-slate-500">Today</div></div>
        <div className="card p-2.5"><div className="tnum font-semibold text-base break-words">{money(total)}</div><div className="text-[11px] text-slate-500">{range === 'all' ? 'All time' : range === 'today' ? 'Today' : range === 'week' ? 'This week' : 'This month'}</div></div>
        <div className="card p-2.5"><div className="font-semibold text-base truncate">{top ? top[0] : '—'}</div><div className="text-[11px] text-slate-500">Top category</div></div>
      </div>
      <div className="relative mb-3"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input className="input !pl-9" placeholder="Search category or description" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
        {([['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['all', 'All']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setRange(k)} aria-pressed={range === k} className={`text-xs font-medium px-3 min-h-[36px] rounded-full whitespace-nowrap ${range === k ? 'bg-field-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>
        ))}
      </div>
      {categories.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {['all', ...categories].map((c) => <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`text-xs font-medium px-3 min-h-[36px] rounded-full border whitespace-nowrap ${cat === c ? 'bg-ink text-paper border-ink' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{c === 'all' ? 'All categories' : c}</button>)}
        </div>
      )}

      {rows.length === 0 ? <p className="text-sm text-slate-500 py-10 text-center card">No expenses match this filter.</p> : (
        <ul className="card divide-y divide-slate-100 overflow-hidden">
          {rows.map((e) => (
            <li key={e.id} className="flex items-stretch hover:bg-slate-50 focus-within:bg-slate-50">
              <button onClick={() => navigate(`/expenses/${e.id}`)} className="flex-1 min-w-0 flex items-center gap-3 px-4 min-h-[64px] text-left active:bg-slate-100">
                <PersonAvatar name={e.category} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">{e.category}</span>
                  <span className="block text-xs text-slate-500 truncate">{new Date(e.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}{e.paymentMethod ? ` · ${e.paymentMethod}` : ''}{e.userId && people[e.userId] ? ` · ${people[e.userId]}` : ''}</span>
                  {e.description && <span className="block text-xs text-slate-500 truncate">{e.description}</span>}
                </span>
                <span className="tnum font-semibold shrink-0">{money(e.amount)}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              </button>
              {canAdd && <button onClick={() => repeat(e)} aria-label={`Repeat ${e.category} expense for today`} title="Repeat today" className="w-12 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200"><Repeat className="w-4 h-4" /></button>}
            </li>
          ))}
        </ul>
      )}
      {adding && business && userId && branchId && <ExpenseForm preset={adding} categories={categories} businessId={business.id} branchId={branchId} userId={userId} currency={currency} onClose={() => setAdding(null)} />}
    </div>
  );
}

function ExpenseForm({ preset, categories, businessId, branchId, userId, currency, onClose }: { preset: Partial<Expense>; categories: string[]; businessId: string; branchId: string; userId: string; currency: string; onClose: () => void }) {
  const [category, setCategory] = useState(preset.category ?? ''); const [amount, setAmount] = useState(preset.amount ? String(preset.amount) : '');
  const [method, setMethod] = useState(preset.paymentMethod ?? 'cash'); const [description, setDescription] = useState(preset.description ?? '');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  async function save() {
    const n = parseFloat(amount);
    if (!category.trim()) { setError('Choose or type a category.'); return; }
    if (!Number.isFinite(n) || n <= 0) { setError('Enter an amount greater than zero.'); return; }
    setBusy(true);
    const rec = { ...newRecordBase(), businessId, branchId, category: category.trim(), amount: n, paymentMethod: method, description: description.trim() || null, userId, createdAt: new Date().toISOString() } as any;
    await db.expenses.add(rec); await enqueueSync('expenses', rec.id, 'create'); setBusy(false); onClose();
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Add expense">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative bg-paper-raised w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Add expense</h2><button onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Category</span><input className="input" list="expense-cats" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Rent, Transport" /><datalist id="expense-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></label>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Amount ({currency})</span><input className="input tnum text-lg" type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus /></label>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Paid with</span><select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</select></label>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Description (optional)</span><input className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        {error && <p role="alert" className="text-sm text-rust-600">{error}</p>}
        <div className="flex gap-2"><button onClick={onClose} className="btn-secondary flex-1 min-h-[46px]">Cancel</button><button onClick={save} disabled={busy} className="btn-primary flex-1 min-h-[46px] flex items-center justify-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Save</button></div>
      </div>
    </div>
  );
}
