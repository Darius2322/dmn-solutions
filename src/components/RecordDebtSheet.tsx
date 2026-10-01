import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createManualDebt } from '../lib/debts';
import { useAuth } from '../lib/auth';

const today = () => new Date().toISOString().slice(0, 10);

/** Record a debt (someone owes the business). Pass `customer` to preset a customer; leave it out to record a debt
 * for a person who isn't a customer. Used from the customer page and the Debts page. */
export function RecordDebtSheet({ customer, onClose, onDone }: { customer?: { id: string; name: string; phone?: string | null }; onClose: () => void; onDone?: () => void }) {
  const { business, userId, activeBranchId, branches } = useAuth();
  const branchId = activeBranchId ?? branches[0]?.id ?? null;
  const [name, setName] = useState(customer?.name ?? ''); const [phone, setPhone] = useState(customer?.phone ?? '');
  const [amount, setAmount] = useState(''); const [reason, setReason] = useState(''); const [dueDate, setDueDate] = useState(''); const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!business || !userId || !branchId) { setError('Your session is still loading. Try again in a moment.'); return; }
    setBusy(true); setError(null);
    try {
      await createManualDebt({ businessId: business.id, branchId, userId, customerId: customer?.id ?? null, debtorName: name, debtorPhone: phone, amount: parseFloat(amount), reason, notes, debtDate: today(), dueDate: dueDate || null });
      onDone?.(); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the debt.'); } finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Record debt">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative bg-paper-raised w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Record debt</h2><button onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button></div>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Who owes</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} readOnly={!!customer} /></label>
        {!customer && <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Phone (optional)</span><input className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>}
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Amount ({business?.currency ?? 'KES'})</span><input className="input tnum text-lg" type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus /></label>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">What it's for</span><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Goods taken on credit" /></label>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Due date (optional)</span><input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Notes (optional)</span><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        {error && <p role="alert" className="text-sm text-rust-600">{error}</p>}
        <div className="flex gap-2"><button onClick={onClose} className="btn-secondary flex-1 min-h-[46px]">Cancel</button><button onClick={save} disabled={busy} className="btn-primary flex-1 min-h-[46px] flex items-center justify-center gap-1.5">{busy && <Loader2 className="w-4 h-4 animate-spin" />} Save debt</button></div>
      </div>
    </div>
  );
}
