import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Printer, Download, Loader2, Send } from 'lucide-react';
import { db, enqueueSync } from '../../lib/db';
import { useAuth } from '../../lib/auth';
import { downloadInvoicePdf } from '../../lib/downloads';
import { RecordInvoicePaymentModal } from './InvoicesList';
import { ShareDocumentSheet } from '../../components/ShareDocumentSheet';
import { invoiceToDoc } from '../../lib/documentData';
import type { Invoice } from '../../lib/types';

function money(n: number, currency: string) {
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<Invoice['status'], string> = {
  draft: 'bg-slate-200 text-slate-600',
  sent: 'bg-field-50 text-field-700',
  partially_paid: 'bg-amber-100 text-amber-600',
  paid: 'bg-field-50 text-field-700',
  overdue: 'bg-rust-50 text-rust-600',
  cancelled: 'bg-slate-200 text-slate-500'
};

/** Full-page invoice detail — replaces the bottom-sheet modal. Same shape
 * as the Quotations conversion: full item table, totals, payment history,
 * download/print/mark-sent/record-payment actions. */
export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { business, userId } = useAuth();
  const currency = business?.currency ?? 'KES';

  const invoice = useLiveQuery(() => (id ? db.invoices.get(id) : undefined), [id]);
  const items = useLiveQuery(() => (id ? db.invoiceItems.where('invoiceId').equals(id).toArray() : []), [id]) ?? [];
  const payments = useLiveQuery(() => (id ? db.invoicePayments.where('invoiceId').equals(id).toArray() : []), [id]) ?? [];
  const customer = useLiveQuery(
    () => (invoice?.customerId ? db.customers.get(invoice.customerId) : undefined),
    [invoice?.customerId]
  );

  const [downloading, setDownloading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (invoice === undefined) {
    return <div className="p-4 md:p-8 max-w-3xl mx-auto text-sm text-slate-400">Loading…</div>;
  }
  if (!invoice || (business && invoice.businessId !== business.id)) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto text-center py-16">
        <p className="text-sm text-slate-500 mb-3">This invoice isn't available.</p>
        <Link to="/invoices" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
      </div>
    );
  }

  async function markSent() {
    await db.invoices.update(invoice!.id, { status: 'sent', updatedAt: new Date().toISOString(), syncStatus: 'pending' as const });
    await enqueueSync('invoices', invoice!.id, 'update');
  }

  async function download() {
    if (!business || !invoice) return;
    setDownloading(true);
    try {
      await downloadInvoicePdf({ business, invoice, items, payments, customerName: customer?.name ?? 'Walk-in', currency });
    } finally { setDownloading(false); }
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 print:p-0 print:max-w-none">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[invoice.status]}`}>{invoice.status.replace('_', ' ')}</span>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Bill to: {customer?.name ?? 'Walk-in'}</p>
          {invoice.dueDate && <p className="text-xs text-slate-400 mt-0.5">Due {invoice.dueDate}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-b border-slate-100 py-3">
          <div><div className="text-slate-400 mb-0.5">Created</div><div className="font-medium text-ink">{new Date(invoice.createdAt).toLocaleString()}</div></div>
          <div><div className="text-slate-400 mb-0.5">Updated</div><div className="font-medium text-ink">{new Date(invoice.updatedAt).toLocaleString()}</div></div>
          <div><div className="text-slate-400 mb-0.5">Status</div><div className="font-medium text-ink capitalize">{invoice.status.replace('_', ' ')}</div></div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Items</h2>
          <div className="border border-slate-200 rounded-card divide-y divide-slate-100">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between px-3 py-2.5 text-sm">
                <span>{i.description} × {i.quantity}</span>
                <span className="tnum font-medium">{money(i.lineTotal, currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm space-y-1 max-w-xs ml-auto">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="tnum">{money(invoice.subtotal, currency)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="tnum">{money(invoice.tax, currency)}</span></div>
          <div className="flex justify-between font-semibold text-base border-t border-slate-100 pt-1"><span>Total</span><span className="tnum">{money(invoice.total, currency)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="tnum">{money(invoice.amountPaid, currency)}</span></div>
          {invoice.balance > 0 && <div className="flex justify-between text-rust-600"><span>Balance</span><span className="tnum">{money(invoice.balance, currency)}</span></div>}
        </div>

        {payments.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Payments</h2>
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between text-sm text-slate-600 py-0.5">
                <span>{new Date(p.createdAt).toLocaleDateString()} · {p.method}</span>
                <span className="tnum">{money(p.amount, currency)}</span>
              </div>
            ))}
          </div>
        )}

        {(invoice.notes || invoice.terms) && (
          <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
            {invoice.notes && <p><span className="font-medium text-slate-600">Notes: </span>{invoice.notes}</p>}
            {invoice.terms && <p><span className="font-medium text-slate-600">Terms: </span>{invoice.terms}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 print:hidden">
        <button onClick={() => setSharing(true)} className="btn-primary col-span-2 flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          <Send className="w-4 h-4" /> Send digital invoice
        </button>
        <button onClick={download} disabled={downloading} className="btn-primary flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
        </button>
        <button onClick={() => window.print()} className="btn-secondary flex items-center justify-center gap-1.5 text-sm min-h-[44px]">
          <Printer className="w-4 h-4" /> Print
        </button>
        {invoice.status === 'draft' && (
          <button onClick={markSent} className="btn-secondary col-span-2 text-sm min-h-[44px]">Mark sent</button>
        )}
        {invoice.balance > 0 && invoice.status !== 'cancelled' && (
          <button onClick={() => setPaying(true)} className="btn-primary col-span-2 text-sm min-h-[44px]">Record payment</button>
        )}
      </div>

      {sharing && business && (
        <ShareDocumentSheet docType="invoice" docId={invoice.id} doc={invoiceToDoc(business, invoice, items, customer)} templateId={business.documentTemplate ?? 'classic'} onClose={() => setSharing(false)} />
      )}

      {paying && userId && (
        <RecordInvoicePaymentModal invoice={invoice} currency={currency} userId={userId} onClose={() => setPaying(false)} />
      )}
    </div>
  );
}
