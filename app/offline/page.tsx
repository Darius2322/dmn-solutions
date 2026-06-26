// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {/* Animated wifi icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-electric/10 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-[#13131e] border border-white/[0.08] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="#2563eb" />
            </svg>
          </div>
        </div>

        <h1 className="font-syne font-black text-2xl text-white mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-white/45 font-inter text-sm leading-relaxed mb-8">
          No internet connection detected. Check your connection and try again.
          Some pages may still be available from cache.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm"
          >
            Try Again
          </button>
          <a
            href="/"
            className="block w-full py-3.5 rounded-xl border border-white/[0.08] text-white/60 font-syne font-semibold text-sm text-center hover:text-white hover:border-white/20 transition-colors"
          >
            Go to Homepage
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.05]">
          <p className="text-white/25 text-xs font-inter">
            Need urgent help?{' '}
            <a
              href="https://wa.me/254110554040"
              className="text-electric hover:text-neon transition-colors"
            >
              WhatsApp us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
