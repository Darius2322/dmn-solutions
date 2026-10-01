import { supabase, backendConfigured } from './supabase';

export type ShareableDoc = 'sale' | 'quotation' | 'invoice';

/** Public link a customer can open with no ShopOS account. Receipts keep their existing /r/ route; quotations and
 * invoices use /d/. The token is 48 random hex characters issued by the server (create_receipt_share /
 * create_document_share), which verifies the caller belongs to the document's business. */
export function shareUrl(docType: ShareableDoc, token: string): string {
  return `${window.location.origin}/${docType === 'sale' ? 'r' : 'd'}/${token}`;
}

export class ShareOfflineError extends Error {
  constructor() { super('You are offline. Links need a connection. You can still share the document as a picture.'); }
}

/** Returns the share link, creating it on first use. Throws ShareOfflineError when there is no connection or the
 * record has not synced yet (the server can only link records it has). */
export async function getShareLink(docType: ShareableDoc, id: string, days = 30): Promise<string> {
  if (!backendConfigured() || !supabase) throw new ShareOfflineError();
  if (!navigator.onLine) throw new ShareOfflineError();
  const { data, error } = docType === 'sale'
    ? await supabase.rpc('create_receipt_share', { p_sale_id: id, p_days: days })
    : await supabase.rpc('create_document_share', { p_doc_type: docType, p_doc_id: id, p_days: days });
  if (error) {
    if (/not found|does not exist/i.test(error.message)) throw new Error('This document has not synced yet. It will be shareable as soon as it reaches the server. Try again in a moment.');
    if (/not authorized/i.test(error.message)) throw new Error("You don't have access to share this document.");
    throw new Error('Could not create the link. Please try again.');
  }
  return shareUrl(docType, data as string);
}

export async function revokeShareLink(docType: ShareableDoc, id: string) {
  if (!supabase || !navigator.onLine) throw new ShareOfflineError();
  const { error } = docType === 'sale'
    ? await supabase.rpc('revoke_receipt_share', { p_sale_id: id })
    : await supabase.rpc('revoke_document_share', { p_doc_type: docType, p_doc_id: id });
  if (error) throw new Error('Could not disable the link.');
}

export function whatsappHref(text: string, phone?: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '');
  // Kenyan numbers: 07xx / 01xx -> 254...
  const intl = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

export function smsHref(text: string, phone?: string | null) {
  return `sms:${(phone ?? '').replace(/\s/g, '')}?body=${encodeURIComponent(text)}`;
}

export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!navigator.share) return false;
  try { await navigator.share(data); return true; } catch (e) { if ((e as DOMException)?.name === 'AbortError') return true; return false; }
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    try {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch { return false; }
  }
}

async function toDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = () => resolve(null); r.readAsDataURL(blob); });
  } catch { return null; }
}

/** Turns a rendered <DocumentView> node into a PNG. DocumentView only uses inline styles, so serialising it into an
 * SVG <foreignObject> and drawing that onto a canvas reproduces it exactly, with no extra dependency and fully
 * offline. A remote logo is inlined as a data URL first; if that fails the logo is dropped rather than tainting
 * the canvas. */
export async function nodeToPngBlob(node: HTMLElement, scale = 2): Promise<Blob> {
  const clone = node.cloneNode(true) as HTMLElement;
  for (const img of Array.from(clone.querySelectorAll('img'))) {
    const src = img.getAttribute('src');
    const data = src && !src.startsWith('data:') ? await toDataUrl(src) : src;
    if (data) img.setAttribute('src', data); else img.remove();
  }
  const width = Math.ceil(node.getBoundingClientRect().width);
  const height = Math.ceil(node.getBoundingClientRect().height);
  clone.style.margin = '0';
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const xml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('render')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = width * scale; canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale); ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/png'));
  } catch {
    throw new Error('Could not create the picture on this device. Use Print or Download PDF instead.');
  } finally { URL.revokeObjectURL(url); }
}

export async function sharePicture(node: HTMLElement, fileName: string, title: string): Promise<'shared' | 'downloaded'> {
  const blob = await nodeToPngBlob(node);
  const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return 'shared'; } catch (e) { if ((e as DOMException)?.name === 'AbortError') return 'shared'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `${fileName}.png`; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
