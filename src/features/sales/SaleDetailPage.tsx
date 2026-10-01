import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Printer, Send } from 'lucide-react';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { recordAuditEvent } from '../../lib/audit';
import { ReceiptModal } from '../pos/ReceiptModal';
import { RequestRefundModal, RequestCorrectionModal, RequestCancellationModal } from './SalesList';
import { ShareDocumentSheet } from '../../components/ShareDocumentSheet';
import { saleToDoc } from '../../lib/documentData';
import type { Sale } from '../../lib/types';

function money(n: number, currency: string) {
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<Sale['status'], string> = {
  completed: 'bg-field-600/10 text-field-700',
  cancelled: 'bg-slate-200 text-slate-500',
  refunded: 'bg-rust-600/10 text-rust-600',
  partially_refunded: 'bg-amber-500/10 text-amber-600'
};

/** Full-page sale detail — replaces the bottom-sheet modal. Line items,
 * totals, and the trail of any refunds/cancellations/corrections all fit
 * comfortably instead of sharing an 85vh scrolling sheet. */
export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business, userId } = useAuth();
  const currency = business?.currency ?? 'KES';

  const sale = useLiveQuery(() => (id ? db.sales.get(id) : undefined), [id]);
  const items = useLiveQuery(() => (id ? db.saleItems.where('saleId').equals(id).toArray() : []), [id]) ?? [];
  const customer = useLiveQuery(() => (sale?.customerId ? db.customers.get(sale.customerId) : undefined), [sale?.customerId]);
  const branch = useLiveQuery(() => (sale ? db.branches.get(sale.branchId) : undefined), [sale?.branchId]);
  const cashier = useLiveQuery(() => (sale ? db.profiles.get(sale.userId) : undefined), [sale?.userId]);
  const refunds = useLiveQuery(() => (id ? db.refunds.where('saleId').equals(id).toArray() : []), [id]) ?? [];
  const cancellation = useLiveQuery(() => (id ? db.saleCancellations.where('saleId').equals(id).first() : undefined), [id]);
  const corrections = useLiveQuery(() => (id ? db.correctionRequests.where('saleId').equals(id).toArray() : []), [id]) ?? [];

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (sale === undefined) {
    return <div className="p-4 md:p-8 max-w-2xl mx-auto text-sm text-slate-400">Loading…</div>;
  }
  if (!sale || (business && sale.businessId !== business.id)) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center py-16">
        <p className="text-sm text-slate-500 mb-3">This sale isn't available.</p>
        <Link to="/sales" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Sales
        </Link>
      </div>
    );
  }

  function openReceipt() {
    setReceiptOpen(true);
    if (userId && business && sale) {
      recordAuditEvent({ businessId: business.id, branchId: sale.branchId, userId, action: 'receipt_regenerated', entityType: 'sale', entityId: sale.id });
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/sales')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Back to Sales
        </button>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[sale.status]}`}>{sale.status.replace('_', ' ')}</span>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{sale.receiptNumber}</h1>
          <div className="text-sm text-slate-500 mt-1 space-y-0.5">
            <div>{new Date(sale.createdAt).toLocaleString()}</div>
            <div>Branch: {branch?.name ?? '—'}</div>
            <div>Cashier: {cashier?.fullName ?? 'Unknown'}</div>
            {customer && <div>Customer: {customer.name}{customer.phone ? ` (${customer.phone})` : ''}</div>}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Items</h2>
          <div className="border border-slate-200 rounded-card divide-y divide-slate-100">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between px-3 py-2.5 text-sm">
                <span>{i.productName} × {i.quantity} @ {money(i.unitPrice, currency)}</span>
                <span className="tnum font-medium">{money(i.lineTotal, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm space-y-1 max-w-xs ml-auto">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="tnum">{money(sale.subtotal, currency)}</span></div>
          {sale.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="tnum">-{money(sale.discount, currency)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="tnum">{money(sale.tax, currency)}</span></div>
          <div className="flex justify-between font-semibold text-base border-t border-slate-100 pt-1"><span>Total</span><span className="tnum">{money(sale.total, currency)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Paid ({sale.paymentMethod})</span><span className="tnum">{money(sale.amountPaid, currency)}</span></div>
          {sale.balanceDue > 0 && <div className="flex justify-between text-rust-600"><span>Balance due</span><span className="tnum">{money(sale.balanceDue, currency)}</span></div>}
        </div>

        {(refunds.length > 0 || cancellation || corrections.length > 0) && (
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Related adjustments</h2>
            {refunds.map((r) => (
              <div key={r.id} className="text-xs text-slate-600">Refund · {r.status} · {money(r.totalAmount, currency)} · {r.reason}</div>
            ))}
            {cancellation && <div className="text-xs text-slate-600">Cancellation · {cancellation.status} · {cancellation.reason}</div>}
            {corrections.map((c) => (
              <div key={c.id} className="text-xs text-slate-600">Correction · {c.status} · {c.problem}</div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button onClick={openReceipt} className="btn-primary col-span-2 flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          <Printer className="w-4 h-4" /> View / regenerate receipt
        </button>
        <button onClick={() => setSharing(true)} className="btn-secondary col-span-2 flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          <Send className="w-4 h-4" /> Send digital receipt
        </button>
        {sale.status === 'completed' && (
          <>
            <button onClick={() => setCorrecting(true)} className="btn-secondary text-sm min-h-[44px] !text-amber-600">Request correction</button>
            <button onClick={() => setRefunding(true)} className="btn-secondary text-sm min-h-[44px] !text-rust-600">Request refund</button>
            <button onClick={() => setCancelling(true)} className="btn-secondary col-span-2 text-sm min-h-[44px]">Cancel sale</button>
          </>
        )}
      </div>

      {sharing && business && (
        <ShareDocumentSheet docType="sale" docId={sale.id} doc={saleToDoc(business, sale, items, customer)} templateId={business.documentTemplate ?? 'classic'} onClose={() => setSharing(false)} />
      )}
      {receiptOpen && <ReceiptModal saleId={sale.id} onClose={() => setReceiptOpen(false)} />}
      {refunding && <RequestRefundModal sale={sale} businessId={sale.businessId} currency={currency} onClose={() => setRefunding(false)} />}
      {correcting && <RequestCorrectionModal sale={sale} businessId={sale.businessId} onClose={() => setCorrecting(false)} />}
      {cancelling && <RequestCancellationModal sale={sale} businessId={sale.businessId} onClose={() => setCancelling(false)} />}
    </div>
  );
}
