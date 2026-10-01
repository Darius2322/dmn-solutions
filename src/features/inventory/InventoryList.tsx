import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductAvatar, ProductImagePicker } from '../../components/ProductAvatar';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, X, Search, ScanLine, PackageX, Loader2, ChevronRight, Sparkles, Tags, SlidersHorizontal, PackagePlus, Check } from 'lucide-react';
import { db, newRecordBase, enqueueSync } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { BarcodeScannerModal } from '../../components/scanner/BarcodeScannerModal';
import { lookupBarcodeDetailed, BarcodeLookupResult } from '../../lib/barcodeLookup';
import { createProduct } from '../../lib/products';
import { seedStarterProducts } from '../../lib/seedProducts';
import { recordAuditEvent } from '../../lib/audit';
import { profileHasPermission } from '../../lib/permissions';
import { StockAdjustSheet } from './StockAdjustSheet';
import type { Product } from '../../lib/types';

const FILTERS = ['all', 'low', 'out', 'healthy', 'expiring'] as const;
const FILTER_LABEL: Record<(typeof FILTERS)[number], string> = { all: 'All', low: 'Low stock', out: 'Out of stock', healthy: 'In stock', expiring: 'Expiring ≤30d' };
const SORTS = [
  { key: 'name', label: 'Name A–Z' }, { key: 'stock_low', label: 'Stock: low to high' }, { key: 'stock_high', label: 'Stock: high to low' },
  { key: 'value', label: 'Stock value' }, { key: 'price', label: 'Selling price' }, { key: 'recent', label: 'Recently updated' }
] as const;
type SortKey = (typeof SORTS)[number]['key'];
const DAY_MS = 86400000;
const isLow = (p: Product) => p.quantity > 0 && p.quantity <= p.minStock;
const isExpiring = (p: Product) => !!p.expiryDate && new Date(p.expiryDate).getTime() - Date.now() <= 30 * DAY_MS;

export function InventoryList() {
  const navigate = useNavigate();
  const { business, branches, activeBranchId, canViewAllBranches, refresh, syncingInitialData, profile } = useAuth();
  const currency = business?.currency ?? 'KES';
  const canSeeCost = profileHasPermission(profile, 'inventory.update') || profileHasPermission(profile, 'reports.financial');
  const viewingAll = activeBranchId === null && canViewAllBranches;
  const products = useLiveQuery(() => {
    if (!business) return [];
    if (viewingAll) return db.products.where('businessId').equals(business.id).toArray();
    if (!activeBranchId) return [];
    return db.products.where({ businessId: business.id, branchId: activeBranchId }).toArray();
  }, [business?.id, activeBranchId, viewingAll]) ?? [];
  const branchName = (branchId: string) => branches.find((b) => b.id === branchId)?.name ?? 'Unknown branch';

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const [showMore, setShowMore] = useState(false);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [newCat, setNewCat] = useState<string | null>(null);
  const [catError, setCatError] = useState<string | null>(null);
  const canAdjust = profileHasPermission(profile, 'inventory.adjust');
  const canCreate = profileHasPermission(profile, 'inventory.update');
  const { userId } = useAuth();
  const suppliers = useLiveQuery(() => (business ? db.suppliers.where('businessId').equals(business.id).toArray() : []), [business?.id]) ?? [];
  const [adding, setAdding] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const presetCategory = searchParams.get('category') ?? '';
  // Deep links: /inventory?add=1 (dashboard shortcut) and /inventory?add=1&category=<id> (from a category page).
  useEffect(() => {
    if (searchParams.get('add') === '1') { setAdding(true); const n = new URLSearchParams(searchParams); n.delete('add'); setSearchParams(n, { replace: true }); }
  }, [searchParams]);
  const [showScanner, setShowScanner] = useState(false);
  const [lookupNote, setLookupNote] = useState<string | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupResult, setLookupResult] = useState<BarcodeLookupResult | null>(null);
  const [seeding, setSeeding] = useState(false);

  async function handleSeed() {
    if (!business || !activeBranchId) return;
    setSeeding(true);
    try {
      const added = await seedStarterProducts(business.id, activeBranchId);
      alert(added > 0 ? `Added ${added} starter products.` : 'Starter products are already in your inventory.');
    } finally { setSeeding(false); }
  }

  async function handleScannedCode(code: string) {
    setShowScanner(false);
    const trimmed = code.trim();
    const match = products.find((p) => p.barcode && p.barcode === trimmed);
    if (match) {
      navigate(`/inventory/${match.id}`);
      return;
    }
    setLookupBusy(true);
    const outcome = await lookupBarcodeDetailed(trimmed, business?.id);
    setLookupBusy(false);
    setLookupNote(outcome.status === 'offline' ? 'Product information unavailable offline. The barcode is kept — enter the details manually.'
      : outcome.status === 'unavailable' ? 'Could not reach the product database. The barcode is kept — enter the details manually.' : null);
    if (outcome.status === 'found') {
      // A real match (cache or provider) — go straight to a pre-filled Add product form.
      setLookupResult(outcome.result);
      setNotFoundBarcode(trimmed);
      setAdding(true);
    } else {
      setLookupResult(null);
      setNotFoundBarcode(trimmed);
    }
  }

  const categories = useLiveQuery(
    () => (business ? db.categories.where({ businessId: business.id, archived: false as any }).toArray() : []),
    [business?.id]
  ) ?? [];

  const filtered = useMemo(() => {
    let list = products;
    if (filter === 'low') list = list.filter(isLow);
    if (filter === 'out') list = list.filter((p) => p.quantity <= 0);
    if (filter === 'healthy') list = list.filter((p) => p.quantity > p.minStock);
    if (filter === 'expiring') list = list.filter(isExpiring);
    if (categoryFilter !== 'all') list = list.filter((p) => (categoryFilter === 'none' ? !p.categoryId : p.categoryId === categoryFilter));
    if (supplierFilter !== 'all') list = list.filter((p) => (supplierFilter === 'none' ? !p.supplierId : p.supplierId === supplierFilter));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode?.includes(q) || p.brand?.toLowerCase().includes(q));
    const by: Record<SortKey, (a: Product, b: Product) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      stock_low: (a, b) => a.quantity - b.quantity,
      stock_high: (a, b) => b.quantity - a.quantity,
      value: (a, b) => b.buyingPrice * b.quantity - a.buyingPrice * a.quantity,
      price: (a, b) => b.sellingPrice - a.sellingPrice,
      recent: (a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
    };
    return [...list].sort(by[sort]);
  }, [products, filter, categoryFilter, supplierFilter, query, sort]);

  const catCounts = useMemo(() => {
    const m = new Map<string, number>(); let none = 0;
    for (const p of products) { if (p.categoryId) m.set(p.categoryId, (m.get(p.categoryId) ?? 0) + 1); else none++; }
    return { m, none };
  }, [products]);

  async function addCategory() {
    const name = (newCat ?? '').trim();
    if (!business) return;
    if (!name) { setCatError('Enter a category name.'); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) { setCatError('That category already exists.'); return; }
    const rec = { ...newRecordBase(), businessId: business.id, name, archived: false } as any;
    await db.categories.add(rec);
    await enqueueSync('categories', rec.id, 'create');
    setCategoryFilter(rec.id); setNewCat(null); setCatError(null);
  }

  // The mini-dashboard reflects the category filter (a deliberate "which
  // slice of inventory am I looking at" choice) but not the quick status
  // toggles or search text, so it stays a stable summary rather than
  // flickering with every keystroke.
  const dashboardProducts = useMemo(
    () => (categoryFilter === 'all' ? products : products.filter((p) => (categoryFilter === 'none' ? !p.categoryId : p.categoryId === categoryFilter))),
    [products, categoryFilter]
  );
  const dashboardLowStock = dashboardProducts.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length;
  const dashboardOutOfStock = dashboardProducts.filter((p) => p.quantity <= 0).length;
  const dashboardValue = useMemo(() => Math.round(dashboardProducts.reduce((s, p) => s + p.buyingPrice * p.quantity, 0) * 100) / 100, [dashboardProducts]);
  const dashboardUnits = dashboardProducts.reduce((s, p) => s + Math.max(p.quantity, 0), 0);
  const retailValue = Math.round(dashboardProducts.reduce((s, p) => s + p.sellingPrice * Math.max(p.quantity, 0), 0));
  const potentialProfit = retailValue - Math.round(dashboardProducts.reduce((s, p) => s + p.buyingPrice * Math.max(p.quantity, 0), 0));
  const dashboardExpiring = dashboardProducts.filter(isExpiring).length;
  const dashboardUncategorised = dashboardProducts.filter((p) => !p.categoryId).length;
  const healthyCount = Math.max(dashboardProducts.length - dashboardLowStock - dashboardOutOfStock, 0);
  const topValueCategories = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) { const k = p.categoryId ?? 'none'; m.set(k, (m.get(k) ?? 0) + p.buyingPrice * Math.max(p.quantity, 0)); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => ({ name: k === 'none' ? 'Uncategorised' : categories.find((c) => c.id === k)?.name ?? 'Unknown', value: v }));
  }, [products, categories]);

  if (!activeBranchId && !viewingAll) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        {branches.length === 0 ? (
          <>
            <p className="text-sm font-medium mb-1">No branch found yet</p>
            <p className="text-sm text-slate-500 mb-4">
              {syncingInitialData ? 'Syncing your business data…' : "This can happen if your account hasn't finished syncing."}
            </p>
            <button onClick={() => refresh()} className="btn-secondary text-sm">Refresh</button>
          </>
        ) : (
          <>
            <p className="text-sm font-medium mb-1">No branch selected</p>
            <p className="text-sm text-slate-500">Tap the branch name in the header to choose one.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-slate-500" aria-live="polite">
            <span className="font-medium text-ink tnum">{products.length}</span> product{products.length === 1 ? '' : 's'}
            {filtered.length !== products.length && <> · <span className="tnum">{filtered.length}</span> shown</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!viewingAll && (
            <>
              {products.length === 0 && (
                <button onClick={handleSeed} disabled={seeding} className="btn-secondary flex items-center gap-1.5 text-sm" aria-label="Seed starter products">
                  <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">{seeding ? 'Adding…' : 'Seed starter products'}</span>
                </button>
              )}
              <button onClick={() => setShowScanner(true)} className="btn-secondary flex items-center gap-1.5 text-sm" aria-label="Scan barcode">
                <ScanLine className="w-4 h-4" /> <span className="hidden sm:inline">Scan</span>
              </button>
              <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-1.5 text-sm">
                <Plus className="w-4 h-4" /> Add product
              </button>
            </>
          )}
        </div>
      </div>

      {products.length > 0 && (
        <section aria-label="Inventory summary" className="mb-4 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Products" value={dashboardProducts.length} onClick={() => setFilter('all')} />
            <Stat label="Low stock" value={dashboardLowStock} tone="amber" onClick={() => setFilter('low')} />
            <Stat label="Out of stock" value={dashboardOutOfStock} tone="rust" onClick={() => setFilter('out')} />
            <Stat label="Units in stock" value={dashboardUnits.toLocaleString()} />
            {canSeeCost && <Stat label="Stock value (cost)" value={`${currency} ${dashboardValue.toLocaleString()}`} />}
            {canSeeCost && <Stat label="Stock value (retail)" value={`${currency} ${retailValue.toLocaleString()}`} />}
            {canSeeCost && <Stat label="Potential profit" value={`${currency} ${potentialProfit.toLocaleString()}`} tone={potentialProfit < 0 ? 'rust' : undefined} hint="Retail minus cost, if all stock sells" />}
            <Stat label="Expiring ≤30 days" value={dashboardExpiring} tone={dashboardExpiring ? 'amber' : undefined} onClick={() => setFilter('expiring')} />
          </div>
          <div className="card p-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5"><span>Stock health</span><span className="tnum">{healthyCount} healthy · {dashboardLowStock} low · {dashboardOutOfStock} out</span></div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100" role="img" aria-label={`${healthyCount} healthy, ${dashboardLowStock} low, ${dashboardOutOfStock} out of stock`}>
              <div className="bg-field-500" style={{ width: `${(healthyCount / Math.max(dashboardProducts.length, 1)) * 100}%` }} />
              <div className="bg-amber-500" style={{ width: `${(dashboardLowStock / Math.max(dashboardProducts.length, 1)) * 100}%` }} />
              <div className="bg-rust-500" style={{ width: `${(dashboardOutOfStock / Math.max(dashboardProducts.length, 1)) * 100}%` }} />
            </div>
            {canSeeCost && topValueCategories.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">Most stock value: {topValueCategories.map((c) => `${c.name} (${currency} ${Math.round(c.value).toLocaleString()})`).join(' · ')}</p>
            )}
            {dashboardUncategorised > 0 && <p className="text-xs text-slate-500 mt-1">{dashboardUncategorised} product{dashboardUncategorised === 1 ? ' has' : 's have'} no category.</p>}
          </div>
        </section>
      )}

      {viewingAll && (
        <p className="text-xs text-slate-500 -mt-2 mb-3">Viewing all branches · select a specific branch to add or scan products.</p>
      )}

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input className="input pl-9" placeholder="Search name, SKU, barcode or brand…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {/* Category menu: one tap to focus on a category, with live counts and inline "new category". */}
      <nav aria-label="Categories" className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        <CatChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All <span className="tnum opacity-70">{products.length}</span></CatChip>
        {categories.map((c) => (
          <CatChip key={c.id} active={categoryFilter === c.id} onClick={() => setCategoryFilter(c.id)}>{c.name} <span className="tnum opacity-70">{catCounts.m.get(c.id) ?? 0}</span></CatChip>
        ))}
        {catCounts.none > 0 && <CatChip active={categoryFilter === 'none'} onClick={() => setCategoryFilter('none')}>Uncategorised <span className="tnum opacity-70">{catCounts.none}</span></CatChip>}
        {canCreate && newCat === null && (
          <button onClick={() => { setNewCat(''); setCatError(null); }} className="shrink-0 text-xs font-medium px-3 min-h-[36px] rounded-full text-field-700 bg-field-50 hover:bg-field-100 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> New category</button>
        )}
        <button onClick={() => navigate('/categories')} className="shrink-0 text-xs font-medium px-3 min-h-[36px] rounded-full text-slate-500 hover:bg-slate-100 flex items-center gap-1"><Tags className="w-3.5 h-3.5" /> Manage</button>
      </nav>
      {newCat !== null && (
        <div className="flex gap-2 mb-3">
          <input className="input flex-1" autoFocus placeholder="Category name" value={newCat} maxLength={40} onChange={(e) => { setNewCat(e.target.value); setCatError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') void addCategory(); if (e.key === 'Escape') setNewCat(null); }} />
          <button onClick={addCategory} className="btn-primary min-h-[44px] px-4 flex items-center gap-1"><Check className="w-4 h-4" /> Add</button>
          <button onClick={() => { setNewCat(null); setCatError(null); }} className="btn-secondary min-h-[44px] px-3" aria-label="Cancel"><X className="w-4 h-4" /></button>
        </div>
      )}
      {catError && <p role="alert" className="text-xs text-rust-600 -mt-2 mb-3">{catError}</p>}

      {categoryFilter !== 'all' && categoryFilter !== 'none' && canCreate && (
        <div className="flex items-center justify-between gap-2 rounded-card bg-slate-50 px-3 py-2 mb-3">
          <span className="text-xs text-slate-600 min-w-0 truncate">Category: <b>{categories.find((c) => c.id === categoryFilter)?.name}</b></span>
          <span className="flex gap-1.5 shrink-0">
            <button onClick={() => setAdding(true)} className="text-xs font-medium px-3 min-h-[36px] rounded-full bg-field-600 text-white">New product</button>
            <button onClick={() => navigate(`/categories/${categoryFilter}`)} className="text-xs font-medium px-3 min-h-[36px] rounded-full bg-paper-raised border border-slate-200 hover:bg-slate-50">Add existing</button>
          </span>
        </div>
      )}
      <div className="flex gap-1.5 mb-3 flex-wrap items-center">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={`text-xs font-medium px-3 min-h-[36px] rounded-full ${filter === f ? 'bg-field-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{FILTER_LABEL[f]}</button>
        ))}
        <button onClick={() => setShowMore((v) => !v)} aria-expanded={showMore} className="text-xs font-medium px-3 min-h-[36px] rounded-full text-slate-600 hover:bg-slate-100 flex items-center gap-1 ml-auto"><SlidersHorizontal className="w-3.5 h-3.5" /> Sort &amp; filter</button>
        {(filter !== 'all' || categoryFilter !== 'all' || supplierFilter !== 'all' || sort !== 'name' || query) && (
          <button onClick={() => { setFilter('all'); setCategoryFilter('all'); setSupplierFilter('all'); setSort('name'); setQuery(''); }} className="text-xs font-medium px-3 min-h-[36px] rounded-full text-slate-500 hover:bg-slate-100">Reset</button>
        )}
      </div>
      {showMore && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <label className="text-xs text-slate-500">Sort by
            <select className="input mt-1" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>{SORTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select>
          </label>
          <label className="text-xs text-slate-500">Supplier
            <select className="input mt-1" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
              <option value="all">All suppliers</option><option value="none">No supplier</option>
              {suppliers.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </label>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Product</th>
              <th className="text-right font-medium px-4 py-2.5">Stock</th>
              <th className="text-right font-medium px-4 py-2.5 hidden sm:table-cell">Price</th>
              <th className="px-2 py-2.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} onClick={() => navigate(`/inventory/${p.id}`)} className="cursor-pointer hover:bg-slate-50 active:bg-slate-100">
                <td className="px-4 py-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(`/inventory/${p.id}`); }}
                    className="block w-full text-left rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-field-600"
                    aria-label={`View details for ${p.name}`}
                  >
                    <span className="flex items-center gap-3">
                      <ProductAvatar name={p.name} src={p.imageUrl} size={40} />
                      <span className="min-w-0">
                        <span className="block font-medium truncate max-w-[170px] sm:max-w-[300px]">{p.name}</span>
                        <span className="block text-xs text-slate-500 truncate max-w-[170px] sm:max-w-[300px]">
                          {p.sku ?? '—'}{p.barcode ? ` · ${p.barcode}` : ''}{viewingAll ? ` · ${branchName(p.branchId)}` : ''}
                        </span>
                      </span>
                    </span>
                  </button>
                </td>
                <td className={`px-4 py-3.5 text-right tnum whitespace-nowrap ${p.quantity <= 0 ? 'text-rust-600' : p.quantity <= p.minStock ? 'text-amber-600' : ''}`}>
                  {p.quantity} {p.unit}
                </td>
                <td className="px-4 py-3.5 text-right tnum hidden sm:table-cell whitespace-nowrap">{currency} {p.sellingPrice.toLocaleString()}</td>
                <td className="pr-3 py-3.5 text-right whitespace-nowrap">
                  {canAdjust && !viewingAll && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setAdjusting(p); }} aria-label={`Adjust stock for ${p.name}`} className="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-field-700 mr-1"><PackagePlus className="w-4 h-4" /></button>
                  )}
                  <ChevronRight className="w-4 h-4 inline text-slate-300" aria-hidden="true" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-sm text-slate-500 py-10">
                {products.length === 0
                  ? (viewingAll
                      ? 'No products yet.'
                      : <>No products yet.<br /><button onClick={() => setAdding(true)} className="text-field-600 font-medium mt-1">Add your first product</button></>)
                  : 'No products match this search or filter.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {adding && business && activeBranchId && (
        <AddProductModal
          businessId={business.id}
          branchId={activeBranchId}
          initialBarcode={notFoundBarcode ?? undefined}
          initialLookup={lookupResult ?? undefined}
          presetCategoryId={presetCategory || (categoryFilter !== 'all' && categoryFilter !== 'none' ? categoryFilter : undefined)}
          onClose={() => { setAdding(false); setNotFoundBarcode(null); setLookupResult(null); }}
        />
      )}

      {adjusting && (
        <StockAdjustSheet product={adjusting} userId={userId} currency={currency} showCost={canSeeCost} onClose={() => setAdjusting(null)} />
      )}

      {showScanner && (
        <BarcodeScannerModal title="Scan product barcode" onDetected={handleScannedCode} onClose={() => setShowScanner(false)} />
      )}

      {lookupBusy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-ink/40" />
          <div className="relative bg-paper-raised rounded-2xl p-6 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-field-600" />
            <p className="text-sm text-slate-500">Looking up product…</p>
          </div>
        </div>
      )}

      {notFoundBarcode && !adding && !lookupBusy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setNotFoundBarcode(null)} />
          <div className="relative w-full max-w-sm bg-paper-raised rounded-2xl p-5 text-center shadow-xl">
            <PackageX className="w-9 h-9 text-slate-400 mx-auto mb-2" />
            <p className="font-medium mb-1">{lookupNote ? 'Product information unavailable' : 'Product not found'}</p>
            <p className="text-sm text-slate-500 mb-1 tnum">Barcode {notFoundBarcode}</p>
            <p className="text-xs text-slate-400 mb-4">{lookupNote ?? "Not in this shop's inventory or the product database — you can still add it manually."}</p>
            <div className="flex gap-2">
              <button onClick={() => setNotFoundBarcode(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => setAdding(true)} className="btn-primary flex-1">Create product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddProductModal({ businessId, branchId, initialBarcode, initialLookup, presetCategoryId, onClose }: { businessId: string; branchId: string; initialBarcode?: string; initialLookup?: BarcodeLookupResult; presetCategoryId?: string; onClose: () => void }) {
  const { userId } = useAuth();
  const categories = useLiveQuery(
    () => db.categories.where({ businessId, archived: false as any }).toArray(),
    [businessId]
  ) ?? [];
  const [name, setName] = useState(initialLookup?.name ?? '');
  const [brand, setBrand] = useState(initialLookup?.brand ?? '');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState(initialBarcode ?? '');
  const [categoryId, setCategoryId] = useState(presetCategoryId ?? '');
  const [image, setImage] = useState<string | null>(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [unit, setUnit] = useState(initialLookup?.unit ?? 'piece');
  const [saving, setSaving] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [lookupState, setLookupState] = useState<string | null>(null);
  const [filledFrom, setFilledFrom] = useState<BarcodeLookupResult | null>(initialLookup ?? null);
  // Fields the person has typed into themselves: a later lookup must never overwrite these.
  const dirty = useRef<Set<string>>(new Set());
  const lastLooked = useRef<string | null>(initialLookup ? (initialBarcode ?? null) : null);
  const touch = (field: string) => dirty.current.add(field);

  // Matches a looked-up category name against this business's own categories (never creates one).
  function matchCategory(cat?: string): string {
    if (!cat) return '';
    const c = cat.toLowerCase();
    return categories.find((k) => c.includes(k.name.toLowerCase()) || k.name.toLowerCase().includes(c))?.id ?? '';
  }

  function applyLookup(r: BarcodeLookupResult) {
    if (!dirty.current.has('name')) setName(r.name);
    if (!dirty.current.has('brand') && r.brand) setBrand(r.brand);
    if (!dirty.current.has('unit') && r.unit) setUnit(r.unit);
    if (!dirty.current.has('category')) { const id = matchCategory(r.category); if (id) setCategoryId(id); }
    setFilledFrom(r);
  }

  // Scan/type a barcode inside the form -> local check, cache, then provider. Offline-safe.
  useEffect(() => {
    const code = barcode.trim();
    if (code.length < 8 || code === lastLooked.current) return;
    const t = setTimeout(async () => {
      lastLooked.current = code;
      setLookupState('Looking up product…');
      const out = await lookupBarcodeDetailed(code, businessId);
      if (out.status === 'found') { applyLookup(out.result); setLookupState(null); }
      else if (out.status === 'exists') setLookupState(`This barcode is already in your inventory as “${out.productName}”.`);
      else if (out.status === 'offline') setLookupState('Product information unavailable offline. The barcode is kept — enter the details below.');
      else if (out.status === 'unavailable') setLookupState('Could not reach the product database. Enter the details below.');
      else setLookupState('No product information found for this barcode. Enter the details below.');
    }, 500);
    return () => clearTimeout(t);
  }, [barcode]);

  async function submit() {
    if (!name.trim() || !sellingPrice) return;
    setSaving(true);
    try {
      await createProduct({
        businessId, branchId,
        categoryId: categoryId || null,
        name: name.trim(), sku: sku || null, barcode: barcode.trim() || null, brand: brand.trim() || null,
        unit,
        buyingPrice: parseFloat(buyingPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        quantity: parseFloat(quantity) || 0,
        minStock: parseFloat(minStock) || 0,
        imageUrl: image
      });
      await recordAuditEvent({ businessId, branchId, userId, action: 'product_created', entityType: 'product', newValue: JSON.stringify({ name: name.trim(), sellingPrice: parseFloat(sellingPrice) || 0 }) });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-paper-raised rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">Add product</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {filledFrom && (
          <p className="text-xs text-field-600 bg-field-600/10 rounded-card px-3 py-2">
            Auto-filled from barcode{filledFrom.brand ? ` · ${filledFrom.brand}` : ''}{filledFrom.size ? ` · ${filledFrom.size}` : ''}{filledFrom.source === 'cache' ? ' (saved on this device)' : ''} — check the details before saving.
          </p>
        )}
        {lookupState && <p className="text-xs text-slate-500 bg-slate-100 rounded-card px-3 py-2">{lookupState}</p>}
        <ProductImagePicker name={name} value={image} onChange={setImage} />
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Name</span><input className="input" value={name} onChange={(e) => { touch('name'); setName(e.target.value); }} autoFocus /></label>
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Brand</span><input className="input" value={brand} onChange={(e) => { touch('brand'); setBrand(e.target.value); }} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">SKU</span><input className="input" value={sku} onChange={(e) => setSku(e.target.value)} /></label>
          <div className="block">
            <span className="block text-sm font-medium text-slate-600 mb-1.5">Barcode</span>
            <div className="flex gap-1.5">
              <input className="input tnum min-w-0" inputMode="numeric" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
              <button type="button" onClick={() => setShowScan(true)} aria-label="Scan barcode" className="btn-secondary !px-3 shrink-0"><ScanLine className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Category</span>
          <select className="input" value={categoryId} onChange={(e) => { touch('category'); setCategoryId(e.target.value); }}>
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Selling price</span><input className="input tnum" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Buying price</span><input className="input tnum" type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Quantity</span><input className="input tnum" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Min stock</span><input className="input tnum" type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} /></label>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Unit</span>
          <select className="input" value={unit} onChange={(e) => { touch('unit'); setUnit(e.target.value); }}>
            {['piece', 'box', 'carton', 'pack', 'dozen', 'bottle', 'kg', 'g', 'litre', 'ml', 'metre', 'set'].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <button onClick={submit} disabled={saving || !name.trim() || !sellingPrice} className="btn-primary w-full">{saving ? 'Saving…' : 'Add product'}</button>
      </div>
      {showScan && <BarcodeScannerModal title="Scan product barcode" onDetected={(c) => { setShowScan(false); setBarcode(c.trim()); }} onClose={() => setShowScan(false)} />}
    </div>
  );
}

export function EditProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { userId } = useAuth();
  const categories = useLiveQuery(
    () => db.categories.where({ businessId: product.businessId, archived: false as any }).toArray(),
    [product.businessId]
  ) ?? [];
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku ?? '');
  const [barcode, setBarcode] = useState(product.barcode ?? '');
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '');
  const [sellingPrice, setSellingPrice] = useState(String(product.sellingPrice));
  const [buyingPrice, setBuyingPrice] = useState(String(product.buyingPrice));
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [minStock, setMinStock] = useState(String(product.minStock));
  const [unit, setUnit] = useState(product.unit);
  const [active, setActive] = useState(product.active);
  const [image, setImage] = useState<string | null>(product.imageUrl ?? null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim() || !sellingPrice) return;
    setSaving(true);
    try {
      const updates = {
        name: name.trim(), sku: sku || null, barcode: barcode.trim() || null,
        categoryId: categoryId || null,
        sellingPrice: parseFloat(sellingPrice) || 0,
        buyingPrice: parseFloat(buyingPrice) || 0,
        quantity: parseFloat(quantity) || 0,
        minStock: parseFloat(minStock) || 0,
        reorderLevel: parseFloat(minStock) || 0,
        unit, active, imageUrl: image,
        updatedAt: new Date().toISOString()
      };
      await db.products.update(product.id, updates);
      await enqueueSync('products', product.id, 'update');
      await recordAuditEvent({
        businessId: product.businessId, branchId: product.branchId, userId, action: 'product_updated', entityType: 'product', entityId: product.id,
        previousValue: JSON.stringify({ name: product.name, sellingPrice: product.sellingPrice, quantity: product.quantity, active: product.active }),
        newValue: JSON.stringify({ name: updates.name, sellingPrice: updates.sellingPrice, quantity: updates.quantity, active: updates.active })
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-paper-raised rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">Edit product</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <ProductImagePicker name={name} value={image} onChange={setImage} />
        <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">SKU</span><input className="input" value={sku} onChange={(e) => setSku(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Barcode</span><input className="input tnum" value={barcode} onChange={(e) => setBarcode(e.target.value)} /></label>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Category</span>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Selling price</span><input className="input tnum" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Buying price</span><input className="input tnum" type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Quantity</span><input className="input tnum" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
          <label className="block"><span className="block text-sm font-medium text-slate-600 mb-1.5">Min stock</span><input className="input tnum" type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} /></label>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1.5">Unit</span>
          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {['piece', 'box', 'carton', 'pack', 'dozen', 'bottle', 'kg', 'g', 'litre', 'ml', 'metre', 'set'].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active (visible in POS)
        </label>

        <button onClick={submit} disabled={saving || !name.trim() || !sellingPrice} className="btn-primary w-full">{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  );
}


function Stat({ label, value, tone, onClick, hint }: { label: string; value: string | number; tone?: 'amber' | 'rust'; onClick?: () => void; hint?: string }) {
  const color = tone === 'amber' ? 'text-amber-600' : tone === 'rust' ? 'text-rust-600' : '';
  const inner = (<><div className={`tnum font-semibold text-lg leading-tight break-words ${color}`}>{value}</div><div className="text-[11px] text-slate-500">{label}</div>{hint && <div className="sr-only">{hint}</div>}</>);
  return onClick
    ? <button onClick={onClick} title={hint} className="card p-2.5 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors">{inner}</button>
    : <div className="card p-2.5" title={hint}>{inner}</div>;
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} aria-pressed={active} className={`shrink-0 text-xs font-medium px-3 min-h-[36px] rounded-full border flex items-center gap-1.5 ${active ? 'bg-field-600 text-white border-field-600' : 'bg-paper-raised border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{children}</button>;
}
