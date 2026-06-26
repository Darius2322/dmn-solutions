// components/layout/Navbar.tsx
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { getServerUserWithProfile } from '@/lib/supabase/server';
import { NavActions } from './NavActions';

const LINKS = [
  { href: '#services',  label: 'Services'  },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#feedback',  label: 'Reviews'   },
];

export async function Navbar() {
  const { user, profile } = await getServerUserWithProfile();
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 border-b border-white/[0.05] backdrop-blur-xl bg-[#07070f]/80">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Logo size={36} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <a key={href} href={href}
              className="px-4 py-2 rounded-xl text-white/55 hover:text-white hover:bg-white/[0.05] font-syne font-semibold text-sm transition-colors">
              {label}
            </a>
          ))}
          {isAdmin && (
            <Link href="/admin"
              className="px-4 py-2 rounded-xl text-electric/80 hover:text-electric hover:bg-electric/10 font-syne font-semibold text-sm transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right actions (client) */}
        <NavActions user={user} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
