// components/sections/ServicesSection.tsx
'use client';
import { motion } from 'framer-motion';
import { Code2, Smartphone, ShoppingBag, BarChart2, Palette, Server, Wifi, Zap, ArrowRight } from 'lucide-react';
import { env } from '@/lib/env-check';
import type { Service } from '@/lib/supabase/types';

const ICON_MAP: Record<string, React.ElementType> = {
  'fas fa-code':         Code2,
  'fas fa-mobile-alt':   Smartphone,
  'fas fa-shopping-bag': ShoppingBag,
  'fas fa-chart-line':   BarChart2,
  'fas fa-paint-brush':  Palette,
  'fas fa-server':       Server,
  'fas fa-wifi':         Wifi,
  'fas fa-bolt':         Zap,
};

const GRADIENT_MAP: Record<number, string> = {
  0: 'from-electric/20 to-neon/10',
  1: 'from-purple-600/20 to-electric/10',
  2: 'from-neon/20 to-green-500/10',
  3: 'from-amber-500/20 to-orange-500/10',
  4: 'from-pink-500/20 to-rose-500/10',
  5: 'from-indigo-500/20 to-purple-500/10',
  6: 'from-teal-500/20 to-neon/10',
  7: 'from-yellow-500/20 to-amber-500/10',
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const IconComponent = ICON_MAP[service.icon ?? ''] ?? Code2;
  const grad = GRADIENT_MAP[index % 8];
  const features = Array.isArray(service.features) ? service.features as string[] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl bg-gradient-to-br ${grad} border border-white/[0.06] p-6 overflow-hidden group`}
    >
      {/* Glow orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-electric/10 blur-2xl group-hover:bg-electric/20 transition-colors duration-500" />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-electric/15 flex items-center justify-center mb-5">
          <IconComponent size={22} className="text-electric" />
        </div>

        <h3 className="font-syne font-bold text-white text-lg mb-2">{service.title}</h3>
        <p className="text-white/55 text-sm font-inter leading-relaxed mb-4">
          {service.description}
        </p>

        {features.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {features.slice(0, 4).map((f) => (
              <li key={f} className="flex items-center gap-2 text-white/50 text-xs font-inter">
                <span className="w-1 h-1 rounded-full bg-neon flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between">
          {service.price_label && (
            <span className="text-green-400 text-xs font-syne font-bold">
              {service.price_label}
            </span>
          )}
          <motion.a
            href={`https://wa.me/${env.whatsappNumber}?text=Hi+DMN+Solutions,+I'm+interested+in+${encodeURIComponent(service.title)}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-syne font-bold text-electric hover:text-neon transition-colors ml-auto"
            whileHover={{ x: 3 }}
          >
            Request Now <ArrowRight size={13} />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

export function ServicesSection({ services }: { services: Service[] }) {
  return (
    <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full border border-electric/30 bg-electric/10 text-electric text-xs font-syne font-semibold tracking-wider mb-4">
          WHAT WE DO
        </span>
        <h2 className="font-syne font-extrabold text-4xl sm:text-5xl text-white mb-4">
          Services Built for <span className="gradient-text">Growth</span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto font-inter">
          From pixel-perfect UI to production-grade backends — we deliver end-to-end digital solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {services.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
      </div>

      {services.length === 0 && (
        <div className="text-center py-16 text-white/25 font-inter">Services loading…</div>
      )}
    </section>
  );
}
