// app/error.tsx
'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="font-syne font-black text-2xl text-white mb-2">Something went wrong</h1>
        <p className="text-white/45 font-inter text-sm mb-6">{error.message || 'An unexpected error occurred. Please try again.'}</p>
        <button onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm">
          <RefreshCw size={15} /> Try Again
        </button>
      </motion.div>
    </div>
  );
}
