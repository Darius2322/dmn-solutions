import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, X, Package, Users, Receipt, FileText, Wallet, CornerDownLeft, LayoutGrid } from 'lucide-react';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';

type Hit = { key: string; group: string; title: string; sub?: string; to: string; icon: typeof Package };

/** Pages people can jump to by name. Only pages the signed-in user may open are shown (the caller filters). */
export interface SearchPage { to: string; label: string }

/** Universal search in the top bar: products (name, SKU, barcode, brand), customers (name, phone), sales (receipt
 * number), quotations, invoices, debts and app pages. Searches the on-device database, so it is instant, works
 * offline, and can only ever return the signed-in business's own records. Opens with the search button or Ctrl/⌘+K. */
export function UniversalSearch({ pages }: { pages: SearchPage[] }) {
  const navigate = useNavigate();
  const { business } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  // Live: when the underlying data changes (a sale syncs in, stock changes) the open results refresh by themselves.
  const tick = useLiveQuery(async () => (business ? (await db.products.where('businessId').equals(business.id).count()) + (await db.sales.where('businessId').equals(business.id).count()) + (await db.customers.where('businessId').equals(business.id).count()) : 0), [business?.id]) ?? 0;
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 30); document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; setQ(''); setHits([]); } return () => { document.body.style.overflow = ''; }; }, [open]);

  const pageHits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return pages.filter((p) => p.label.toLowerCase().includes(s)).slice(0, 4).map((p) => ({ key: `p:${p.to}`, group: 'Go to', title: p.label, to: p.to, icon: LayoutGrid }));
  }, [q, pages]);

  useEffect(() => {
    const s = q.trim().toLowerCase();
    if (!business || s.length < 1) { setHits([]); setBusy(false); return; }
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      const bid = business.id;
      const has = (v?: string | null) => !!v && v.toLowerCase().includes(s);
      const [products, customers, sales, quotes, invoices, debts] = await Promise.all([
        db.products.where('businessId').equals(bid).filter((p: any) => has(p.name) || has(p.sku) || has(p.barcode) || has(p.brand)).limit(6).toArray(),
        db.customers.where('businessId').equals(bid).filter((c: any) => has(c.name) || has(c.phone)).limit(6).toArray(),
        db.sales.where('businessId').equals(bid).filter((x: any) => has(x.receiptNumber)).limit(5).toArray(),
        (db as any).quotations ? (db as any).quotations.where('businessId').equals(bid).filter((x: any) => has(x.quotationNumber)).limit(5).toArray() : [],
        (db as any).invoices ? (db as any).invoices.where('businessId').equals(bid).filter((x: any) => has(x.invoiceNumber)).limit(5).toArray() : [],
        (db as any).debts ? (db as any).debts.where('businessId').equals(bid).filter((d: any) => has(d.debtorName)).limit(4).toArray() : []
      ]);
      if (cancelled) return;
      const out: Hit[] = [
        ...products.map((p: any) => ({ key: `prod:${p.id}`, group: 'Products', title: p.name, sub: [p.brand, p.sku, `${p.quantity} in stock`].filter(Boolean).join(' · '), to: `/inventory/${p.id}`, icon: Package })),
        ...customers.map((c: any) => ({ key: `cus:${c.id}`, group: 'Customers', title: c.name, sub: c.phone ?? undefined, to: `/customers/${c.id}`, icon: Users })),
        ...sales.map((x: any) => ({ key: `sal:${x.id}`, group: 'Sales', title: x.receiptNumber, sub: `${business.currency} ${Number(x.total).toLocaleString()} · ${new Date(x.createdAt).toLocaleDateString()}`, to: `/sales/${x.id}`, icon: Receipt })),
        ...quotes.map((x: any) => ({ key: `quo:${x.id}`, group: 'Quotations', title: x.quotationNumber, sub: x.status, to: `/quotations/${x.id}`, icon: FileText })),
        ...invoices.map((x: any) => ({ key: `inv:${x.id}`, group: 'Invoices', title: x.invoiceNumber, sub: x.status, to: `/invoices/${x.id}`, icon: FileText })),
        ...debts.map((d: any) => ({ key: `debt:${d.id}`, group: 'Debts', title: d.debtorName ?? 'Debt', sub: `${business.currency} ${Number(d.remainingAmount).toLocaleString()} owed`, to: `/debts/${d.id}`, icon: Wallet }))
      ];
      setHits(out); setBusy(false); setActive(0);
    }, 0);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, business?.id, tick]);

  const all = useMemo(() => [...pageHits, ...hits], [pageHits, hits]);
  function go(h: Hit) { setOpen(false); navigate(h.to); }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, all.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && all[active]) go(all[active]);
  }

  let lastGroup = '';
  return (
    <>
      {/* desktop: looks like a search field; phone: icon button */}
      <button onClick={() => setOpen(true)} aria-label="Search" className="hidden md:flex items-center gap-2 h-9 w-64 lg:w-80 px-3 rounded-full bg-slate-100 text-sm text-slate-500 hover:bg-slate-200">
        <Search className="w-4 h-4" /> <span className="flex-1 text-left truncate">Search products, customers, sales…</span><kbd className="text-[10px] px-1.5 py-0.5 rounded bg-paper-raised border border-slate-200">Ctrl K</kbd>
      </button>
      <button onClick={() => setOpen(true)} aria-label="Search" className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-100"><Search className="w-5 h-5 text-slate-600" /></button>

      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col md:items-center md:pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="relative bg-paper w-full md:max-w-xl md:rounded-2xl md:shadow-xl flex flex-col h-full md:h-auto md:max-h-[70vh] overflow-hidden">
            <div className="flex items-center gap-2 px-3 border-b border-slate-200 pt-[env(safe-area-inset-top)]">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown} placeholder="Search products, customers, receipts, invoices…" className="flex-1 min-w-0 h-14 bg-transparent outline-none text-base" enterKeyHint="search" autoComplete="off" />
              <button onClick={() => setOpen(false)} aria-label="Close search" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-2">
              {q.trim().length < 1 && <p className="text-sm text-slate-500 px-3 py-6 text-center">Start typing. Results appear as you type, and search works offline too.</p>}
              {q.trim().length >= 1 && all.length === 0 && !busy && <p className="text-sm text-slate-500 px-3 py-6 text-center">No matches for “{q.trim()}”.</p>}
              {all.map((h, i) => {
                const header = h.group !== lastGroup ? (lastGroup = h.group) : null;
                return (
                  <div key={h.key}>
                    {header && <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{header}</div>}
                    <button onClick={() => go(h)} onMouseEnter={() => setActive(i)} className={`w-full flex items-center gap-3 px-3 min-h-[52px] rounded-card text-left ${i === active ? 'bg-slate-100' : 'hover:bg-slate-50'} active:bg-slate-100`}>
                      <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><h.icon className="w-4.5 h-4.5 text-slate-600" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-sm font-medium truncate">{h.title}</span>{h.sub && <span className="block text-xs text-slate-500 truncate">{h.sub}</span>}</span>
                      {i === active && <CornerDownLeft className="w-4 h-4 text-slate-400 hidden md:block" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
