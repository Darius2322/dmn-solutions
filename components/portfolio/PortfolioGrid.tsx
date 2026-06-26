// components/portfolio/PortfolioGrid.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ExternalLink, Globe, Smartphone, ShoppingBag, BarChart2, Palette, Cloud, Wifi, Zap } from 'lucide-react';
import type { Portfolio } from '@/lib/supabase/types';

const CATEGORIES = [
  { key: 'all',       label: 'All',        icon: Globe },
  { key: 'web',       label: 'Web',         icon: Globe },
  { key: 'mobile',    label: 'Mobile',      icon: Smartphone },
  { key: 'ecommerce', label: 'E-Commerce',  icon: ShoppingBag },
  { key: 'marketing', label: 'Marketing',   icon: BarChart2 },
  { key: 'design',    label: 'UI/UX',       icon: Palette },
  { key: 'cloud',     label: 'Cloud',       icon: Cloud },
  { key: 'wifi',      label: 'Networks',    icon: Wifi },
  { key: 'electrical',label: 'Electrical',  icon: Zap },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

interface PortfolioGridProps {
  items: Portfolio[];
}

function PortfolioCard({ item, index }: { item: Portfolio; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.5 } }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group rounded-2xl overflow-hidden border border-white/[0.06] bg-[#13131e] cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Image / Placeholder */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-electric/20 to-neon/10">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe size={40} className="text-electric/30" />
          </div>
        )}
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-[#07070f] via-[#07070f]/40 to-transparent"
          animate={{ opacity: hovered ? 1 : 0.6 }}
        />
        {/* Featured badge */}
        {item.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[0.68rem] font-syne font-bold bg-amber-500/90 text-black">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-syne font-bold text-white text-base mb-1.5 truncate">{item.title}</h3>
        <p className="text-white/50 text-sm font-inter leading-relaxed line-clamp-2 mb-4">
          {item.description || 'A premium DMN Solutions project.'}
        </p>

        {/* Tags */}
        {item.tags && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.split(',').slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-md text-[0.68rem] font-syne font-semibold bg-electric/10 text-electric/80">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {item.url && (
          <motion.a
            href={item.url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-syne font-bold text-neon hover:text-white transition-colors"
            whileHover={{ x: 3 }}
          >
            <ExternalLink size={13} /> View Live
          </motion.a>
        )}
      </div>

      {/* Border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ boxShadow: hovered ? '0 0 0 1px rgba(37,99,235,0.5), 0 8px 32px rgba(37,99,235,0.15)' : '0 0 0 0 transparent' }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [active, setActive] = useState<CategoryKey>('all');

  const filtered = active === 'all'
    ? items
    : items.filter((i) => i.category === active);

  return (
    <section id="portfolio" className="py-24 px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full border border-electric/30 bg-electric/10 text-electric text-xs font-syne font-semibold tracking-wider mb-4">
          OUR WORK
        </span>
        <h2 className="font-syne font-extrabold text-4xl sm:text-5xl text-white mb-4">
          Portfolio <span className="gradient-text">Projects</span>
        </h2>
        <p className="text-white/50 max-w-xl mx-auto font-inter">
          From scrappy startups to enterprise-grade platforms — every project crafted with precision.
        </p>
      </div>

      {/* Filter tabs */}
      <LayoutGroup>
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setActive(key as CategoryKey)}
              className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-syne font-semibold transition-colors ${
                active === key ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {active === key && (
                <motion.span
                  layoutId="portfolio-filter-pill"
                  className="absolute inset-0 rounded-xl bg-electric/20 border border-electric/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={14} />
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </LayoutGroup>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <PortfolioCard key={item.id} item={item} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 text-white/30 font-inter"
        >
          No projects in this category yet.
        </motion.div>
      )}
    </section>
  );
}
