/** ShopOS document templates. Every template is ShopOS-branded (the "Issued with ShopOS" footer is part of the
 * template and cannot be switched off) and is chosen per business via businesses.document_template. The same
 * definitions drive the in-app preview, the public shared link, print, and the share-as-picture image. */
export type TemplateId = 'classic' | 'modern' | 'compact' | 'ledger' | 'bold' | 'minimal' | 'elegant' | 'stripe' | 'corporate' | 'soft';

export interface DocTemplate {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;       // brand colour for rules / headings
  header: 'left' | 'band' | 'centered' | 'block' | 'split' | 'stripe';
  table: 'plain' | 'zebra' | 'grid';
  width: number;        // px width used when rendered to an image
  font: string;
  totals: 'right' | 'panel';
}

const SANS = "'Inter','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export const DOC_TEMPLATES: DocTemplate[] = [
  { id: 'classic', name: 'Classic', description: 'Clean and formal. Thin rules, works for every business.', accent: '#146b4a', header: 'left', table: 'plain', width: 480, font: SANS, totals: 'right' },
  { id: 'modern', name: 'Modern', description: 'Coloured header band with the business name up front.', accent: '#0b3a8c', header: 'band', table: 'zebra', width: 480, font: SANS, totals: 'panel' },
  { id: 'compact', name: 'Compact', description: 'Narrow, receipt-style layout that reads well on a phone.', accent: '#1c2420', header: 'centered', table: 'plain', width: 360, font: "'Courier New',ui-monospace,monospace", totals: 'right' },
  { id: 'ledger', name: 'Ledger', description: 'Full grid table. Best for long quotations and invoices.', accent: '#7a4b0a', header: 'left', table: 'grid', width: 520, font: SANS, totals: 'right' },
  { id: 'minimal', name: 'Minimal', description: 'Lots of white space, no lines. Quiet and modern.', accent: '#1c2420', header: 'left', table: 'plain', width: 480, font: SANS, totals: 'right' },
  { id: 'elegant', name: 'Elegant', description: 'Centred serif heading for boutiques and services.', accent: '#7a2e4a', header: 'centered', table: 'plain', width: 480, font: "Georgia,'Times New Roman',serif", totals: 'right' },
  { id: 'stripe', name: 'Stripe', description: 'Thick colour stripe on the left edge of the header.', accent: '#0e6f7a', header: 'stripe', table: 'zebra', width: 480, font: SANS, totals: 'panel' },
  { id: 'corporate', name: 'Corporate', description: 'Business details left, document details in a box.', accent: '#1f3a5f', header: 'split', table: 'grid', width: 520, font: SANS, totals: 'panel' },
  { id: 'soft', name: 'Soft', description: 'Light tinted header, friendly and easy to read.', accent: '#b4541a', header: 'band', table: 'plain', width: 480, font: SANS, totals: 'right' },
  { id: 'bold', name: 'Bold', description: 'Large total and dark header for quick reading.', accent: '#111827', header: 'block', table: 'zebra', width: 480, font: SANS, totals: 'panel' }
];

export function getTemplate(id: string | null | undefined): DocTemplate {
  return DOC_TEMPLATES.find((t) => t.id === id) ?? DOC_TEMPLATES[0];
}

/** Normalised shape every document type is converted into before it is rendered. */
export interface DocData {
  docType: 'receipt' | 'quotation' | 'invoice';
  number: string;
  status?: string | null;
  createdAt: string;
  dueLabel?: string | null;      // "Valid until" / "Due date"
  dueDate?: string | null;
  currency: string;
  business: { name: string; phone?: string | null; email?: string | null; address?: string | null; taxPin?: string | null; logoUrl?: string | null };
  customerName?: string | null;
  customerPhone?: string | null;
  items: { description: string; quantity: number; unitPrice: number; discount: number; lineTotal: number }[];
  subtotal: number; discount: number; tax: number; total: number;
  amountPaid?: number | null; balance?: number | null;
  paymentInfo?: string[];        // e.g. "Till 123456", "Paybill 400200 · Acc 7788"
  notes?: string | null; terms?: string | null; footer?: string | null;
}

export const DOC_TITLES: Record<DocData['docType'], string> = { receipt: 'RECEIPT', quotation: 'QUOTATION', invoice: 'INVOICE' };

/** Payment lines shown under "How to pay", built from whatever the business has configured. */
export function paymentInfoLines(b: { tillNumber?: string | null; paybillNumber?: string | null; paybillAccount?: string | null; sendTillNumber?: string | null; paymentInstructions?: string | null }): string[] {
  const out: string[] = [];
  if (b.tillNumber) out.push(`M-Pesa Till: ${b.tillNumber}`);
  if (b.paybillNumber) out.push(`M-Pesa Paybill: ${b.paybillNumber}${b.paybillAccount ? ` · Account ${b.paybillAccount}` : ''}`);
  if (b.sendTillNumber) out.push(`Send money: ${b.sendTillNumber}`);
  if (b.paymentInstructions) out.push(b.paymentInstructions);
  return out;
}

/** Colours an owner can pick from (they can also type any #RRGGBB). */
export const ACCENT_SWATCHES = ['#146b4a', '#0b3a8c', '#7a2e4a', '#b4541a', '#0e6f7a', '#6b2c7a', '#8a2a2a', '#111827'];
export const isHex = (v: string | null | undefined): v is string => !!v && /^#[0-9a-fA-F]{6}$/.test(v);
