import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Printer, Download, Loader2, ArrowRightCircle, Send } from 'lucide-react';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { downloadQuotationPdf } from '../../lib/downloads';
import { setQuotationStatus } from '../../lib/documents';
import { ConvertModal } from './QuotationsList';
import { ShareDocumentSheet } from '../../components/ShareDocumentSheet';
import { quotationToDoc } from '../../lib/documentData';
import type { Quotation } from '../../lib/types';

function money(n: number, currency: string) {
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<Quotation['status'], string> = {
  draft: 'bg-slate-200 text-slate-600',
  sent: 'bg-field-50 text-field-700',
  accepted: 'bg-field-50 text-field-700',
  rejected: 'bg-rust-50 text-rust-600',
  expired: 'bg-amber-100 text-amber-600',
  converted: 'bg-field-50 text-field-700'
};

/** Full-page detail view — replaces the old bottom-sheet modal. A quotation
 * has enough on it (line items, tax breakdown, status history, conversion
 * state) that a cramped sheet forced the person to scroll a tiny box
 * instead of just reading the page like every other record in the app. */
export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business, userId: currentUserId } = useAuth();
  const currency = business?.currency ?? 'KES';

  const quotation = useLiveQuery(() => (id ? db.quotations.get(id) : undefined), [id]);
  const items = useLiveQuery(() => (id ? db.quotationItems.where('quotationId').equals(id).toArray() : []), [id]) ?? [];
  const customer = useLiveQuery(
    () => (quotation?.customerId ? db.customers.get(quotation.customerId) : undefined),
    [quotation?.customerId]
  );
  const createdByProfile = useLiveQuery(
    () => (quotation?.userId && business ? db.profiles.where({ userId: quotation.userId, businessId: business.id }).first() : undefined),
    [quotation?.userId, business?.id]
  );

  const [downloading, setDownloading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [sharing, setSharing] = useState(false);

  // A record that belongs to a different business than the one currently
  // active (stale link, switched business, or simply doesn't exist locally
  // yet) must not render as if it were this business's data.
  if (quotation === undefined) {
    return <div className="p-4 md:p-8 max-w-3xl mx-auto text-sm text-slate-400">Loading…</div>;
  }
  if (!quotation || (business && quotation.businessId !== business.id)) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto text-center py-16">
        <p className="text-sm text-slate-500 mb-3">This quotation isn't available.</p>
        <Link to="/quotations" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Quotations
        </Link>
      </div>
    );
  }

  async function download() {
    if (!business || !quotation) return;
    setDownloading(true);
    try {
      await downloadQuotationPdf({ business, quotation, items, customerName: customer?.name ?? 'Walk-in', currency });
    } finally { setDownloading(false); }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate('/quotations')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Back to Quotations
        </button>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[quotation.status]}`}>{quotation.status}</span>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{quotation.quotationNumber}</h1>
          <p className="text-sm text-slate-500 mt-0.5">To: {customer?.name ?? 'Walk-in'}</p>
          {quotation.validUntil && <p className="text-xs text-slate-400 mt-0.5">Valid until {quotation.validUntil}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-b border-slate-100 py-3">
          <div><div className="text-slate-400 mb-0.5">Created</div><div className="font-medium text-ink">{new Date(quotation.createdAt).toLocaleString()}</div></div>
          <div><div className="text-slate-400 mb-0.5">Updated</div><div className="font-medium text-ink">{new Date(quotation.updatedAt).toLocaleString()}</div></div>
          <div><div className="text-slate-400 mb-0.5">Created by</div><div className="font-medium text-ink">{createdByProfile?.fullName ?? '—'}</div></div>
          <div><div className="text-slate-400 mb-0.5">Converted</div><div className="font-medium text-ink">{quotation.convertedSaleId ? 'Yes' : 'No'}</div></div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Items</h2>
          <div className="border border-slate-200 rounded-card divide-y divide-slate-100">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-medium text-slate-400 uppercase">
              <span className="col-span-5">Description</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Unit price</span>
              <span className="col-span-1 text-right">Disc.</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            {items.map((i) => (
              <div key={i.id} className="grid grid-cols-2 sm:grid-cols-12 gap-1 sm:gap-2 px-3 py-2.5 text-sm">
                <span className="col-span-2 sm:col-span-5">{i.description}</span>
                <span className="tnum text-right sm:col-span-2 text-slate-500 sm:text-ink">{i.quantity} <span className="sm:hidden">×</span></span>
                <span className="tnum text-right sm:col-span-2 text-slate-500 sm:text-ink">{money(i.unitPrice, currency)}</span>
                <span className="tnum text-right sm:col-span-1 text-slate-500 sm:text-ink">{i.discount > 0 ? money(i.discount, currency) : '—'}</span>
                <span className="tnum text-right sm:col-span-2 font-medium">{money(i.lineTotal, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm space-y-1 max-w-xs ml-auto">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="tnum">{money(quotation.subtotal, currency)}</span></div>
          {quotation.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="tnum">-{money(quotation.discount, currency)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="tnum">{money(quotation.tax, currency)}</span></div>
          <div className="flex justify-between font-semibold text-base border-t border-slate-100 pt-1"><span>Total</span><span className="tnum">{money(quotation.total, currency)}</span></div>
        </div>

        {(quotation.notes || quotation.terms) && (
          <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
            {quotation.notes && <p><span className="font-medium text-slate-600">Notes: </span>{quotation.notes}</p>}
            {quotation.terms && <p><span className="font-medium text-slate-600">Terms: </span>{quotation.terms}</p>}
          </div>
        )}
      </div>

      {/* Only actions this quotation's current status actually allows. */}
      <div className="grid grid-cols-2 gap-2 mt-4 print:hidden">
        <button onClick={() => setSharing(true)} className="btn-primary col-span-2 flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          <Send className="w-4 h-4" /> Send digital quotation
        </button>
        <button onClick={download} disabled={downloading} className="btn-primary flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
        </button>
        <button onClick={() => window.print()} className="btn-secondary flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          <Printer className="w-4 h-4" /> Print
        </button>
        {quotation.status === 'draft' && (
          <button onClick={() => setQuotationStatus(quotation, 'sent')} className="btn-secondary col-span-2 text-sm min-h-[44px]">Mark sent</button>
        )}
        {quotation.status === 'sent' && (
          <>
            <button onClick={() => setQuotationStatus(quotation, 'accepted')} className="btn-secondary text-sm min-h-[44px]">Accept</button>
            <button onClick={() => setQuotationStatus(quotation, 'rejected')} className="btn-secondary text-sm min-h-[44px] !text-rust-600">Reject</button>
          </>
        )}
        {(quotation.status === 'sent' || quotation.status === 'accepted') && !quotation.convertedSaleId && currentUserId && (
          <button onClick={() => setConverting(true)} className="btn-primary col-span-2 flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
            Convert to sale <ArrowRightCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {sharing && business && (
        <ShareDocumentSheet docType="quotation" docId={quotation.id} doc={quotationToDoc(business, quotation, items, customer)} templateId={business.documentTemplate ?? 'classic'} onClose={() => setSharing(false)} />
      )}

      {converting && currentUserId && (
        <ConvertModal quotation={quotation} currency={currency} userId={currentUserId} onClose={() => setConverting(false)} />
      )}
    </div>
  );
}
