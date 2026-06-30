// components/share/ShareSiteModal.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { env } from '@/lib/env-check';

interface ShareSiteModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareSiteModal({ open, onClose }: ShareSiteModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const url = env.siteUrl; // Always points to the deployed Vercel URL

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 220,
      margin: 2,
      color: { dark: '#0d0d1a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).catch(() => toast.error('Failed to generate QR code'));
  }, [open, url]);

  function copyLink() {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'DMN Solutions Kenya', text: 'Check out DMN Solutions!', url });
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  }

  function downloadQr() {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'dmn-solutions-qr.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="relative w-full max-w-sm bg-[#13131e] border border-electric/30 rounded-3xl p-7 text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-white/35 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric to-neon flex items-center justify-center mx-auto mb-4 font-syne font-black text-white text-lg">
              D
            </div>

            <h3 className="font-syne font-extrabold text-white text-lg mb-1">Share DMN Solutions</h3>
            <p className="text-white/40 text-sm font-inter mb-6">Scan the QR code or share the link</p>

            <div className="bg-white rounded-2xl p-4 inline-block mb-5">
              <canvas ref={canvasRef} />
            </div>

            <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-xl px-3 py-2.5 mb-4">
              <p className="text-white/55 text-xs font-inter truncate">{url}</p>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-white/[0.08] text-white/65 font-syne font-bold text-xs hover:text-white hover:border-white/20 transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button
                onClick={nativeShare}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-xs"
              >
                <Share2 size={14} /> Share
              </button>
            </div>

            <button
              onClick={downloadQr}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-white/15 text-white/40 font-syne font-semibold text-xs hover:text-white/70 transition-colors"
            >
              <Download size={13} /> Download QR Code
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Trigger button + modal bundled together for easy drop-in use ─────────────
export function ShareSiteButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Share2 size={15} /> Share Site
      </button>
      <ShareSiteModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
