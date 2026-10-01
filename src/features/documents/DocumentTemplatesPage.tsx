import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { db, enqueueSync } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { profileHasPermission } from '../../lib/permissions';
import { DocumentView } from '../../components/DocumentView';
import { ACCENT_SWATCHES, DOC_TEMPLATES, isHex, paymentInfoLines, type DocData } from '../../lib/documentTemplates';
import { useShoposContact } from '../../lib/brand';

/** Owner-facing choice of document template. The choice applies to receipts, quotations and invoices (in the app,
 * when printed, and on shared links). Every template carries the ShopOS branding; only the layout changes. */
export function DocumentTemplatesPage() {
  const { business, profile } = useAuth();
  const canChange = profileHasPermission(profile, 'business.settings') || profile?.role === 'owner';
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const brand = useShoposContact();
  const [customHex, setCustomHex] = useState('');
  if (!business) return null;
  const accent = business.documentAccent ?? null;
  const current = business.documentTemplate ?? 'classic';

  // A clearly-labelled sample, filled in with THIS business's own name, contact details and payment info.
  const sample: DocData = {
    docType: 'invoice', number: 'SAMPLE-0001', status: 'sent', createdAt: new Date().toISOString(), dueLabel: 'Due',
    dueDate: new Date(Date.now() + 7 * 864e5).toISOString(), currency: business.currency,
    business: { name: business.name, phone: business.phone, email: business.email, address: business.address, taxPin: business.taxPin, logoUrl: business.logoUrl },
    customerName: 'Sample customer', customerPhone: null,
    items: [
      { description: 'Sample item A', quantity: 2, unitPrice: 500, discount: 0, lineTotal: 1000 },
      { description: 'Sample item B', quantity: 1, unitPrice: 1500, discount: 0, lineTotal: 1500 }
    ],
    subtotal: 2500, discount: 0, tax: 0, total: 2500, amountPaid: 500, balance: 2000,
    paymentInfo: paymentInfoLines(business), notes: 'This is a preview with sample figures.'
  };

  async function choose(id: string) {
    if (!canChange || id === current || !business) return;
    setSaving(id); setError(null);
    try {
      await db.businesses.update(business.id, { documentTemplate: id, updatedAt: new Date().toISOString(), syncStatus: 'pending' } as any);
      await enqueueSync('businesses', business.id, 'update');
      useAuth.setState({ business: { ...business, documentTemplate: id } as any });
    } catch { setError('Could not save your choice. Please try again.'); }
    finally { setSaving(null); }
  }

  async function setAccent(hex: string | null) {
    if (!canChange || !business) return;
    if (hex && !isHex(hex)) { setError('Enter a colour like #146b4a'); return; }
    setError(null);
    try {
      await db.businesses.update(business.id, { documentAccent: hex, updatedAt: new Date().toISOString(), syncStatus: 'pending' } as any);
      await enqueueSync('businesses', business.id, 'update');
      useAuth.setState({ business: { ...business, documentAccent: hex } as any });
    } catch { setError('Could not save the colour. Please try again.'); }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      <h1 className="font-display text-2xl font-semibold">Document templates</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">Pick how your receipts, quotations and invoices look. All templates carry the ShopOS branding and use your business name, logo and payment details.</p>
      {!canChange && <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-3"><Lock className="w-3.5 h-3.5" /> Only the owner or a manager with settings access can change the template.</p>}
      <section className="card p-3 mb-4" aria-label="Brand colour">
        <div className="text-sm font-medium mb-1">Brand colour</div>
        <p className="text-xs text-slate-500 mb-2">Used for headings, rules and totals. Leave on "Template default" to use each layout's own colour.</p>
        <div className="flex flex-wrap items-center gap-2">
          <button disabled={!canChange} onClick={() => setAccent(null)} aria-pressed={!accent} className={`min-h-[40px] px-3 rounded-full text-xs font-medium border ${!accent ? 'border-field-500 ring-1 ring-field-500' : 'border-slate-200'}`}>Template default</button>
          {ACCENT_SWATCHES.map((c) => (
            <button key={c} disabled={!canChange} onClick={() => setAccent(c)} aria-label={`Use colour ${c}`} aria-pressed={accent === c}
              className={`w-10 h-10 rounded-full border-2 ${accent === c ? 'border-ink ring-2 ring-offset-2 ring-field-500' : 'border-transparent'}`} style={{ background: c }} />
          ))}
          <input disabled={!canChange} className="input !w-28 !min-h-[40px] text-xs" placeholder="#RRGGBB" value={customHex} maxLength={7} onChange={(e) => setCustomHex(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void setAccent(customHex.trim()); }} aria-label="Custom colour" />
          <button disabled={!canChange || !isHex(customHex.trim())} onClick={() => setAccent(customHex.trim())} className="btn-secondary min-h-[40px] px-3 text-xs">Use</button>
        </div>
      </section>
      {error && <p role="alert" className="text-sm text-rust-600 mb-3">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOC_TEMPLATES.map((t) => {
          const active = t.id === current;
          return (
            <button key={t.id} onClick={() => choose(t.id)} disabled={!canChange || !!saving} aria-pressed={active}
              className={`text-left card p-3 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:opacity-70 ${active ? '!border-field-500 ring-1 ring-field-500' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-slate-500">{t.description}</div></div>
                {active && <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-field-700 bg-field-50 rounded-full px-2 py-1"><Check className="w-3 h-3" /> In use</span>}
              </div>
              <div className="overflow-hidden rounded-card bg-slate-50 h-64 pointer-events-none">
                <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center', width: '182%', marginLeft: '-41%' }}><DocumentView doc={sample} templateId={t.id} accent={accent} brand={brand} fullWidth /></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
