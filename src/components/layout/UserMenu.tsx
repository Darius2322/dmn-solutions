import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Coffee, LogOut, ShieldCheck, UserCircle } from 'lucide-react';

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || 'U';
}

interface Props {
  name: string;
  roleLabel: string;
  avatarUrl?: string | null;
  canBreak: boolean;
  onBreak: () => void;
  onSignOut: () => void;
}

/** Name + avatar in the top bar. The avatar opens the account menu: take a break (locks the screen), security
 * settings, and sign out. */
export function UserMenu({ name, roleLabel, avatarUrl, canBreak, onBreak, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('touchstart', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const item = 'w-full flex items-center gap-3 px-3 min-h-[46px] text-sm text-left hover:bg-slate-50 active:bg-slate-100';
  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      <div className="hidden md:block text-right leading-tight min-w-0 max-w-[10rem]">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-[11px] text-slate-500 capitalize truncate">{roleLabel}</div>
      </div>
      <button onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={`Account menu for ${name}`}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-field-600 text-white text-xs font-semibold ring-2 ring-transparent hover:ring-field-600/30 focus-visible:ring-field-600/50">
        {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials(name)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-60 bg-paper-raised border border-slate-200 rounded-card shadow-lg overflow-hidden z-50">
          <div className="px-3 py-3 border-b border-slate-200 md:hidden">
            <div className="text-sm font-medium truncate">{name}</div>
            <div className="text-xs text-slate-500 capitalize">{roleLabel}</div>
          </div>
          <NavLink role="menuitem" to="/profile" className={item} onClick={() => setOpen(false)}><UserCircle className="w-4 h-4 text-slate-500" /> My profile</NavLink>
          {canBreak && <button role="menuitem" className={item} onClick={() => { setOpen(false); onBreak(); }}><Coffee className="w-4 h-4 text-slate-500" /> Take a break</button>}
          <NavLink role="menuitem" to="/security" className={item} onClick={() => setOpen(false)}><ShieldCheck className="w-4 h-4 text-slate-500" /> Security</NavLink>
          <button role="menuitem" className={`${item} border-t border-slate-200 text-rust-600`} onClick={() => { setOpen(false); onSignOut(); }}><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      )}
    </div>
  );
}
