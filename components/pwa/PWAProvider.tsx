// components/pwa/PWAProvider.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [installed, setInstalled]           = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => console.log('[SW] Registered:', reg.scope))
        .catch((err) => console.warn('[SW] Registration failed:', err));
    }

    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Track installation
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
    setShowBanner(false);
  }

  if (installed) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-[#13131e] border border-electric/30 rounded-2xl p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric to-neon flex items-center justify-center flex-shrink-0">
                <Smartphone size={22} className="text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-syne font-bold text-white text-sm">
                  Install DMN Solutions
                </p>
                <p className="text-white/50 text-xs font-inter mt-0.5 leading-relaxed">
                  Add to your home screen for faster access and offline support.
                </p>
              </div>

              {/* Close */}
              <button
                onClick={() => setShowBanner(false)}
                className="text-white/30 hover:text-white transition-colors flex-shrink-0 mt-0.5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-xs"
              >
                <Download size={13} /> Install App
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/50 font-syne font-semibold text-xs hover:text-white hover:border-white/20 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
