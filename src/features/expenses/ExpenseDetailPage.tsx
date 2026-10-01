import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft } from 'lucide-react';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { PersonAvatar } from '../../components/PersonAvatar';

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business } = useAuth();
  const e = useLiveQuery(() => (id ? db.expenses.get(id) : undefined), [id]);
  const who = useLiveQuery(async () => (e?.userId ? (await db.profiles.filter((p: any) => p.userId === e.userId).first())?.fullName ?? null : null), [e?.userId]);
  const branch = useLiveQuery(async () => (e?.branchId ? (await db.branches.get(e.branchId))?.name ?? null : null), [e?.branchId]);
  if (e === undefined) return <div className="p-6 text-sm text-slate-500">Loading…</div>;
  if (!e || (business && e.businessId !== business.id)) return <div className="p-6 text-sm text-slate-500">This expense isn't available. <button className="underline" onClick={() => navigate('/expenses')}>Back to expenses</button></div>;
  const cur = business?.currency ?? 'KES';
  const rows: [string, string | null | undefined][] = [['Paid with', e.paymentMethod], ['Recorded by', who], ['Branch', branch], ['Recorded', new Date(e.createdAt).toLocaleString()], ['Sync', e.syncStatus === 'pending' ? 'Waiting to sync' : e.syncStatus === 'failed' ? 'Failed, will retry' : 'Synced']];
  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto pb-24">
      <button onClick={() => navigate('/expenses')} className="flex items-center gap-1 text-sm text-slate-500 mb-3 min-h-[40px]"><ArrowLeft className="w-4 h-4" /> Expenses</button>
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4"><PersonAvatar name={e.category} size={52} /><div className="min-w-0"><h1 className="font-display text-xl font-semibold truncate">{e.category}</h1><div className="tnum text-2xl font-semibold">{cur} {e.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div></div></div>
        {e.description && <p className="text-sm bg-slate-50 rounded-lg p-3 mb-3 break-words">{e.description}</p>}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="text-right capitalize">{v}</dd></div>)}</dl>
      </div>
    </div>
  );
}
