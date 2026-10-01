import type { Business, Customer, Invoice, InvoiceItem, Quotation, QuotationItem, Sale, SaleItem } from './types';
import { paymentInfoLines, type DocData } from './documentTemplates';

function biz(b: Business): DocData['business'] {
  return { name: b.name, phone: b.phone, email: b.email, address: b.address, taxPin: b.taxPin, logoUrl: b.logoUrl };
}

export function saleToDoc(b: Business, s: Sale, items: SaleItem[], c?: Customer | null): DocData {
  return {
    docType: 'receipt', number: s.receiptNumber, status: s.status === 'completed' ? null : s.status, createdAt: s.createdAt, currency: b.currency,
    business: biz(b), customerName: c?.name ?? null, customerPhone: c?.phone ?? null,
    items: items.map((i) => ({ description: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount ?? 0, lineTotal: i.lineTotal })),
    subtotal: s.subtotal, discount: s.discount ?? 0, tax: s.tax ?? 0, total: s.total, amountPaid: s.amountPaid, balance: s.balanceDue,
    paymentInfo: [], notes: null, footer: b.receiptFooter ?? null
  };
}

export function quotationToDoc(b: Business, q: Quotation, items: QuotationItem[], c?: Customer | null): DocData {
  return {
    docType: 'quotation', number: q.quotationNumber, status: q.status, createdAt: q.createdAt, dueLabel: 'Valid until', dueDate: q.validUntil ?? null, currency: b.currency,
    business: biz(b), customerName: c?.name ?? null, customerPhone: c?.phone ?? null,
    items: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount ?? 0, lineTotal: i.lineTotal })),
    subtotal: q.subtotal, discount: q.discount ?? 0, tax: q.tax ?? 0, total: q.total,
    paymentInfo: paymentInfoLines(b), notes: q.notes ?? null, terms: q.terms ?? null
  };
}

export function invoiceToDoc(b: Business, inv: Invoice, items: InvoiceItem[], c?: Customer | null): DocData {
  return {
    docType: 'invoice', number: inv.invoiceNumber, status: inv.status, createdAt: inv.createdAt, dueLabel: 'Due', dueDate: inv.dueDate ?? null, currency: b.currency,
    business: biz(b), customerName: c?.name ?? null, customerPhone: c?.phone ?? null,
    items: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount ?? 0, lineTotal: i.lineTotal })),
    subtotal: inv.subtotal, discount: inv.discount ?? 0, tax: inv.tax ?? 0, total: inv.total, amountPaid: inv.amountPaid, balance: inv.balance,
    paymentInfo: paymentInfoLines(b), notes: inv.notes ?? null, terms: inv.terms ?? null
  };
}

/** Public-page payload (get_public_document / get_public_receipt) -> DocData. */
export function publicToDoc(p: any, currency = 'KES'): DocData {
  const items = (p.items ?? []).map((i: any) => ({
    description: i.description ?? i.productName, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), discount: Number(i.discount ?? 0), lineTotal: Number(i.lineTotal)
  }));
  const isReceipt = p.docType == null;
  return {
    docType: isReceipt ? 'receipt' : p.docType, number: isReceipt ? p.receiptNumber : p.number, status: isReceipt ? null : p.status,
    createdAt: p.createdAt, dueLabel: p.docType === 'quotation' ? 'Valid until' : 'Due', dueDate: p.validUntil ?? p.dueDate ?? null, currency,
    business: { name: p.businessName, phone: p.businessPhone ?? p.branchPhone, email: p.businessEmail, address: p.businessAddress ?? p.branchLocation, taxPin: p.taxPin, logoUrl: p.logoUrl ?? null },
    customerName: p.customerName ?? null, customerPhone: p.customerPhone ?? null, items,
    subtotal: Number(p.subtotal), discount: Number(p.discount ?? 0), tax: Number(p.tax ?? 0), total: Number(p.total),
    amountPaid: p.amountPaid != null ? Number(p.amountPaid) : null, balance: p.balance != null ? Number(p.balance) : p.balanceDue != null ? Number(p.balanceDue) : null,
    paymentInfo: isReceipt ? [] : paymentInfoLines({ tillNumber: p.tillNumber, paybillNumber: p.paybillNumber, paybillAccount: p.paybillAccount, paymentInstructions: p.paymentInstructions }),
    notes: p.notes ?? null, terms: p.terms ?? null, footer: p.receiptFooter ?? null
  };
}
