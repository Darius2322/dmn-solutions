import { useRef, useState } from 'react';
import { X, Link2, MessageCircle, MessageSquare, Copy, Image as ImageIcon, Share2, Check, Loader2, WifiOff } from 'lucide-react';
import { DocumentView } from './DocumentView';
import type { DocData } from '../lib/documentTemplates';
import { copyText, getShareLink, nativeShare, revokeShareLink, ShareOfflineError, sharePicture, smsHref, whatsappHref, type ShareableDoc } from '../lib/documentShare';
import { useAuth } from '../lib/auth';
import { useShoposContact } from '../lib/brand';

interface Props {
  docType: ShareableDoc;
  docId: string;
  doc: DocData;
  templateId: string;
  onClose: () => void;
}

const NOUN: Record<ShareableDoc, string> = { sale: 'receipt', quotation: 'quotation', invoice: 'invoice' };

/** "Send digital receipt" sheet, used for receipts, quotations and invoices. The customer gets either a secure link
 * (opens in any browser, no account needed, in the business's chosen ShopOS template) or a picture of the document. */
export function ShareDocumentSheet({ docType, docId, doc, templateId, onClose }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { business } = useAuth();
  const brand = useShoposContact();
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState<null | 'link' | 'picture'>(null);
  const [link, setLink] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const noun = NOUN[docType];
  const offline = !navigator.onLine;

  const text = (url: string) => `Hello${doc.customerName ? ` ${doc.customerName.split(' ')[0]}` : ''}, here is your ${noun} ${doc.number} from ${doc.business.name}: ${url}`;

  async function ensureLink(): Promise<string | null> {
    if (link) return link;
    setBusy('link'); setMessage(null);
    try { const url = await getShareLink(docType, docId, days); setLink(url); return url; }
    catch (e) { setMessage({ tone: 'error', text: e instanceof ShareOfflineError || e instanceof Error ? e.message : 'Could not create the link.' }); return null; }
    finally { setBusy(null); }
  }

  async function viaWhatsapp() { const u = await ensureLink(); if (u) window.open(whatsappHref(text(u), doc.customerPhone), '_blank', 'noopener'); }
  async function viaSms() { const u = await ensureLink(); if (u) window.location.href = smsHref(text(u), doc.customerPhone); }
  async function viaCopy() { const u = await ensureLink(); if (u) setMessage((await copyText(u)) ? { tone: 'ok', text: 'Link copied.' } : { tone: 'error', text: 'Could not copy. Long-press the link to copy it.' }); }
  async function viaNative() {
    const u = await ensureLink(); if (!u) return;
    if (!(await nativeShare({ title: `${doc.business.name} ${noun} ${doc.number}`, text: text(u), url: u }))) await viaCopy();
  }
  async function turnOff() {
    setBusy('link'); setMessage(null);
    try { await revokeShareLink(docType, docId); setLink(null); setMessage({ tone: 'ok', text: 'Link turned off. Anyone who has it can no longer open it.' }); }
    catch (e) { setMessage({ tone: 'error', text: e instanceof Error ? e.message : 'Could not turn the link off.' }); }
    finally { setBusy(null); }
  }
  async function asPicture() {
    if (!previewRef.current) return;
    setBusy('picture'); setMessage(null);
    try {
      const r = await sharePicture(previewRef.current, `${doc.business.name.replace(/\s+/g, '-')}-${doc.number}`, `${noun} ${doc.number}`);
      setMessage({ tone: 'ok', text: r === 'shared' ? 'Picture ready to send.' : 'Picture saved to your downloads.' });
    } catch (e) { setMessage({ tone: 'error', text: e instanceof Error ? e.message : 'Could not create the picture.' }); }
    finally { setBusy(null); }
  }

  const btn = 'min-h-[48px] rounded-card border border-slate-200 bg-paper-raised px-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={`Send ${noun}`} onClick={onClose}>
      <div className="bg-paper w-full md:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Send digital {noun}</h2>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="rounded-card bg-slate-50 p-2 mb-4 overflow-x-auto"><DocumentView ref={previewRef} doc={doc} templateId={templateId} accent={business?.documentAccent} brand={brand} /></div>

        {offline && (
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-card p-2.5 mb-3">
            <WifiOff className="w-4 h-4 shrink-0 mt-0.5" /> <span>You're offline. Links need a connection, but you can still share a picture.</span>
          </div>
        )}

        <label className="flex items-center justify-between gap-3 text-xs text-slate-600 mb-2">
          <span>Link stays valid for</span>
          <select className="input !w-auto !min-h-[40px] text-xs" value={days} onChange={(e) => { setDays(Number(e.target.value)); setLink(null); }} aria-label="Link validity">
            <option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>1 year</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={viaWhatsapp} disabled={!!busy || offline} className={btn}>{busy === 'link' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 text-field-600" />} WhatsApp link</button>
          <button onClick={viaSms} disabled={!!busy || offline} className={btn}><MessageSquare className="w-4 h-4" /> SMS link</button>
          <button onClick={viaCopy} disabled={!!busy || offline} className={btn}><Copy className="w-4 h-4" /> Copy link</button>
          <button onClick={viaNative} disabled={!!busy || offline} className={btn}><Share2 className="w-4 h-4" /> More apps…</button>
          <button onClick={asPicture} disabled={!!busy} className={`${btn} col-span-2 !bg-field-600 !text-white !border-field-600 hover:!bg-field-700`}>
            {busy === 'picture' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />} Share as picture
          </button>
        </div>

        {link && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-card px-3 py-2">
            <Link2 className="w-4 h-4 shrink-0" /><span className="truncate select-all">{link}</span>
          </div>
        )}
        {message && (
          <p role="status" className={`mt-3 text-sm flex items-center gap-1.5 ${message.tone === 'ok' ? 'text-field-600' : 'text-rust-600'}`}>
            {message.tone === 'ok' && <Check className="w-4 h-4" />}{message.text}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">The link is private and can't be guessed. It opens a read-only copy of this {noun} only, until it expires or you turn it off.</p>
          {!offline && <button onClick={turnOff} disabled={!!busy} className="shrink-0 text-xs font-medium text-rust-600 min-h-[40px] px-2 hover:underline">Turn off link</button>}
        </div>
        <button onClick={onClose} className="btn-secondary w-full min-h-[48px] mt-3">Close</button>
      </div>
    </div>
  );
}
