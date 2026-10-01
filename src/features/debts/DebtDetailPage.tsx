import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Share2, Printer, Download, Phone, MessageCircle } from 'lucide-react';
import { PersonAvatar } from '../../components/PersonAvatar';
import { telHref, waHref } from '../../lib/brand';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { downloadDebtStatementPdf } from '../../lib/downloads';
import { recordDebtPayment } from '../../lib/sales';
import { updateDebt, effectiveStatus, debtorLabel, debtSummaryText } from '../../lib/debts';
import type { Debt, PaymentMethod } from '../../lib/types';

function money(n: number, currency: string) {
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: Debt['status'] }) {
  const styles: Record<string, string> = {
    outstanding: 'bg-rust-50 text-rust-600',
    partial: 'bg-amber-100 text-amber-600',
    paid: 'bg-field-50 text-field-700',
    overdue: 'bg-rust-600 text-white'
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{status}</span>;
}

/** Full-page debt detail — replaces the centered dialog. Same content and
 * actions (record payment, edit, share/print/download statement), just
 * given a proper page instead of a 90vh-capped scrolling box. */
export function DebtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business, userId, activeBranchId, branches } = useAuth();
  const currency = business?.currency ?? 'KES';
  const branchId = activeBranchId ?? branches[0]?.id ?? null;

  const debt = useLiveQuery(() => (id ? db.debts.get(id) : undefined), [id]);
  const customer = useLiveQuery(() => (debt?.customerId ? db.customers.get(debt.customerId) : undefined), [debt?.customerId]);
  const [dtab, setDtab] = useState<'details' | 'payments' | 'notes'>('details');
  const payments = useLiveQuery(() => (id ? db.payments.where('debtId').equals(id).toArray() : []), [id]) ?? [];
  const sorted = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const [mode, setMode] = useState<'view' | 'pay' | 'edit'>('view');

  if (debt === undefined) {
    return <div className="p-4 md:p-8 max-w-2xl mx-auto text-sm text-slate-400">Loading…</div>;
  }
  if (!debt || (business && debt.businessId !== business.id)) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center py-16">
        <p className="text-sm text-slate-500 mb-3">This debt isn't available.</p>
        <Link to="/debts" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Debts
        </Link>
      </div>
    );
  }

  const label = debtorLabel(debt, customer?.name ?? null);
  const status = effectiveStatus(debt);

  async function share() {
    const text = debtSummaryText(debt!, business?.name ?? 'ShopOS', currency, label);
    if (navigator.share) { try { await navigator.share({ title: 'Debt statement', text }); return; } catch { /* cancelled */ } }
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
  }
  async function downloadPdf() {
    if (business && debt) await downloadDebtStatementPdf({ business, debt, debtor: label, status, payments, currency });
  }
  function print() {
    const w = window.open('', '_blank', 'width=420,height=600');
    if (!w || !debt) return;
    const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    w.document.write(`<pre style="font:14px/1.5 monospace;white-space:pre-wrap">${esc(debtSummaryText(debt, business?.name ?? 'ShopOS', currency, label))}</pre>`);
    w.document.close(); w.focus(); w.print();
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
      <button onClick={() => navigate('/debts')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Debts
      </button>

      <div className="card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <PersonAvatar name={label} size={52} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold break-words">{label}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              <StatusBadge status={status} />
              {!debt.customerId && <span className="text-xs text-slate-500">Not a registered customer</span>}
              <span className="text-xs text-slate-400">Recorded {new Date(debt.createdAt).toLocaleString()}</span>
            </div>
          </div>
          {debt.debtorPhone && (
            <div className="flex gap-1.5 shrink-0">
              <a href={telHref(debt.debtorPhone)} aria-label="Call" className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"><Phone className="w-4 h-4" /></a>
              <a href={waHref(debt.debtorPhone, `Hello ${label}, a reminder about your balance of ${currency} ${debt.remainingAmount.toLocaleString()}.`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp reminder" className="w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100"><MessageCircle className="w-4 h-4" /></a>
            </div>
          )}
        </div>

        <div role="tablist" aria-label="Debt sections" className="flex gap-1 border-b border-slate-200 -mx-1 px-1">
          {([['details', 'Details'], ['payments', `Payments${sorted.length ? ` (${sorted.length})` : ''}`], ['notes', 'Notes']] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={dtab === k} onClick={() => setDtab(k)} className={`px-3 min-h-[44px] text-sm border-b-2 -mb-px ${dtab === k ? 'border-field-600 text-ink font-medium' : 'border-transparent text-slate-500 hover:text-ink'}`}>{l}</button>
          ))}
        </div>

        {dtab === 'details' && <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-1">
          <dt className="text-slate-500">Amount</dt><dd className="text-right tnum">{money(debt.originalAmount, currency)}</dd>
          <dt className="text-slate-500">Paid</dt><dd className="text-right tnum">{money(debt.paidAmount, currency)}</dd>
          <dt className="font-medium">Balance</dt><dd className="text-right tnum font-semibold text-rust-600">{money(debt.remainingAmount, currency)}</dd>
          <dt className="text-slate-500">Date</dt><dd className="text-right">{new Date(debt.debtDate ?? debt.createdAt).toLocaleDateString()}</dd>
          {debt.dueDate && (<><dt className="text-slate-500">Due</dt><dd className="text-right">{new Date(`${debt.dueDate}T00:00:00`).toLocaleDateString()}</dd></>)}
          {debt.debtorPhone && (<><dt className="text-slate-500">Phone</dt><dd className="text-right"><a className="text-field-600" href={`tel:${debt.debtorPhone}`}>{debt.debtorPhone}</a></dd></>)}
          {debt.reason && (<><dt className="text-slate-500">Reason</dt><dd className="text-right break-words">{debt.reason}</dd></>)}
          <dt className="text-slate-500">Created</dt><dd className="text-right">{new Date(debt.createdAt).toLocaleString()}</dd>
          <dt className="text-slate-500">Updated</dt><dd className="text-right">{new Date(debt.updatedAt).toLocaleString()}</dd>
        </dl>}
        {dtab === 'notes' && !debt.notes && <p className="text-xs text-slate-500">No notes.</p>}
        {dtab === 'notes' && debt.notes && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 break-words">{debt.notes}</p>}

        {dtab === 'payments' && <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Payment history</h2>
          {sorted.length === 0 ? <p className="text-xs text-slate-500">No payments yet.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {sorted.map((p) => (
                <li key={p.id} className="py-2 flex justify-between gap-3">
                  <span className="text-slate-500">{new Date(p.createdAt).toLocaleString()} · {p.method}</span>
                  <span className="tnum font-medium">{money(p.amount, currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>}

        {mode === 'pay' && userId && branchId && (
          <PayForm debt={debt} currency={currency} businessId={debt.businessId} branchId={branchId} userId={userId} onDone={() => setMode('view')} />
        )}
        {mode === 'edit' && <EditForm debt={debt} currency={currency} onDone={() => setMode('view')} />}

        {mode === 'view' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {status !== 'paid' && <button onClick={() => setMode('pay')} className="btn-primary col-span-2">Record payment</button>}
            {debt.source === 'manual' ? <button onClick={() => setMode('edit')} className="btn-secondary">Edit</button> : <span />}
            <div className="flex gap-2">
              <button onClick={downloadPdf} className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5" aria-label="Download PDF statement"><Download className="w-4 h-4" /></button>
              <button onClick={share} className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5" aria-label="Share"><Share2 className="w-4 h-4" /></button>
              <button onClick={print} className="btn-secondary flex-1 inline-flex items-center justify-center gap-1.5" aria-label="Print"><Printer className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function PayForm({ debt, currency, businessId, branchId, userId, onDone }: {
  debt: Debt; currency: string; businessId: string; branchId: string; userId: string; onDone: () => void;
}) {
  const [amount, setAmount] = useState(String(debt.remainingAmount));
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError(null);
    const n = parseFloat(amount);
    if (!n || n <= 0) { setError('Enter a valid amount'); return; }
    setSaving(true);
    try {
      await recordDebtPayment({ businessId, branchId, debt, amount: n, method, userId });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record payment');
    } finally { setSaving(false); }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
      <h4 className="text-sm font-medium">Record payment</h4>
      <p className="text-sm text-slate-500">Remaining balance: <span className="tnum font-medium text-ink">{money(debt.remainingAmount, currency)}</span></p>
      <Field label="Amount"><input className="input tnum" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus /></Field>
      <Field label="Method">
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
          <option value="cash">Cash</option><option value="mpesa">M-Pesa</option><option value="card">Card</option>
          <option value="bank">Bank</option><option value="other">Other</option>
        </select>
      </Field>
      {error && <p className="text-sm text-rust-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onDone} className="btn-secondary flex-1">Cancel</button>
        <button onClick={submit} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Record payment'}</button>
      </div>
    </div>
  );
}

function EditForm({ debt, currency, onDone }: { debt: Debt; currency: string; onDone: () => void }) {
  const [name, setName] = useState(debt.debtorName ?? '');
  const [phone, setPhone] = useState(debt.debtorPhone ?? '');
  const [amount, setAmount] = useState(String(debt.originalAmount));
  const [reason, setReason] = useState(debt.reason ?? '');
  const [dueDate, setDueDate] = useState(debt.dueDate ?? '');
  const [notes, setNotes] = useState(debt.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError(null); setSaving(true);
    try {
      await updateDebt(debt, { debtorName: name, debtorPhone: phone, amount: parseFloat(amount), reason, notes, dueDate: dueDate || null });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally { setSaving(false); }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
      <h4 className="text-sm font-medium">Edit debt</h4>
      {!debt.customerId && (
        <>
          <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Phone (optional)"><input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        </>
      )}
      <Field label={`Amount (${currency}) — paid so far ${debt.paidAmount}`}><input className="input tnum" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <Field label="Reason"><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      <Field label="Due date"><input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
      <Field label="Notes"><textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      {error && <p className="text-sm text-rust-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onDone} className="btn-secondary flex-1">Cancel</button>
        <button onClick={submit} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  );
}
