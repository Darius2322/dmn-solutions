import { ReactNode, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Pencil, PackagePlus, EyeOff, Eye, Trash2 } from 'lucide-react';
import { db, enqueueSync } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { ADJUST_REASONS } from '../../lib/products';
import { StockAdjustSheet } from './StockAdjustSheet';
import { profileHasPermission } from '../../lib/permissions';
import { recordAuditEvent } from '../../lib/audit';
import { touchActivity } from '../../lib/activity';
import { EditProductModal } from './InventoryList';

const DAY = 24 * 60 * 60 * 1000;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd className="text-right break-words min-w-0">{children}</dd>
    </div>
  );
}

/** Full-page product detail — replaces the centered dialog. Stock summary,
 * movement history, and adjustment/edit/delete actions get their own room
 * instead of a scrolling 90vh-capped box. */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, userId, branches, business } = useAuth();
  const currency = business?.currency ?? 'KES';
  const canEdit = profileHasPermission(profile, 'inventory.update');
  const canAdjust = profileHasPermission(profile, 'inventory.adjust');
  const canDelete = profileHasPermission(profile, 'inventory.delete');
  const canSeeCost = canEdit || profileHasPermission(profile, 'reports.financial');

  const product = useLiveQuery(() => (id ? db.products.get(id) : undefined), [id]);
  const [mode, setMode] = useState<'view' | 'adjust' | 'confirmDelete'>('view');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supplier = useLiveQuery(() => (product?.supplierId ? db.suppliers.get(product.supplierId) : undefined), [product?.supplierId]);
  const category = useLiveQuery(() => (product?.categoryId ? db.categories.get(product.categoryId) : undefined), [product?.categoryId]);
  const movements = useLiveQuery(async () => {
    if (!product) return [];
    const rows = await db.inventoryMovements.where('productId').equals(product.id).toArray();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [product?.id]) ?? [];

  const people = useLiveQuery(async () => {
    if (!product) return {} as Record<string, string>;
    const rows = await db.profiles.filter((p) => p.businessId === product.businessId).toArray();
    return Object.fromEntries(rows.map((r) => [r.userId, r.fullName])) as Record<string, string>;
  }, [product?.businessId]) ?? {};

  const summary = useMemo(() => {
    const since = Date.now() - 30 * DAY;
    let inQty = 0, outQty = 0, sold = 0;
    for (const m of movements) {
      if (new Date(m.createdAt).getTime() < since) continue;
      if (m.quantityChange > 0) inQty += m.quantityChange; else outQty += -m.quantityChange;
      if (m.reason === 'sale') sold += -m.quantityChange;
    }
    return { inQty, outQty, sold };
  }, [movements]);
  const adjustments = movements.filter((m) => m.reason !== 'sale').slice(0, 15);
  const recentSales = movements.filter((m) => m.reason === 'sale').slice(0, 5);

  if (product === undefined) {
    return <div className="p-4 md:p-8 max-w-2xl mx-auto text-sm text-slate-400">Loading…</div>;
  }
  if (!product || (business && product.businessId !== business.id)) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center py-16">
        <p className="text-sm text-slate-500 mb-3">This product isn't available.</p>
        <Link to="/inventory" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Inventory
        </Link>
      </div>
    );
  }

  const branchName = branches.find((b) => b.id === product.branchId)?.name;
  const stockState = product.quantity <= 0 ? 'Out of stock' : product.quantity <= product.minStock ? 'Low stock' : 'In stock';
  const stockColor = product.quantity <= 0 ? 'text-rust-600' : product.quantity <= product.minStock ? 'text-amber-600' : 'text-field-700';

  async function toggleActive() {
    if (!product) return;
    const next = !product.active;
    await db.products.update(product.id, { active: next, updatedAt: new Date().toISOString() });
    await enqueueSync('products', product.id, 'update');
    await recordAuditEvent({
      businessId: product.businessId, branchId: product.branchId, userId, action: next ? 'product_enabled' : 'product_disabled',
      entityType: 'product', entityId: product.id,
      previousValue: JSON.stringify({ active: product.active }), newValue: JSON.stringify({ active: next })
    });
    touchActivity('inventory');
  }

  async function doDelete() {
    if (!product) return;
    const sales = await db.saleItems.where('productId').equals(product.id).count();
    if (sales > 0) {
      setMode('view');
      setMessage("This product has sales history, so it can't be deleted. Hide it instead — it stays in your reports but disappears from the POS.");
      return;
    }
    await db.products.delete(product.id);
    await enqueueSync('products', product.id, 'delete');
    await recordAuditEvent({
      businessId: product.businessId, branchId: product.branchId, userId, action: 'product_deleted',
      entityType: 'product', entityId: product.id, previousValue: JSON.stringify({ name: product.name })
    });
    touchActivity('inventory');
    navigate('/inventory');
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
      <button onClick={() => navigate('/inventory')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </button>

      <div className="card p-5 space-y-5">
        <div>
          <h1 className="font-display text-2xl font-semibold break-words">{product.name}</h1>
          <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
            <span className={`font-medium ${stockColor}`}>{stockState}</span>
            {!product.active && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Hidden from POS</span>}
          </div>
        </div>

        {message && <p className="text-sm bg-amber-100 text-amber-600 rounded-lg p-3">{message}</p>}
        {product.imageUrl && <img src={product.imageUrl} alt="" loading="lazy" className="w-full max-h-48 object-contain rounded-lg bg-slate-50" />}

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="card p-3"><div className="text-xs text-slate-500">Stock</div><div className="tnum font-semibold">{product.quantity} {product.unit}</div></div>
          <div className="card p-3"><div className="text-xs text-slate-500">Selling</div><div className="tnum font-semibold">{currency} {product.sellingPrice.toLocaleString()}</div></div>
          {canSeeCost
            ? <div className="card p-3"><div className="text-xs text-slate-500">Cost</div><div className="tnum font-semibold">{currency} {product.buyingPrice.toLocaleString()}</div></div>
            : <div className="card p-3"><div className="text-xs text-slate-500">Low-stock at</div><div className="tnum font-semibold">{product.minStock}</div></div>}
        </div>

        <dl className="divide-y divide-slate-100">
          <Row label="SKU">{product.sku ?? '—'}</Row>
          {product.barcode && <Row label="Barcode"><span className="tnum">{product.barcode}</span></Row>}
          <Row label="Category">{category?.name ?? '—'}</Row>
          {product.brand && <Row label="Brand">{product.brand}</Row>}
          <Row label="Unit">{product.unit}</Row>
          {canSeeCost && <Row label="Low-stock threshold"><span className="tnum">{product.minStock}</span></Row>}
          <Row label="Supplier">{supplier?.name ?? '—'}</Row>
          {branchName && <Row label="Branch">{branchName}</Row>}
          <Row label="Status">{product.active ? 'Active' : 'Hidden'}</Row>
          <Row label="Created">{new Date(product.createdAt).toLocaleString()}</Row>
          <Row label="Last updated">{new Date(product.updatedAt).toLocaleString()}</Row>
        </dl>

        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Last 30 days</h2>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="card p-2.5"><div className="tnum font-semibold text-field-700">+{summary.inQty}</div><div className="text-xs text-slate-500">In</div></div>
            <div className="card p-2.5"><div className="tnum font-semibold text-rust-600">−{summary.outQty}</div><div className="text-xs text-slate-500">Out</div></div>
            <div className="card p-2.5"><div className="tnum font-semibold">{summary.sold}</div><div className="text-xs text-slate-500">Sold</div></div>
          </div>
        </section>

        <MovementList title="Stock adjustments" rows={adjustments} people={people} empty="No adjustments recorded yet." />
        <MovementList title="Recent sales" rows={recentSales} people={people} empty="No sales recorded." />

        {mode === 'adjust' && <StockAdjustSheet product={product} userId={userId} currency={currency} showCost={canSeeCost} onClose={() => setMode('view')} />}
        {mode === 'confirmDelete' && (
          <div className="rounded-xl border border-rust-600/30 bg-rust-50 p-4 space-y-3">
            <p className="text-sm">Delete <strong>{product.name}</strong>? This can't be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setMode('view')} className="btn-secondary flex-1">Cancel</button>
              <button onClick={doDelete} className="btn-primary flex-1 !bg-rust-600">Delete</button>
            </div>
          </div>
        )}

        {mode === 'view' && (canEdit || canAdjust || canDelete) && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {canEdit && <button onClick={() => setEditing(true)} className="btn-primary inline-flex items-center justify-center gap-1.5"><Pencil className="w-4 h-4" /> Edit</button>}
            {canAdjust && <button onClick={() => { setMessage(null); setMode('adjust'); }} className="btn-secondary inline-flex items-center justify-center gap-1.5"><PackagePlus className="w-4 h-4" /> Adjust stock</button>}
            {canEdit && (
              <button onClick={toggleActive} className="btn-secondary inline-flex items-center justify-center gap-1.5">
                {product.active ? <><EyeOff className="w-4 h-4" /> Hide</> : <><Eye className="w-4 h-4" /> Show</>}
              </button>
            )}
            {canDelete && <button onClick={() => { setMessage(null); setMode('confirmDelete'); }} className="btn-secondary inline-flex items-center justify-center gap-1.5 text-rust-600"><Trash2 className="w-4 h-4" /> Delete</button>}
          </div>
        )}
      </div>

      {editing && <EditProductModal product={product} onClose={() => setEditing(false)} />}
    </div>
  );
}

type MovementRow = { id: string; reason: string; quantityChange: number; resultingQuantity: number; createdAt: string; note?: string | null; quantityBefore?: number | null; userId?: string | null };

function MovementList({ title, rows, empty, people }: { title: string; rows: MovementRow[]; empty: string; people: Record<string, string> }) {
  const label = (r: string) => ADJUST_REASONS.find((x) => x.value === r)?.label ?? r;
  return (
    <section>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{title}</h2>
      {rows.length === 0 ? <p className="text-xs text-slate-500">{empty}</p> : (
        <ul className="divide-y divide-slate-100">
          {rows.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 py-2.5 text-xs">
              <div className="min-w-0">
                <div className="text-sm">{label(m.reason)}</div>
                <div className="text-slate-500 tnum">{new Date(m.createdAt).toLocaleString()}{m.userId && people[m.userId] ? ` · ${people[m.userId]}` : ''}</div>
                {m.note && <div className="text-slate-600 mt-0.5 break-words">“{m.note}”</div>}
              </div>
              <div className={`tnum text-sm text-right shrink-0 ${m.quantityChange >= 0 ? 'text-field-600' : 'text-rust-600'}`}>
                {m.quantityChange >= 0 ? '+' : ''}{m.quantityChange}
                <div className="text-[11px] text-slate-500">{m.quantityBefore != null ? `${m.quantityBefore} → ` : '→ '}{m.resultingQuantity}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
