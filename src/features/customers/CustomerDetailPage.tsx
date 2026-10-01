import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Star, Phone, MessageCircle, ShoppingCart, HandCoins, Wallet, ChevronRight } from 'lucide-react';
import { PersonAvatar } from '../../components/PersonAvatar';
import { RecordDebtSheet } from '../../components/RecordDebtSheet';
import { AddDepositModal } from '../../components/AddDepositModal';
import { telHref, waHref } from '../../lib/brand';
import { db } from '../../lib/db';
import { enqueueSync } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { customerOutstandingDebt } from '../../lib/sales';
import { getReceiptLink } from '../../lib/receipts';
import { DepositCard } from './DepositCard';
import { profileHasPermission } from '../../lib/permissions';

/** Full-page detail view — replaces the old bottom-sheet modal. Purchase
 * history, payment history, loyalty status and debt together were already
 * more than a sheet could show comfortably; this gives each its own room. */
export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business, profile } = useAuth();
  const currency = business?.currency ?? 'KES';
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState<'overview' | 'purchases' | 'debts' | 'deposits' | 'payments'>('overview');
  const [sheet, setSheet] = useState<null | 'debt' | 'deposit'>(null);
  const [depositKey, setDepositKey] = useState(0);

  const customer = useLiveQuery(() => (id ? db.customers.get(id) : undefined), [id]);
  const debt = useLiveQuery(() => (id ? customerOutstandingDebt(id) : 0), [id]) ?? 0;
  const sales = useLiveQuery(
    async () => {
      if (!id) return [];
      const rows = await db.sales.where('customerId').equals(id).toArray();
      return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    [id]
  ) ?? [];
  const payments = useLiveQuery(
    async () => {
      if (!id) return [];
      const rows = await db.payments.where('customerId').equals(id).toArray();
      return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 15);
    },
    [id]
  ) ?? [];
  const debts = useLiveQuery(async () => (id ? (await db.debts.where('customerId').equals(id).toArray()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []), [id]) ?? [];
  const totalPurchases = sales.reduce((s, sale) => s + sale.total, 0);

  if (customer === undefined) {
    return <div className="p-4 md:p-8 max-w-2xl mx-auto text-sm text-slate-400">Loading…</div>;
  }
  if (!customer || (business && customer.businessId !== business.id)) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center py-16">
        <p className="text-sm text-slate-500 mb-3">This customer isn't available.</p>
        <Link to="/customers" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
      </div>
    );
  }

  async function registerLoyalty() {
    if (!customer) return;
    setRegistering(true);
    try {
      await db.customers.update(customer.id, { loyaltyRegistered: true, updatedAt: new Date().toISOString(), syncStatus: 'pending' });
      await enqueueSync('customers', customer.id, 'update');
    } finally { setRegistering(false); }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      <div className="card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <PersonAvatar name={customer.name} size={56} />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold flex items-center gap-2 break-words">
              {customer.name}
              {customer.loyaltyRegistered && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
            </h1>
            <div className="text-sm text-slate-500 mt-1 space-y-0.5">
              <div>{customer.phone ?? 'No phone'}</div>
              {customer.email && <div>{customer.email}</div>}
              {customer.address && <div>{customer.address}</div>}
              <div className="text-xs text-slate-400">Added {new Date(customer.createdAt).toLocaleString()}{customer.updatedAt && customer.updatedAt !== customer.createdAt ? ` · Updated ${new Date(customer.updatedAt).toLocaleString()}` : ''}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Quick actions">
          {[
            { label: 'Record debt', icon: HandCoins, onClick: () => setSheet('debt'), show: profileHasPermission(profile, 'customers.update') },
            { label: 'Add deposit', icon: Wallet, onClick: () => setSheet('deposit'), show: profileHasPermission(profile, 'customers.update') },
            { label: 'New sale', icon: ShoppingCart, onClick: () => navigate('/pos'), show: profileHasPermission(profile, 'sales.create') },
            { label: 'Call', icon: Phone, href: telHref(customer.phone), show: !!customer.phone },
            { label: 'WhatsApp', icon: MessageCircle, href: waHref(customer.phone), show: !!customer.phone }
          ].filter((x) => x.show).map((x) => {
            const cls = 'flex flex-col items-center justify-center gap-1 min-h-[64px] rounded-card border border-slate-200 bg-paper-raised text-[11px] font-medium hover:bg-slate-50 active:bg-slate-100';
            return 'href' in x && x.href
              ? <a key={x.label} href={x.href} target={x.label === 'WhatsApp' ? '_blank' : undefined} rel="noopener noreferrer" className={cls}><x.icon className="w-5 h-5" />{x.label}</a>
              : <button key={x.label} onClick={(x as any).onClick} className={cls}><x.icon className="w-5 h-5" />{x.label}</button>;
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="card p-3"><div className="text-xs text-slate-500">Total purchases</div><div className="tnum font-semibold">{currency} {totalPurchases.toLocaleString()}</div></div>
          <div className="card p-3"><div className="text-xs text-slate-500">Outstanding debt</div><div className={`tnum font-semibold ${debt > 0 ? 'text-rust-600' : ''}`}>{currency} {debt.toLocaleString()}</div></div>
          <div className="card p-3"><div className="text-xs text-slate-500">Credit limit</div><div className="tnum font-semibold">{currency} {customer.creditLimit.toLocaleString()}</div></div>
          <div className="card p-3">
            <div className="text-xs text-slate-500 mb-1">Loyalty</div>
            {customer.loyaltyRegistered
              ? <div className="tnum font-semibold">{customer.loyaltyPoints.toLocaleString()} pts</div>
              : <button onClick={registerLoyalty} disabled={registering} className="text-xs font-medium text-field-600">{registering ? 'Registering…' : 'Register'}</button>}
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="Customer sections" className="flex gap-1 overflow-x-auto border-b border-slate-200 mt-4 -mx-1 px-1">
        {([['overview', 'Overview'], ['purchases', 'Purchases'], ['debts', `Debts${debts.length ? ` (${debts.length})` : ''}`], ['deposits', 'Deposits'], ['payments', 'Payments']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`shrink-0 px-3 min-h-[44px] text-sm border-b-2 -mb-px ${tab === k ? 'border-field-600 text-ink font-medium' : 'border-transparent text-slate-500 hover:text-ink'}`}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="card p-3 flex justify-between"><span className="text-slate-500">Purchases</span><span className="tnum">{sales.length} · {currency} {totalPurchases.toLocaleString()}</span></div>
          <div className="card p-3 flex justify-between"><span className="text-slate-500">Open debts</span><span className="tnum">{debts.filter((d) => d.status !== 'paid').length}</span></div>
          <div className="card p-3 flex justify-between"><span className="text-slate-500">Last purchase</span><span>{sales[0] ? new Date(sales[0].createdAt).toLocaleString() : '—'}</span></div>
        </div>
      )}

      {tab === 'deposits' && <DepositCard key={depositKey} customerId={customer.id} currency={currency} canEdit={profileHasPermission(profile, 'customers.update')} />}

      {tab === 'debts' && (
        <div className="mt-4">
          {debts.length === 0 ? <p className="text-sm text-slate-400 py-4 text-center card">No debts recorded.</p> : (
            <ul className="card divide-y divide-slate-100 overflow-hidden">
              {debts.map((d) => (
                <li key={d.id}>
                  <button onClick={() => navigate(`/debts/${d.id}`)} className="w-full flex items-center gap-3 px-4 min-h-[64px] text-left hover:bg-slate-50 active:bg-slate-100">
                    <div className="min-w-0 flex-1"><div className="text-sm font-medium truncate">{d.reason || 'Debt'}</div><div className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleString()} · {d.status}</div></div>
                    <div className="text-right shrink-0"><div className="tnum font-semibold">{currency} {d.remainingAmount.toLocaleString()}</div><div className="text-xs text-slate-500 tnum">of {d.originalAmount.toLocaleString()}</div></div>
                    <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'purchases' && <div className="mt-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Purchase history</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center card">No purchases yet.</p>
        ) : (
          <div className="card divide-y divide-slate-100">
            {sales.map((s) => (
              <div key={s.id} className="flex justify-between items-center px-4 py-3 text-sm">
                <span className="text-slate-500">{new Date(s.createdAt).toLocaleString()}</span>
                <span className="tnum font-medium">{currency} {s.total.toLocaleString()}</span>
                <button
                  onClick={async () => {
                    const link = await getReceiptLink(s.id, s.receiptNumber);
                    if (link) window.open(link, '_blank');
                    else alert("This sale hasn't synced yet — try again once it's online.");
                  }}
                  className="text-field-600 font-medium ml-2 shrink-0 text-xs"
                >
                  Receipt
                </button>
              </div>
            ))}
          </div>
        )}
      </div>}

      {tab === 'payments' && payments.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">No payments yet.</p>}
      {tab === 'payments' && payments.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Payments</h2>
          <div className="card divide-y divide-slate-100">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-slate-500 capitalize">{new Date(p.createdAt).toLocaleString()} · {p.method}</span>
                <span className="tnum font-medium">{currency} {p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {sheet === 'debt' && <RecordDebtSheet customer={{ id: customer.id, name: customer.name, phone: customer.phone }} onClose={() => setSheet(null)} onDone={() => setTab('debts')} />}
      {sheet === 'deposit' && <AddDepositModal customers={[]} customerId={customer.id} onClose={() => setSheet(null)} onDone={() => { setDepositKey((k) => k + 1); setTab('deposits'); }} />}
    </div>
  );
}
