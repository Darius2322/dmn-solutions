import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Plus, Search, Check } from 'lucide-react';
import { db, enqueueSync } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { profileHasPermission } from '../../lib/permissions';
import { ProductAvatar } from '../../components/ProductAvatar';

/** One category: the products in it, plus adding products to it, either existing ones (pick several and move them
 * in) or a brand-new one (opens Add product with this category already chosen). */
export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business, profile } = useAuth();
  const canEdit = profileHasPermission(profile, 'inventory.update');
  const [picking, setPicking] = useState(false);
  const [q, setQ] = useState('');
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const category = useLiveQuery(() => (id ? db.categories.get(id) : undefined), [id]);
  const products = useLiveQuery(() => (business ? db.products.where('businessId').equals(business.id).toArray() : []), [business?.id]) ?? [];
  const categories = useLiveQuery(() => (business ? db.categories.where('businessId').equals(business.id).toArray() : []), [business?.id]) ?? [];
  const catName = (cid?: string | null) => categories.find((c) => c.id === cid)?.name;

  const inCat = useMemo(() => products.filter((p) => p.categoryId === id).sort((a, b) => a.name.localeCompare(b.name)), [products, id]);
  const candidates = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => p.categoryId !== id && p.active !== false && (!s || p.name.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s) || p.barcode?.includes(s))).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 100);
  }, [products, id, q]);

  if (!category || (business && category.businessId !== business.id)) {
    return <div className="p-6 text-sm text-slate-500">Category not found. <button className="underline" onClick={() => navigate('/categories')}>Back to categories</button></div>;
  }

  async function addChosen() {
    if (chosen.size === 0 || !id) return;
    setSaving(true);
    const now = new Date().toISOString();
    for (const pid of chosen) {
      await db.products.update(pid, { categoryId: id, updatedAt: now, syncStatus: 'pending' } as any);
      await enqueueSync('products', pid, 'update');
    }
    setSaving(false); setChosen(new Set()); setPicking(false); setQ('');
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      <button onClick={() => navigate('/categories')} className="flex items-center gap-1 text-sm text-slate-500 mb-3 min-h-[40px]"><ArrowLeft className="w-4 h-4" /> Categories</button>
      <h1 className="font-display text-2xl font-semibold">{category.name}</h1>
      <p className="text-sm text-slate-500 mb-4">{inCat.length} product{inCat.length === 1 ? '' : 's'}</p>

      {canEdit && !picking && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => navigate(`/inventory?add=1&category=${category.id}`)} className="btn-primary min-h-[48px] flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> New product</button>
          <button onClick={() => setPicking(true)} className="btn-secondary min-h-[48px] flex items-center justify-center gap-1.5"><Search className="w-4 h-4" /> Add existing</button>
        </div>
      )}

      {picking && (
        <section className="card p-3 mb-4" aria-label="Add existing products">
          <div className="flex items-center gap-2 mb-2">
            <input className="input flex-1" autoFocus placeholder="Search your products…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button onClick={() => { setPicking(false); setChosen(new Set()); setQ(''); }} className="btn-secondary min-h-[44px] px-3">Cancel</button>
          </div>
          {candidates.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">No other products to add.</p> : (
            <ul className="max-h-[50vh] overflow-y-auto divide-y divide-slate-100">
              {candidates.map((p) => {
                const on = chosen.has(p.id);
                return (
                  <li key={p.id}>
                    <button onClick={() => setChosen((s) => { const n = new Set(s); on ? n.delete(p.id) : n.add(p.id); return n; })} aria-pressed={on} className="w-full flex items-center gap-3 min-h-[56px] px-1 text-left hover:bg-slate-50 active:bg-slate-100">
                      <span className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${on ? 'bg-field-600 border-field-600 text-white' : 'border-slate-300'}`}>{on && <Check className="w-4 h-4" />}</span>
                      <ProductAvatar name={p.name} src={p.imageUrl} size={36} />
                      <span className="min-w-0 flex-1"><span className="block text-sm font-medium truncate">{p.name}</span><span className="block text-xs text-slate-500 truncate">{catName(p.categoryId) ? `Currently in ${catName(p.categoryId)}` : 'No category'}</span></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button onClick={addChosen} disabled={chosen.size === 0 || saving} className="btn-primary w-full min-h-[48px] mt-3">{saving ? 'Adding…' : chosen.size ? `Add ${chosen.size} to ${category.name}` : 'Select products to add'}</button>
          {chosen.size > 0 && <p className="text-[11px] text-slate-500 mt-1.5">Products already in another category will be moved here.</p>}
        </section>
      )}

      {inCat.length === 0 ? <p className="text-sm text-slate-500 py-8 text-center">No products in this category yet.</p> : (
        <ul className="card divide-y divide-slate-100 overflow-hidden">
          {inCat.map((p) => (
            <li key={p.id}>
              <button onClick={() => navigate(`/inventory/${p.id}`)} className="w-full flex items-center gap-3 min-h-[60px] px-3 text-left hover:bg-slate-50 active:bg-slate-100">
                <ProductAvatar name={p.name} src={p.imageUrl} size={40} />
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium truncate">{p.name}</span><span className="block text-xs text-slate-500">{p.sku ?? '—'}</span></span>
                <span className={`tnum text-sm shrink-0 ${p.quantity <= 0 ? 'text-rust-600' : p.quantity <= p.minStock ? 'text-amber-600' : ''}`}>{p.quantity} {p.unit}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
