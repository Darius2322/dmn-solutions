import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, X, ChevronRight, Phone, MessageCircle, Wallet } from 'lucide-react';
import { PersonAvatar } from '../../components/PersonAvatar';
import { AddDepositModal } from '../../components/AddDepositModal';
import { DepositsTab } from './DepositsTab';
import { telHref, waHref } from '../../lib/brand';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { createManualDebt, effectiveStatus, debtorLabel } from '../../lib/debts';
import type { Debt } from '../../lib/types';

function money(n: number, currency: string) {
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const today = () => new Date().toISOString().slice(0, 10);

function StatusBadge({ status }: { status: Debt['status'] }) {
  const styles: Record<string, string> = {
    outstanding: 'bg-rust-50 text-rust-600',
    partial: 'bg-amber-100 text-amber-600',
    paid: 'bg-field-50 text-field-700',
    overdue: 'bg-rust-600 text-white'
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{status}</span>;
}

/** Centered, scrollable, accessible dialog. Closes on Escape / backdrop click. */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-paper-raised rounded-2xl p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="p-2 -m-2"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function DebtsList() {
  const navigate = useNavigate();
  const { business, userId, activeBranchId, branches } = useAuth();
  const currency = business?.currency ?? 'KES';
  const businessId = business?.id;

  const debts = useLiveQuery(
    () => (businessId ? db.debts.where('businessId').equals(businessId).toArray() : []),
    [businessId]
  ) ?? [];
  const customers = useLiveQuery(
    () => (businessId ? db.customers.where('businessId').equals(businessId).toArray() : []),
    [businessId]
  ) ?? [];

  const [filter, setFilter] = useState<'all' | Debt['status']>('all');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [section, setSection] = useState<'debts' | 'deposits'>('debts');
  const [depositing, setDepositing] = useState(false);
  const [depositKey, setDepositKey] = useState(0);

  const customerName = (id: string | null) => (id ? customers.find((c) => c.id === id)?.name ?? null : null);
  const label = (d: Debt) => debtorLabel(d, customerName(d.customerId));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return debts
      .filter((d) => filter === 'all' || effectiveStatus(d) === filter)
      .filter((d) => !q || label(d).toLowerCase().includes(q) || (d.reason ?? '').toLowerCase().includes(q) || (d.debtorPhone ?? '').includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debts, customers, filter, query]);

  const totalOutstanding = debts.reduce((s, d) => s + (effectiveStatus(d) === 'paid' ? 0 : d.remainingAmount), 0);
  const totalOverdue = debts.reduce((s, d) => s + (effectiveStatus(d) === 'overdue' ? d.remainingAmount : 0), 0);
  const totalPaid = debts.reduce((s, d) => s + d.paidAmount, 0);
  const branchId = activeBranchId ?? branches[0]?.id ?? null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="font-display text-2xl font-semibold">Debts</h1>
        <div className="flex gap-2">
          <button onClick={() => setDepositing(true)} className="btn-secondary inline-flex items-center gap-1.5 !py-2 !px-3.5 text-sm"><Wallet className="w-4 h-4" /> Add deposit</button>
          <button onClick={() => setAdding(true)} disabled={!userId || !branchId} className="btn-primary inline-flex items-center gap-1.5 !py-2 !px-3.5 text-sm">
            <Plus className="w-4 h-4" /> Add debt
          </button>
        </div>
      </div>
      <div role="tablist" aria-label="Debts sections" className="flex gap-1 border-b border-slate-200 mt-3 mb-1">
        {([['debts', 'Debts'], ['deposits', 'Customer deposits']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={section === k} onClick={() => setSection(k)} className={`px-4 min-h-[44px] text-sm border-b-2 -mb-px ${section === k ? 'border-field-600 text-ink font-medium' : 'border-transparent text-slate-500 hover:text-ink'}`}>{l}</button>
        ))}
      </div>
      {section === 'deposits' && <DepositsTab key={depositKey} customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))} currency={currency} />}
      {section === 'debts' && <>
      {debts.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3 mb-4 text-center">
          <div className="card p-2.5"><div className="tnum font-semibold text-lg text-rust-600">{money(totalOutstanding, currency)}</div><div className="text-[11px] text-slate-500">Outstanding</div></div>
          <div className="card p-2.5"><div className="tnum font-semibold text-lg text-amber-600">{money(totalOverdue, currency)}</div><div className="text-[11px] text-slate-500">Overdue</div></div>
          <div className="card p-2.5"><div className="tnum font-semibold text-lg text-field-700">{money(totalPaid, currency)}</div><div className="text-[11px] text-slate-500">Paid</div></div>
        </div>
      )}

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input className="input !pl-9" placeholder="Search name, phone or reason" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {(['all', 'outstanding', 'partial', 'overdue', 'paid'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-2 rounded-full whitespace-nowrap ${filter === f ? 'bg-field-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-slate-100">
        {filtered.length === 0 && <p className="text-sm text-slate-500 py-8 text-center">No debts match this filter.</p>}
        {filtered.map((d) => (
          <div key={d.id} className="flex items-stretch hover:bg-slate-50 focus-within:bg-slate-50">
          <button onClick={() => navigate(`/debts/${d.id}`)}
            className="flex-1 min-w-0 flex items-center justify-between gap-3 p-4 text-left active:bg-slate-100 min-h-[64px]">
            <PersonAvatar name={label(d)} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">
                {label(d)}
                {!d.customerId && <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">not a customer</span>}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>{new Date(d.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <StatusBadge status={effectiveStatus(d)} />
                {d.dueDate && effectiveStatus(d) !== 'paid' && <span>due {new Date(`${d.dueDate}T00:00:00`).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <div className="tnum font-semibold">{money(d.remainingAmount, currency)}</div>
                <div className="text-xs text-slate-500 tnum">of {money(d.originalAmount, currency)}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </div>
          </button>
          {(d.debtorPhone || customers.find((c) => c.id === d.customerId)?.phone) && (
            <div className="hidden sm:flex items-center gap-1 pr-3">
              <a href={telHref(d.debtorPhone ?? customers.find((c) => c.id === d.customerId)?.phone)} aria-label={`Call ${label(d)}`} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"><Phone className="w-4 h-4" /></a>
              <a href={waHref(d.debtorPhone ?? customers.find((c) => c.id === d.customerId)?.phone, `Hello ${label(d)}, a reminder about your balance of ${currency} ${d.remainingAmount.toLocaleString()}.`)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${label(d)}`} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"><MessageCircle className="w-4 h-4" /></a>
            </div>
          )}
          </div>
        ))}
      </div>

      </>}

      {depositing && <AddDepositModal customers={customers.map((c) => ({ id: c.id, name: c.name }))} onClose={() => setDepositing(false)} onDone={() => { setSection('deposits'); setDepositKey((k) => k + 1); }} />}

      {adding && userId && business && branchId && (
        <AddDebtModal
          customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          businessId={business.id} branchId={branchId} userId={userId}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

function AddDebtModal({ customers, businessId, branchId, userId, onClose }: {
  customers: { id: string; name: string }[]; businessId: string; branchId: string; userId: string; onClose: () => void;
}) {
  const [kind, setKind] = useState<'customer' | 'other'>('other');
  const [customerId, setCustomerId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [debtDate, setDebtDate] = useState(today());
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError(null);
    if (kind === 'customer' && !customerId) { setError('Choose a customer'); return; }
    setSaving(true);
    try {
      await createManualDebt({
        businessId, branchId, userId,
        customerId: kind === 'customer' ? customerId : null,
        debtorName: name, debtorPhone: phone,
        amount: parseFloat(amount), reason, notes, debtDate, dueDate: dueDate || null
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save debt');
    } finally { setSaving(false); }
  }

  return (
    <Modal title="Add debt" onClose={onClose}>
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl" role="tablist">
        {([['other', 'Not a customer'], ['customer', 'Existing customer']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
            className={`text-sm font-medium py-2 rounded-lg ${kind === k ? 'bg-paper-raised shadow-sm' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>
      {kind === 'customer' ? (
        <Field label="Customer">
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      ) : (
        <>
          <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Mwangi" autoFocus /></Field>
          <Field label="Phone (optional)"><input className="input" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" /></Field>
        </>
      )}
      <Field label={`Amount`}><input className="input tnum" type="number" inputMode="decimal" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <Field label="Reason"><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Goods on credit" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input className="input" type="date" value={debtDate} onChange={(e) => setDebtDate(e.target.value)} /></Field>
        <Field label="Due date"><input className="input" type="date" value={dueDate} min={debtDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
      </div>
      <Field label="Notes (optional)"><textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      {error && <p className="text-sm text-rust-600">{error}</p>}
      <button onClick={submit} disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save debt'}</button>
    </Modal>
  );
}

