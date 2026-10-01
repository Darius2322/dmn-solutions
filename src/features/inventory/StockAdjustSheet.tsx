import { useState } from 'react';
import { X, Minus, Plus, Equal, Check, Loader2 } from 'lucide-react';
import { adjustStock, ADJUST_REASONS, previewAdjustment, type AdjustMode } from '../../lib/products';
import type { InventoryMovement, Product } from '../../lib/types';

interface Props {
  product: Pick<Product, 'id' | 'businessId' | 'branchId' | 'quantity' | 'name' | 'unit' | 'buyingPrice'>;
  userId: string | null;
  currency: string;
  showCost: boolean;
  onClose: () => void;
  onDone?: (result: { before: number; after: number }) => void;
}

const MODES: { key: AdjustMode; label: string; icon: typeof Plus; help: string }[] = [
  { key: 'add', label: 'Add', icon: Plus, help: 'Increase stock by this many' },
  { key: 'remove', label: 'Remove', icon: Minus, help: 'Decrease stock by this many' },
  { key: 'set', label: 'Set to', icon: Equal, help: 'Enter the exact counted quantity' }
];

/** Bottom sheet (dialog on desktop) for changing one product's stock. Every save writes a documented ledger entry:
 * who, when, the reason, the note, and before → after. Nothing here changes stock without a reason. */
export function StockAdjustSheet({ product, userId, currency, showCost, onClose, onDone }: Props) {
  const [mode, setMode] = useState<AdjustMode>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState<InventoryMovement['reason']>('supply');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ before: number; after: number } | null>(null);

  const n = parseFloat(amount);
  const valid = amount !== '' && Number.isFinite(n) && n >= 0;
  const next = valid ? previewAdjustment(product.quantity, mode, n) : null;
  const change = next != null ? next - product.quantity : null;
  const reasonInfo = ADJUST_REASONS.find((r) => r.value === reason);
  // Reasons that make sense for the direction chosen come first, but nothing is hidden.
  const reasons = [...ADJUST_REASONS].sort((a, b) => {
    const want = mode === 'add' ? 'in' : mode === 'remove' ? 'out' : 'any';
    const score = (d: string) => (d === want ? 0 : d === 'any' ? 1 : 2);
    return score(a.direction) - score(b.direction);
  });

  function pickMode(m: AdjustMode) {
    setMode(m); setError(null);
    setReason(m === 'add' ? 'supply' : m === 'remove' ? 'damage' : 'adjustment');
  }

  async function save() {
    setError(null); setSaving(true);
    try {
      const r = await adjustStock({ product, mode, amount: n, reason, note, userId });
      setDone({ before: r.before, after: r.after });
      onDone?.(r);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not adjust stock.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={`Adjust stock for ${product.name}`} onClick={onClose}>
      <div className="bg-paper w-full md:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold">Adjust stock</h2>
            <p className="text-sm text-slate-500 truncate">{product.name} · now <span className="tnum font-medium text-ink">{product.quantity} {product.unit}</span></p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-field-50 text-field-600 flex items-center justify-center mx-auto mb-3"><Check className="w-6 h-6" /></div>
            <p className="font-medium">Stock updated</p>
            <p className="text-sm text-slate-500 mt-1 tnum">{done.before} → <span className="font-semibold text-ink">{done.after}</span> {product.unit}</p>
            <p className="text-xs text-slate-500 mt-2">Saved to this product's history. It syncs automatically when you're online.</p>
            <button onClick={onClose} className="btn-primary mt-4 w-full min-h-[46px]">Done</button>
          </div>
        ) : (
          <>
            <div role="tablist" aria-label="Adjustment type" className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-1">
              {MODES.map((m) => (
                <button key={m.key} role="tab" aria-selected={mode === m.key} onClick={() => pickMode(m.key)}
                  className={`min-h-[44px] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${mode === m.key ? 'bg-paper-raised shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <m.icon className="w-4 h-4" /> {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mb-3">{MODES.find((m) => m.key === mode)?.help}</p>

            <label className="block mb-3">
              <span className="block text-sm font-medium text-slate-600 mb-1.5">Quantity ({product.unit})</span>
              <input className="input tnum text-lg" type="number" inputMode="decimal" min="0" step="any" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} placeholder="0" autoFocus />
            </label>

            {next != null && (
              <div className="rounded-card bg-slate-50 px-3 py-2.5 mb-3 text-sm flex items-center justify-between gap-3">
                <span className="tnum">{product.quantity} → <b className={next < 0 ? 'text-rust-600' : ''}>{next}</b> {product.unit}</span>
                <span className="text-right">
                  <span className={`tnum font-medium ${change! > 0 ? 'text-field-600' : change! < 0 ? 'text-rust-600' : 'text-slate-500'}`}>{change! > 0 ? '+' : ''}{change}</span>
                  {showCost && change !== 0 && <span className="block text-[11px] text-slate-500 tnum">≈ {currency} {Math.abs(Math.round(change! * product.buyingPrice)).toLocaleString()} at cost</span>}
                </span>
              </div>
            )}

            <label className="block mb-3">
              <span className="block text-sm font-medium text-slate-600 mb-1.5">Reason</span>
              <select className="input" value={reason} onChange={(e) => setReason(e.target.value as InventoryMovement['reason'])}>
                {reasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {reasonInfo && <span className="block text-xs text-slate-500 mt-1">{reasonInfo.hint}</span>}
            </label>

            <label className="block mb-3">
              <span className="block text-sm font-medium text-slate-600 mb-1.5">Note {reason === 'other' ? <span className="text-rust-600">(required)</span> : <span className="text-slate-400 font-normal">(optional)</span>}</span>
              <textarea className="input min-h-[64px]" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="e.g. Delivery note #482, or 3 boxes crushed in storage" />
            </label>

            {error && <p role="alert" className="text-sm text-rust-600 mb-3">{error}</p>}
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary flex-1 min-h-[46px]">Cancel</button>
              <button onClick={save} disabled={saving || !valid} className="btn-primary flex-1 min-h-[46px] flex items-center justify-center gap-1.5">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save adjustment'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
