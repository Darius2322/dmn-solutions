// app/403/page.tsx
import Link from 'next/link';
export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-7xl mb-6">🔒</div>
        <h1 className="font-syne font-black text-3xl text-white mb-3">Access Denied</h1>
        <p className="text-white/45 font-inter text-sm mb-8">You don&apos;t have permission to view this page. Admin access required.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
