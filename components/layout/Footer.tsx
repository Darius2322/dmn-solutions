// components/layout/Footer.tsx
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { env } from '@/lib/env-check';

const SERVICE_LINKS = [
  'Web Development', 'Mobile Apps', 'E-commerce', 'UI/UX Design', 'Cloud & SaaS',
];
const COMPANY_LINKS = [
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#feedback',  label: 'Reviews'   },
  { href: '#services',  label: 'Services'  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/[0.05] bg-[#0a0a14]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo size={40} />
            <p className="text-white/45 text-sm font-inter leading-relaxed mt-4 max-w-sm">
              We design and build high-performance digital products — web platforms,
              mobile apps, e-commerce, networks, and electrical solutions — for businesses across Kenya.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-electric hover:bg-electric/10 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-syne font-bold text-white text-sm mb-4">Services</h4>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((s) => (
                <li key={s}>
                  <a href="#services" className="text-white/45 text-sm font-inter hover:text-electric transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-syne font-bold text-white text-sm mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-white/45 text-sm font-inter">
                <MapPin size={15} className="text-electric flex-shrink-0 mt-0.5" />
                Nairobi, Kenya
              </li>
              <li className="flex items-start gap-2.5 text-white/45 text-sm font-inter">
                <Phone size={15} className="text-electric flex-shrink-0 mt-0.5" />
                <a href={`https://wa.me/${env.whatsappNumber}`} target="_blank" rel="noreferrer" className="hover:text-electric transition-colors">
                  +{env.whatsappNumber}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/45 text-sm font-inter">
                <Mail size={15} className="text-electric flex-shrink-0 mt-0.5" />
                <a href="mailto:dmnsolutions63@gmail.com" className="hover:text-electric transition-colors">
                  dmnsolutions63@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.05] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs font-inter">
            © {year} DMN Solutions Kenya. All rights reserved.
          </p>
          <div className="flex gap-4">
            {COMPANY_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="text-white/30 text-xs font-inter hover:text-white/60 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
