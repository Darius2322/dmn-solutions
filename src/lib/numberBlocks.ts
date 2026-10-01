import { db } from './db';
import { supabase, backendConfigured } from './supabase';

/** Unique receipt / quotation / invoice numbers, even when several cashiers are offline at once.
 *
 * Problem: two devices that are both offline used to hand out their own provisional numbers, so the same number
 * could appear on two printed receipts. Fix: while online, every device RESERVES a block of real numbers from the
 * server (reserve_document_numbers, atomic, never overlapping) and keeps them locally. A new sale/quotation/invoice
 * takes the next number from the block, so it already carries its final, globally unique number. If a device runs
 * out while offline for a long time it falls back to the old PENDING-… number, which is swapped for a real one at
 * sync (existing behaviour), so nothing is ever blocked.
 *
 * Numbers are strictly unique but not strictly gap-free: a block that a device never uses leaves a gap.
 */
type DocType = 'receipt' | 'quotation' | 'invoice';
const BLOCK = 30;
const LOW = 10;
const key = (biz: string, t: DocType) => `shopos.numbers.${biz}.${t}`;

function read(biz: string, t: DocType): string[] { try { return JSON.parse(localStorage.getItem(key(biz, t)) ?? '[]'); } catch { return []; } }
function write(biz: string, t: DocType, list: string[]) { try { localStorage.setItem(key(biz, t), JSON.stringify(list)); } catch { /* ignore */ } }

/** Synchronous on purpose: it is called from a Dexie "creating" hook, which cannot await. */
export function takeNumber(biz: string, t: DocType): string | null {
  const list = read(biz, t);
  const next = list.shift();
  if (!next) return null;
  write(biz, t, list);
  if (list.length < LOW) void topUpNumbers(biz);
  return next;
}

let refilling = new Set<string>();
export async function topUpNumbers(biz: string) {
  if (!backendConfigured() || !supabase || !navigator.onLine) return;
  for (const t of ['receipt', 'quotation', 'invoice'] as DocType[]) {
    const k = `${biz}.${t}`;
    if (refilling.has(k) || read(biz, t).length >= LOW) continue;
    refilling.add(k);
    try {
      const { data, error } = await supabase.rpc('reserve_document_numbers', { p_business_id: biz, p_doc_type: t, p_count: BLOCK });
      if (!error && Array.isArray(data)) write(biz, t, [...read(biz, t), ...(data as string[])]);
    } finally { refilling.delete(k); }
  }
}

export function remainingNumbers(biz: string) { return { receipt: read(biz, 'receipt').length, quotation: read(biz, 'quotation').length, invoice: read(biz, 'invoice').length }; }

let installed = false;
/** Call once at start-up. Replaces provisional numbers on new records with a reserved one when available. */
export function installNumbering(getBusinessId: () => string | null | undefined) {
  if (installed) return; installed = true;
  const wire = (table: 'sales' | 'quotations' | 'invoices', field: string, type: DocType) => {
    (db as any)[table].hook('creating', (_pk: unknown, obj: any) => {
      const biz = obj.businessId ?? getBusinessId();
      if (!biz || typeof obj[field] !== 'string' || !obj[field].startsWith('PENDING-')) return;
      const n = takeNumber(biz, type);
      if (n) obj[field] = n;
    });
  };
  wire('sales', 'receiptNumber', 'receipt');
  wire('quotations', 'quotationNumber', 'quotation');
  wire('invoices', 'invoiceNumber', 'invoice');
  const refill = () => { const b = getBusinessId(); if (b) void topUpNumbers(b); };
  window.addEventListener('online', refill);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refill(); });
  setInterval(refill, 5 * 60 * 1000);
  refill();
}
