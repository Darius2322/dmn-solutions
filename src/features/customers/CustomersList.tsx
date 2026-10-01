import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, X, Star, ChevronRight } from 'lucide-react';
import { db, newRecordBase, enqueueSync } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { customerOutstandingDebt } from '../../lib/sales';
import { recordAuditEvent } from '../../lib/audit';
import type { Customer } from '../../lib/types';

export function CustomersList() {
  const navigate = useNavigate();
  const { business } = useAuth();
  const currency = business?.currency ?? 'KES';
  const customers = useLiveQuery(
    () => (business ? db.customers.where('businessId').equals(business.id).toArray() : []),
    [business?.id]
  ) ?? [];
  const debts = useLiveQuery(
    () => (business ? db.debts.where('businessId').equals(business.id).toArray() : []),
    [business?.id]
  ) ?? [];
  const owingCount = new Set(debts.filter((d) => d.customerId && d.status !== 'paid').map((d) => d.customerId)).size;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const newCount = customers.filter((c) => c.createdAt >= thirtyDaysAgo).length;
  const [adding, setAdding] = useState(false);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-semibold">Customers</h1>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" /> Add customer
        </button>
      </div>
      {customers.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="card p-2.5"><div className="tnum font-semibold text-lg">{customers.length}</div><div className="text-[11px] text-slate-500">Customers</div></div>
          <div className="card p-2.5"><div className="tnum font-semibold text-lg text-field-700">{newCount}</div><div className="text-[11px] text-slate-500">New (30d)</div></div>
          <div className="card p-2.5"><div className="tnum font-semibold text-lg text-rust-600">{owingCount}</div><div className="text-[11px] text-slate-500">Owing</div></div>
        </div>
      )}
      <div className="card divide-y divide-slate-100">
        {customers.length === 0 && <p className="text-sm text-slate-500 py-8 text-center">No customers yet.</p>}
        {customers.map((c) => <CustomerRow key={c.id} customer={c} currency={currency} onOpen={() => navigate(`/customers/${c.id}`)} />)}
      </div>
      {adding && business && <AddCustomerModal businessId={business.id} onClose={() => setAdding(false)} />}
    </div>
  );
}

function CustomerRow({ customer, currency, onOpen }: { customer: Customer; currency: string; onOpen: () => void }) {
  const debt = useLiveQuery(() => customerOutstandingDebt(customer.id), [customer.id]) ?? 0;
  return (
    <button onClick={onOpen} className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-paper active:bg-slate-100 transition-colors">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate flex items-center gap-1.5">
          {customer.name}
          {customer.loyaltyRegistered && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
        </div>
        <div className="text-xs text-slate-500">{customer.phone ?? 'No phone'}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {debt > 0
          ? <div className="tnum text-sm font-medium text-rust-600">{currency} {debt.toLocaleString()}</div>
          : <div className="text-xs text-slate-400">No debt</div>}
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </button>
  );
}


function AddCustomerModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const { userId } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [creditLimit, setCreditLimit] = useState('0');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const record = {
        ...newRecordBase(),
        businessId,
        branchId: null,
        name: name.trim(),
        phone: phone || null,
        email: null,
        address: null,
        creditLimit: parseFloat(creditLimit) || 0,
        loyaltyRegistered: false,
        loyaltyPoints: 0,
        active: true
      };
      await db.customers.add(record as any);
      await enqueueSync('customers', record.id, 'create');
      await recordAuditEvent({ businessId, userId, action: 'customer_created', entityType: 'customer', entityId: record.id, newValue: JSON.stringify({ name: record.name, phone: record.phone }) });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full md:max-w-sm bg-paper-raised rounded-t-2xl md:rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">Add customer</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Phone</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Credit limit</span>
          <input className="input tnum" type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
        </label>
        <button onClick={submit} disabled={saving || !name.trim()} className="btn-primary w-full">{saving ? 'Saving…' : 'Add customer'}</button>
      </div>
    </div>
  );
}
