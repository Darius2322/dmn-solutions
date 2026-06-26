// components/icons/SpringIcon.tsx
'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SpringIconProps {
  icon: LucideIcon;
  label?: string;
  size?: number;
  color?: string;
  glowColor?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SpringIcon({
  icon: Icon,
  label,
  size = 20,
  color = '#60a5fa',
  glowColor = 'rgba(37,99,235,0.5)',
  active = false,
  onClick,
  className = '',
}: SpringIconProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  // Spring physics
  const springConfig = { stiffness: 400, damping: 10 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  const scale = useSpring(1, { stiffness: 300, damping: 15 });

  const rotateX = useTransform(y, [-20, 20], [8, -8]);
  const rotateY = useTransform(x, [-20, 20], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    x.set(e.clientX - cx);
    y.set(e.clientY - cy);
  }

  function handleMouseLeave() {
    x.set(0); y.set(0); scale.set(1);
    setHovered(false);
  }

  function handleMouseEnter() {
    scale.set(1.15);
    setHovered(true);
  }

  const Tag = onClick ? motion.button : motion.div;

  return (
    <Tag
      ref={onClick ? ref as React.RefObject<HTMLButtonElement> : undefined}
      onClick={onClick}
      onMouseMove={onClick ? handleMouseMove : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, rotateX, rotateY, scale, transformStyle: 'preserve-3d' } as object}
      className={`relative inline-flex flex-col items-center justify-center gap-1.5
        cursor-pointer select-none outline-none ${className}`}
      aria-label={label}
    >
      {/* Ambient glow behind active icons */}
      {(active || hovered) && (
        <motion.span
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: glowColor }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: active ? 1 : 0.6, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <motion.span
        className="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl"
        style={{
          background: hovered || active
            ? `rgba(37,99,235,0.15)`
            : 'transparent',
          border: active
            ? `1px solid ${color}40`
            : '1px solid transparent',
        }}
        animate={active ? { boxShadow: `0 0 12px ${glowColor}` } : { boxShadow: 'none' }}
        transition={{ duration: 0.25 }}
      >
        <Icon
          size={size}
          style={{ color: hovered || active ? color : 'rgba(255,255,255,0.6)' }}
        />
      </motion.span>

      {label && (
        <motion.span
          className="text-[0.65rem] font-syne font-semibold tracking-wide"
          style={{ color: hovered || active ? color : 'rgba(255,255,255,0.45)' }}
          animate={{ y: hovered ? -1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          {label}
        </motion.span>
      )}
    </Tag>
  );
}

// ── Nav link with spring icon ─────────────────────────────────────────────────
interface NavIconLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}
export function NavIconLink({ href, icon, label, active }: NavIconLinkProps) {
  return (
    <a href={href} className="group">
      <SpringIcon icon={icon} label={label} active={active} size={18} />
    </a>
  );
}
