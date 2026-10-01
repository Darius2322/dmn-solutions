import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Printer, Image as ImageIcon, Loader2, X, Phone, MessageCircle, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DocumentView } from '../../components/DocumentView';
import { publicToDoc } from '../../lib/documentData';
import { sharePicture } from '../../lib/documentShare';
import { SHOPOS_FALLBACK, telHref, waHref, type ShoposContact } from '../../lib/brand';
import type { DocData } from '../../lib/documentTemplates';

/** Customer-facing page for a shared receipt (/r/<token>), quotation or invoice (/d/<token>). No account needed.
 * The token is checked on the server (it expires, can be switched off, and can't be guessed); nothing here can reach
 * any other record. The page asks search engines not to index it and sends no referrer. */
export function PublicDocument() {
  const { pathname } = useLocation();
  const isReceipt = pathname.startsWith('/r/');
  const token = pathname.replace(/^\/[rd]\//, '').replace(/\/.*$/, '');
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'offline'>('loading');
  const [doc, setDoc] = useState<DocData | null>(null);
  const [template, setTemplate] = useState('classic');
  const [accent, setAccent] = useState<string | null>(null);
  const [brand, setBrand] = useState<ShoposContact>(SHOPOS_FALLBACK);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const add = (name: string, content: string) => { const m = document.createElement('meta'); m.name = name; m.content = content; document.head.appendChild(m); return m; };
    const a = add('robots', 'noindex,nofollow,noarchive'); const b = add('referrer', 'no-referrer');
    return () => { a.remove(); b.remove(); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) { setState('offline'); return; }
      const { data, error } = isReceipt ? await supabase.rpc('get_public_receipt', { p_token: token }) : await supabase.rpc('get_public_document_full', { p_token: token });
      if (cancelled) return;
      if (error || !data) { setState(!navigator.onLine || /fetch|network/i.test(error?.message ?? '') ? 'offline' : 'missing'); return; }
      const d = data as any;
      setDoc(publicToDoc(d, d.currency ?? 'KES'));
      setTemplate(d.template ?? 'classic'); setAccent(d.accent ?? null);
      if (d.shopos) setBrand({ ...SHOPOS_FALLBACK, ...d.shopos });
      document.title = `${d.businessName} · ${d.number ?? d.receiptNumber}`;
      setState('ready');
    })();
    return () => { cancelled = true; };
  }, [token, isReceipt]);

  function close() {
    // Opened from a chat app: go back if there is somewhere to go back to, otherwise try to close the tab, otherwise
    // land on the ShopOS home page so the person is never stuck on a dead end.
    if (window.history.length > 1) { window.history.back(); setTimeout(() => { if (document.visibilityState === 'visible') window.location.href = '/'; }, 400); return; }
    window.close();
    setTimeout(() => { window.location.href = '/'; }, 200);
  }
  async function picture() {
    if (!ref.current || !doc) return;
    setBusy(true);
    try { await sharePicture(ref.current, `${doc.business.name.replace(/\s+/g, '-')}-${doc.number}`, doc.number); } finally { setBusy(false); }
  }

  if (state === 'loading') return <div className="min-h-screen flex items-center justify-center bg-paper text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…</div>;
  if (state !== 'ready' || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-6 text-center">
        <p className="font-medium mb-1">{state === 'offline' ? "You're offline" : 'This link is not available'}</p>
        <p className="text-sm text-slate-500 max-w-xs">{state === 'offline' ? 'Connect to the internet and open the link again.' : 'It may have expired or been turned off by the business. Ask them to send it again.'}</p>
        <button onClick={close} className="btn-secondary mt-5 min-h-[46px] px-6">Close</button>
      </div>
    );
  }
  const shopPhone = doc.business.phone;
  const btn = 'min-h-[48px] rounded-card border border-slate-200 bg-paper-raised text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 active:bg-slate-100';
  return (
    <div className="min-h-screen bg-slate-50 pb-[calc(1.5rem+env(safe-area-inset-bottom))] print:bg-white print:p-0">
      <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-slate-200 px-3 pt-[env(safe-area-inset-top)] print:hidden">
        <div className="max-w-xl mx-auto h-12 flex items-center justify-between">
          <span className="text-sm font-medium truncate">{doc.business.name}</span>
          <button onClick={close} aria-label="Close" className="min-h-[44px] px-3 -mr-2 flex items-center gap-1.5 text-sm text-slate-600 hover:text-ink"><X className="w-5 h-5" /> Close</button>
        </div>
      </div>
      <div className="px-3 pt-4 max-w-xl mx-auto"><DocumentView ref={ref} doc={doc} templateId={template} accent={accent} brand={brand} fullWidth /></div>

      <div className="max-w-xl mx-auto px-3 mt-4 space-y-4 print:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => window.print()} className={btn}><Printer className="w-4 h-4" /> Print / Save PDF</button>
          <button onClick={picture} disabled={busy} className={btn}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />} Save as picture</button>
        </div>

        {(shopPhone || doc.business.email) && (
          <section aria-label={`Contact ${doc.business.name}`}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Contact {doc.business.name}</h2>
            <div className="grid grid-cols-2 gap-2">
              {shopPhone && <a href={telHref(shopPhone)} className={`${btn} !bg-field-600 !text-white !border-field-600`}><Phone className="w-4 h-4" /> Call shop</a>}
              {shopPhone && <a href={waHref(shopPhone, `Hello ${doc.business.name}, about ${doc.docType} ${doc.number}`)} target="_blank" rel="noopener noreferrer" className={btn}><MessageCircle className="w-4 h-4" /> WhatsApp</a>}
              {doc.business.email && <a href={`mailto:${doc.business.email}?subject=${encodeURIComponent(`${doc.docType} ${doc.number}`)}`} className={`${btn} col-span-2`}><Mail className="w-4 h-4" /> Email shop</a>}
            </div>
          </section>
        )}

        <section className="rounded-card border border-slate-200 bg-paper-raised p-3 text-center" aria-label="ShopOS">
          <div className="flex items-center justify-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#146b4a" /><path d="M7 15.5c1 1.2 2.6 1.8 4.6 1.8 2.3 0 3.6-1 3.6-2.4 0-3.4-7.6-1.6-7.6-5.6C7.6 7.6 9.3 6.5 11.7 6.5c1.6 0 3 .5 4 1.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
            <b className="font-display">ShopOS</b>
          </div>
          <p className="text-xs text-slate-500 italic mt-0.5">{brand.slogan}</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <a href={telHref(brand.phone)} className={btn}><Phone className="w-4 h-4" /> Call ShopOS</a>
            <a href={waHref(brand.whatsapp, 'Hello ShopOS')} target="_blank" rel="noopener noreferrer" className={btn}><MessageCircle className="w-4 h-4" /> ShopOS WhatsApp</a>
          </div>
        </section>
      </div>
    </div>
  );
}
