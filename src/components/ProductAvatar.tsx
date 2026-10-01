import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';

const TONES = ['#146b4a', '#0b3a8c', '#7a4b0a', '#6b2c7a', '#8a2a2a', '#0e6f7a', '#4a5568'];
function toneFor(name: string) { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0; return TONES[h % TONES.length]; }

/** Product picture, or the product's initials on a stable colour when it has none. */
export function ProductAvatar({ name, src, size = 40, className = '' }: { name: string; src?: string | null; size?: number; className?: string }) {
  const letters = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  return src
    ? <img src={src} alt="" loading="lazy" width={size} height={size} className={`rounded-lg object-cover shrink-0 bg-slate-100 ${className}`} style={{ width: size, height: size }} />
    : <span aria-hidden="true" className={`rounded-lg shrink-0 flex items-center justify-center text-white font-semibold ${className}`} style={{ width: size, height: size, background: toneFor(name), fontSize: Math.round(size * 0.38) }}>{letters}</span>;
}

/** Shrinks a photo to a small square JPEG data URL (~6–15 KB). Stored on the product itself, so it works offline,
 * syncs with the product, and never needs a separate upload step. */
export async function compressToAvatar(file: File, px = 192): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Choose a JPG, PNG or WebP picture.');
  if (file.size > 8 * 1024 * 1024) throw new Error('That picture is too large. Choose one under 8 MB.');
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement('canvas'); canvas.width = px; canvas.height = px;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Could not process the picture.');
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, px, px);
  bmp.close?.();
  let q = 0.8, out = canvas.toDataURL('image/jpeg', q);
  while (out.length > 28000 && q > 0.4) { q -= 0.1; out = canvas.toDataURL('image/jpeg', q); }
  return out;
}

export function ProductImagePicker({ name, value, onChange }: { name: string; value: string | null; onChange: (v: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  async function pick(f?: File | null) {
    if (!f) return; setError(null);
    try { onChange(await compressToAvatar(f)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not use that picture.'); }
  }
  return (
    <div className="flex items-center gap-3">
      <ProductAvatar name={name || 'Product'} src={value} size={64} />
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => input.current?.click()} className="btn-secondary min-h-[40px] px-3 text-sm flex items-center gap-1.5"><Camera className="w-4 h-4" /> {value ? 'Change picture' : 'Add picture'}</button>
          {value && <button type="button" onClick={() => onChange(null)} className="min-h-[40px] px-3 text-sm text-slate-500 hover:text-rust-600 flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> Remove</button>}
        </div>
        {error && <p role="alert" className="text-xs text-rust-600 mt-1">{error}</p>}
        <p className="text-[11px] text-slate-500 mt-1">Optional. Square pictures look best.</p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" capture={undefined} className="hidden" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </div>
  );
}
