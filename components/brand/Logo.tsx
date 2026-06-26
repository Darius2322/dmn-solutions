// components/brand/Logo.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 44, showText = true, className = '' }: LogoProps) {
  const stream = {
    rest:  { pathLength: 0.7, opacity: 0.85 },
    hover: { pathLength: 1,   opacity: 1 },
  };
  const glow = {
    rest:  { filter: 'drop-shadow(0 0 4px rgba(37,99,235,0.5))' },
    hover: { filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.9)) drop-shadow(0 0 24px rgba(124,58,237,0.5))' },
  };

  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        style={{ width: size, height: size }}
        className="relative flex-shrink-0"
      >
        <motion.svg
          width={size} height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          variants={glow}
          transition={{ duration: 0.35 }}
        >
          <defs>
            <linearGradient id="lg-electric" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#2563eb" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="lg-purple" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="lg-neon" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background tile */}
          <motion.rect
            x="2" y="2" width="60" height="60" rx="14"
            fill="url(#lg-electric)"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />

          {/* Stream 1 — Software ribbon (Electric Blue) */}
          <motion.path
            d="M12 20 L20 12 L44 12 L52 20 L52 32 L44 40 L32 40 L20 52 L12 52 L12 20Z"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            fill="none" filter="url(#glow-filter)"
            variants={stream}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />

          {/* Stream 2 — Network ribbon (Neon Cyan) */}
          <motion.path
            d="M22 12 L42 12 L52 22 L52 42 L42 52 L22 52"
            stroke="rgba(6,182,212,0.8)" strokeWidth="2" strokeLinecap="round"
            fill="none"
            variants={stream}
            transition={{ duration: 0.5, delay: 0.06, ease: 'easeInOut' }}
          />

          {/* Stream 3 — Electrical ribbon (Cyber Purple) */}
          <motion.path
            d="M16 16 L32 8 L48 16 L56 32 L48 48 L32 56 L16 48 L8 32 Z"
            stroke="rgba(124,58,237,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            fill="none"
            variants={stream}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeInOut' }}
          />

          {/* DMN Letterform core */}
          <motion.text
            x="32" y="43"
            textAnchor="middle"
            fontFamily="Arial Black, sans-serif"
            fontWeight="900"
            fontSize="22"
            fill="white"
            variants={{ rest: { opacity: 1 }, hover: { opacity: 0.92 } }}
          >
            D
          </motion.text>
        </motion.svg>
      </motion.div>

      {showText && (
        <motion.div
          className="flex flex-col leading-tight"
          variants={{ rest: {}, hover: {} }}
          initial="rest"
          whileHover="hover"
        >
          <motion.span
            className="font-syne font-bold text-white text-[1.05rem] tracking-tight"
            variants={{
              rest:  { letterSpacing: '-0.02em' },
              hover: { letterSpacing: '0.01em' },
            }}
            transition={{ duration: 0.3 }}
          >
            DMN Solutions
          </motion.span>
          <span className="text-[0.65rem] text-white/60 font-inter">
            Innovative IT Solutions, Kenya
          </span>
        </motion.div>
      )}
    </Link>
  );
}
