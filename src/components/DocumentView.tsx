import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { DOC_TITLES, getTemplate, isHex, type DocData, type TemplateId } from '../lib/documentTemplates';
import { SHOPOS_FALLBACK, type ShoposContact } from '../lib/brand';

const fmt = (n: number, cur: string) => `${cur} ${Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fdate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/** Renders one document in one template. Uses ONLY inline styles (no Tailwind / CSS variables) so the exact same
 * markup can be printed, shown on the public page, and serialised into a PNG for "share as picture" — and so it
 * always looks like paper (white, dark ink) even when the app is in dark mode. */
export const DocumentView = forwardRef<HTMLDivElement, { doc: DocData; templateId: TemplateId | string; accent?: string | null; fullWidth?: boolean; brand?: ShoposContact }>(function DocumentView({ doc, templateId, accent, fullWidth, brand }, ref) {
  const base = getTemplate(templateId);
  const t = isHex(accent) ? { ...base, accent } : base;
  const bc = brand ?? SHOPOS_FALLBACK;
  const ink = '#1c2420', muted = '#5b655f', line = '#d9ded9';
  const compact = t.id === 'compact';
  const fs = compact ? 11 : 13;
  const title = DOC_TITLES[doc.docType];
  const showPaid = doc.docType !== 'quotation' && doc.amountPaid != null;
  const onColour = (t.header === 'band' && t.id !== 'soft') || t.header === 'block';

  const biz = (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: compact ? 15 : 18, fontWeight: 700, color: onColour ? '#fff' : ink }}>{doc.business.name}</div>
      <div style={{ fontSize: fs - 1, color: onColour ? 'rgba(255,255,255,.85)' : muted, lineHeight: 1.5 }}>
        {[doc.business.address, doc.business.phone, doc.business.email].filter(Boolean).join(' · ')}
        {doc.business.taxPin ? <div>PIN {doc.business.taxPin}</div> : null}
      </div>
    </div>
  );
  const logo = doc.business.logoUrl
    ? <img src={doc.business.logoUrl} alt="" crossOrigin="anonymous" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, background: '#fff' }} />
    : null;

  const meta = (light: boolean) => (
    <div style={{ textAlign: t.header === 'centered' ? 'center' : 'right', fontSize: fs - 1, color: light ? 'rgba(255,255,255,.9)' : muted, lineHeight: 1.6 }}>
      <div style={{ fontSize: fs + 3, fontWeight: 800, letterSpacing: 1, color: light ? '#fff' : t.accent }}>{title}</div>
      <div><b style={{ color: light ? '#fff' : ink }}>{doc.number}</b></div>
      <div>{fdate(doc.createdAt)}</div>
      {doc.dueDate ? <div>{doc.dueLabel ?? 'Due'}: {fdate(doc.dueDate)}</div> : null}
      {doc.status ? <div style={{ textTransform: 'capitalize' }}>{doc.status.replace(/_/g, ' ')}</div> : null}
    </div>
  );

  let header;
  if (t.id === 'soft') {
    header = (
      <div style={{ background: t.accent + '1f', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>{logo}{biz}</div>
        {meta(false)}
      </div>
    );
  } else if (t.header === 'stripe') {
    header = (
      <div style={{ borderLeft: `8px solid ${t.accent}`, padding: '18px 20px 12px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>{logo}{biz}</div>
        {meta(false)}
      </div>
    );
  } else if (t.header === 'split') {
    header = (
      <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'stretch', borderBottom: `3px double ${t.accent}` }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>{logo}{biz}</div>
        <div style={{ border: `1px solid ${t.accent}`, padding: '8px 12px', minWidth: 120 }}>{meta(false)}</div>
      </div>
    );
  } else if (onColour) {
    header = (
      <div style={{ background: t.accent, color: '#fff', padding: t.header === 'block' ? '22px 20px' : '16px 20px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>{logo}{biz}</div>
        {meta(true)}
      </div>
    );
  } else if (t.header === 'centered') {
    header = (
      <div style={{ textAlign: 'center', padding: '16px 14px 8px', borderBottom: `1px dashed ${line}` }}>
        {logo && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{logo}</div>}
        {biz}
        <div style={{ marginTop: 8 }}>{meta(false)}</div>
      </div>
    );
  } else {
    header = (
      <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', borderBottom: `2px solid ${t.accent}` }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>{logo}{biz}</div>
        {meta(false)}
      </div>
    );
  }

  const cell = (extra: CSSProperties = {}): CSSProperties => ({
    padding: compact ? '4px 4px' : '8px 8px', fontSize: fs, verticalAlign: 'top',
    ...(t.table === 'grid' ? { border: `1px solid ${line}` } : { borderBottom: `1px solid ${line}` }), ...extra
  });

  return (
    <div ref={ref} style={{ width: fullWidth ? '100%' : t.width, maxWidth: '100%', background: '#fff', color: ink, fontFamily: t.font, boxSizing: 'border-box', border: `1px solid ${line}`, margin: '0 auto' }}>
      {header}
      <div style={{ padding: compact ? '10px 12px' : '16px 20px' }}>
        {(doc.customerName || doc.customerPhone) && (
          <div style={{ marginBottom: 12, fontSize: fs }}>
            <div style={{ fontSize: fs - 2, color: muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{doc.docType === 'receipt' ? 'Customer' : 'Bill to'}</div>
            <div style={{ fontWeight: 600 }}>{doc.customerName}</div>
            {doc.customerPhone && <div style={{ color: muted }}>{doc.customerPhone}</div>}
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: t.table === 'plain' ? 'transparent' : t.accent + '14' }}>
              <th style={cell({ textAlign: 'left', color: muted, fontWeight: 600 })}>Item</th>
              <th style={cell({ textAlign: 'right', color: muted, fontWeight: 600 })}>Qty</th>
              <th style={cell({ textAlign: 'right', color: muted, fontWeight: 600 })}>Price</th>
              <th style={cell({ textAlign: 'right', color: muted, fontWeight: 600 })}>Total</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((it, i) => (
              <tr key={i} style={{ background: t.table === 'zebra' && i % 2 ? '#f6f7f5' : 'transparent' }}>
                <td style={cell()}>{it.description}{it.discount > 0 && <div style={{ fontSize: fs - 2, color: muted }}>Discount {fmt(it.discount, doc.currency)}</div>}</td>
                <td style={cell({ textAlign: 'right', whiteSpace: 'nowrap' })}>{it.quantity}</td>
                <td style={cell({ textAlign: 'right', whiteSpace: 'nowrap' })}>{Number(it.unitPrice).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                <td style={cell({ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600 })}>{Number(it.lineTotal).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 12, marginLeft: t.totals === 'panel' ? 0 : 'auto', width: t.totals === 'panel' ? '100%' : '65%', background: t.totals === 'panel' ? '#f6f7f5' : 'transparent', padding: t.totals === 'panel' ? 12 : 0, boxSizing: 'border-box', fontSize: fs }}>
          <Row l="Subtotal" v={fmt(doc.subtotal, doc.currency)} />
          {doc.discount > 0 && <Row l="Discount" v={`- ${fmt(doc.discount, doc.currency)}`} />}
          {doc.tax > 0 && <Row l="Tax" v={fmt(doc.tax, doc.currency)} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: t.id === 'bold' ? fs + 8 : fs + 3, color: t.accent, borderTop: `1px solid ${ink}`, marginTop: 6, paddingTop: 6 }}>
            <span>Total</span><span>{fmt(doc.total, doc.currency)}</span>
          </div>
          {showPaid && <Row l="Paid" v={fmt(doc.amountPaid ?? 0, doc.currency)} />}
          {showPaid && (doc.balance ?? 0) > 0 && <Row l="Balance due" v={fmt(doc.balance ?? 0, doc.currency)} bold />}
        </div>

        {doc.paymentInfo && doc.paymentInfo.length > 0 && (
          <div style={{ marginTop: 14, fontSize: fs - 1 }}>
            <div style={{ fontSize: fs - 2, color: muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>How to pay</div>
            {doc.paymentInfo.map((p, i) => <div key={i}>{p}</div>)}
          </div>
        )}
        {(doc.notes || doc.terms) && (
          <div style={{ marginTop: 12, fontSize: fs - 1, color: muted, lineHeight: 1.5 }}>
            {doc.notes && <div><b style={{ color: ink }}>Notes: </b>{doc.notes}</div>}
            {doc.terms && <div><b style={{ color: ink }}>Terms: </b>{doc.terms}</div>}
          </div>
        )}
        {doc.footer && <div style={{ marginTop: 12, textAlign: 'center', fontSize: fs - 1, color: muted }}>{doc.footer}</div>}
      </div>
      {/* ShopOS branding: a fixed part of every template. */}
      <div style={{ borderTop: `1px solid ${line}`, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 10, color: muted, background: '#fafbfa', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#146b4a" /><path d="M7 15.5c1 1.2 2.6 1.8 4.6 1.8 2.3 0 3.6-1 3.6-2.4 0-3.4-7.6-1.6-7.6-5.6C7.6 7.6 9.3 6.5 11.7 6.5c1.6 0 3 .5 4 1.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          <b style={{ color: ink, fontSize: 12 }}>ShopOS</b>
        </div>
        <div style={{ fontStyle: 'italic' }}>{bc.slogan}</div>
        <div>{[bc.phone, bc.email].filter(Boolean).join(' · ')}</div>
      </div>
    </div>
  );
});

function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: bold ? 700 : 400 }}><span style={{ color: '#5b655f' }}>{l}</span><span>{v}</span></div>;
}
