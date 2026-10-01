const TONES = ['#146b4a', '#0b3a8c', '#7a4b0a', '#6b2c7a', '#8a2a2a', '#0e6f7a', '#4a5568'];
const toneFor = (name: string) => { let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0; return TONES[h % TONES.length]; };
/** Round initials avatar with a stable colour per name. */
export function PersonAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const l = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  return <span aria-hidden="true" className="rounded-full shrink-0 inline-flex items-center justify-center text-white font-semibold" style={{ width: size, height: size, background: toneFor(name), fontSize: Math.round(size * 0.38) }}>{l}</span>;
}
