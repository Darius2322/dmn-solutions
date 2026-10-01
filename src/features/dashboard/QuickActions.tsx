import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ShoppingCart, PackagePlus, UserPlus, FileText, Receipt, Wallet, BarChart3, ArrowDownUp, Package, Users, ListOrdered, CalendarCheck2, Truck, Tags, ChevronRight } from 'lucide-react';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { profileHasPermission } from '../../lib/permissions';
import { PersonAvatar } from '../../components/PersonAvatar';
import { ProductAvatar } from '../../components/ProductAvatar';
import { effectiveStatus } from '../../lib/debts';

type Tone = 'green' | 'blue' | 'amber' | 'rose' | 'violet' | 'slate';
const TONES: Record<Tone, string> = {
  green: 'bg-field-50 text-field-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700', violet: 'bg-violet-50 text-violet-700', slate: 'bg-slate-100 text-slate-600'
};

/** Shortcut buttons + live "records" at the top of the dashboard. Everything is a button to the full details.
 * Only actions the signed-in user may perform are shown. All numbers come from this business's own data. */
export function QuickActions() {
  const { profile, business } = useAuth();
  const cur = business?.currency ?? 'KES';
  const can = (p: string) => profileHasPermission(profile, p as any);
  const groups: { title: string; items: { to: string; label: string; icon: any; tone: Tone; show: boolean; primary?: boolean }[] }[] = [
    { title: 'Sell', items: [
      { to: '/pos', label: 'New sale', icon: ShoppingCart, tone: 'green', show: can('sales.create'), primary: true },
      { to: '/sales', label: 'Sales', icon: ListOrdered, tone: 'blue', show: can('sales.view') },
      { to: '/quotations', label: 'Quotations', icon: FileText, tone: 'violet', show: can('sales.create') },
      { to: '/invoices', label: 'Invoices', icon: Receipt, tone: 'violet', show: can('sales.create') },
      { to: '/end-of-day', label: 'End of day', icon: CalendarCheck2, tone: 'slate', show: can('reports.financial') }
    ] },
    { title: 'Stock', items: [
      { to: '/inventory', label: 'Inventory', icon: Package, tone: 'blue', show: can('inventory.view') },
      { to: '/inventory?add=1', label: 'Add product', icon: PackagePlus, tone: 'green', show: can('inventory.update') },
      { to: '/inventory', label: 'Adjust stock', icon: ArrowDownUp, tone: 'amber', show: can('inventory.adjust') },
      { to: '/categories', label: 'Categories', icon: Tags, tone: 'slate', show: can('inventory.view') },
      { to: '/suppliers', label: 'Suppliers', icon: Truck, tone: 'slate', show: can('suppliers.view') }
    ] },
    { title: 'People & money', items: [
      { to: '/customers', label: 'Customers', icon: Users, tone: 'blue', show: can('customers.view') },
      { to: '/customers', label: 'New customer', icon: UserPlus, tone: 'green', show: can('customers.update') },
      { to: '/debts', label: 'Debts', icon: Wallet, tone: 'rose', show: can('customers.view') },
      { to: '/expenses', label: 'Expenses', icon: Receipt, tone: 'amber', show: can('expenses.view') },
      { to: '/analytics', label: 'Analytics', icon: BarChart3, tone: 'violet', show: can('reports.view') }
    ] }
  ].map((g) => ({ ...g, items: g.items.filter((i) => i.show) })).filter((g) => g.items.length > 0);

  const recentSales = useLiveQuery(async () => (business && can('sales.view') ? (await db.sales.where('businessId').equals(business.id).toArray()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4) : []), [business?.id]) ?? [];
  const lowStock = useLiveQuery(async () => (business && can('inventory.view') ? (await db.products.where('businessId').equals(business.id).toArray()).filter((p) => p.active !== false && p.quantity <= p.minStock).sort((a, b) => a.quantity - b.quantity).slice(0, 4) : []), [business?.id]) ?? [];
  const owing = useLiveQuery(async () => (business && can('customers.view') ? (await db.debts.where('businessId').equals(business.id).toArray()).filter((d) => effectiveStatus(d) !== 'paid').sort((a, b) => b.remainingAmount - a.remainingAmount).slice(0, 4) : []), [business?.id]) ?? [];
  const customers = useLiveQuery(() => (business ? db.customers.where('businessId').equals(business.id).toArray() : []), [business?.id]) ?? [];
  const debtor = (d: any) => d.debtorName || customers.find((c) => c.id === d.customerId)?.name || 'Customer';

  if (groups.length === 0) return null;
  const row = 'w-full flex items-center gap-3 px-3 min-h-[56px] text-left hover:bg-slate-50 active:bg-slate-100';
  return (
    <div className="px-4 md:px-8 pt-4 max-w-6xl mx-auto space-y-4">
      <nav aria-label="Quick actions" className="space-y-3">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{g.title}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {g.items.map((a) => (
                <Link key={a.label} to={a.to} className={`flex flex-col items-center justify-center gap-1.5 min-h-[76px] rounded-card border px-1 text-center transition-colors ${a.primary ? 'bg-field-600 border-field-600 text-white hover:bg-field-700' : 'bg-paper-raised border-slate-200 hover:bg-slate-50 active:bg-slate-100'}`}>
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center ${a.primary ? 'bg-white/20' : TONES[a.tone]}`}><a.icon className="w-[18px] h-[18px]" aria-hidden="true" /></span>
                  <span className="text-[11px] font-medium leading-tight">{a.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </nav>

      {(recentSales.length > 0 || lowStock.length > 0 || owing.length > 0) && (
        <div className="grid gap-3 md:grid-cols-3">
          {recentSales.length > 0 && (
            <section className="card overflow-hidden" aria-label="Recent sales">
              <Link to="/sales" className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-50">Recent sales <ChevronRight className="w-4 h-4" /></Link>
              <ul className="divide-y divide-slate-100">{recentSales.map((s) => (
                <li key={s.id}><Link to={`/sales/${s.id}`} className={row}><span className="min-w-0 flex-1"><span className="block text-sm font-medium truncate">{s.receiptNumber}</span><span className="block text-xs text-slate-500">{new Date(s.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></span><span className="tnum text-sm font-semibold">{cur} {s.total.toLocaleString()}</span></Link></li>
              ))}</ul>
            </section>
          )}
          {lowStock.length > 0 && (
            <section className="card overflow-hidden" aria-label="Low stock">
              <Link to="/inventory" className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-50">Low stock <ChevronRight className="w-4 h-4" /></Link>
              <ul className="divide-y divide-slate-100">{lowStock.map((p) => (
                <li key={p.id}><Link to={`/inventory/${p.id}`} className={row}><ProductAvatar name={p.name} src={p.imageUrl} size={34} /><span className="min-w-0 flex-1 text-sm font-medium truncate">{p.name}</span><span className={`tnum text-sm font-semibold ${p.quantity <= 0 ? 'text-rust-600' : 'text-amber-600'}`}>{p.quantity <= 0 ? 'Out' : `${p.quantity} ${p.unit}`}</span></Link></li>
              ))}</ul>
            </section>
          )}
          {owing.length > 0 && (
            <section className="card overflow-hidden" aria-label="Biggest balances owed">
              <Link to="/debts" className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-50">Owed to you <ChevronRight className="w-4 h-4" /></Link>
              <ul className="divide-y divide-slate-100">{owing.map((d) => (
                <li key={d.id}><Link to={`/debts/${d.id}`} className={row}><PersonAvatar name={debtor(d)} size={34} /><span className="min-w-0 flex-1 text-sm font-medium truncate">{debtor(d)}</span><span className="tnum text-sm font-semibold text-rust-600">{cur} {d.remainingAmount.toLocaleString()}</span></Link></li>
              ))}</ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
