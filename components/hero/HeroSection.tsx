// components/hero/HeroSection.tsx
'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { env } from '@/lib/env-check';

const Hero3D = dynamic(() => import('./Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-48 h-48 rounded-full border border-electric/20 animate-pulse" />
    </div>
  ),
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grid-bg">
      {/* 3D canvas */}
      <div className="absolute right-0 top-0 w-full md:w-[55%] h-full opacity-70 md:opacity-100">
        <Hero3D />
      </div>

      {/* Radial gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07070f] via-[#07070f]/80 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-electric/30 bg-electric/10 text-electric text-xs font-syne font-semibold mb-6 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            NAIROBI-BASED TECH COMPANY
          </motion.div>

          <motion.h1 variants={item} className="font-syne font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
            Building Digital
            <br />
            Products That
            <br />
            <span className="gradient-text">Actually Work</span>
          </motion.h1>

          <motion.p variants={item} className="text-white/65 text-lg font-inter leading-relaxed mb-10 max-w-md">
            We design and develop high-performance web apps, e-commerce platforms,
            and custom software tailored for Kenyan businesses and beyond.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-4">
            <motion.a
              href={`https://wa.me/${env.whatsappNumber}?text=Hello+DMN+Solutions`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-syne font-bold text-sm shadow-lg"
              whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(37,99,235,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              <MessageCircle size={17} /> Start a Project
            </motion.a>

            <motion.a
              href="#portfolio"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/15 text-white/80 font-syne font-semibold text-sm backdrop-blur-sm"
              whileHover={{ borderColor: 'rgba(37,99,235,0.6)', color: 'white' }}
              whileTap={{ scale: 0.97 }}
            >
              View Our Work <ArrowRight size={16} />
            </motion.a>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={item} className="flex gap-8 mt-14 pt-8 border-t border-white/[0.06]">
            {[['50+', 'Projects Delivered'], ['30+', 'Happy Clients'], ['2+', 'Years Experience']].map(([n, l]) => (
              <div key={l}>
                <div className="font-syne font-black text-2xl gradient-text">{n}</div>
                <div className="text-white/45 text-xs font-inter mt-0.5">{l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
