// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne:  ['var(--font-syne)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        mono:  ['var(--font-inter)', 'monospace'],
      },
      colors: {
        electric: '#2563eb',
        neon:     '#06b6d4',
        purple:   '#7c3aed',
        green:    '#10b981',
        rose:     '#f43f5e',
        surface:  '#07070f',
        card:     '#13131e',
        border:   'rgba(255,255,255,0.07)',
        foreground: '#e0e0f0',
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #2563eb, #06b6d4)',
        'gradient-hero':     'linear-gradient(135deg, #07070f 0%, #0d0d20 100%)',
      },
      animation: {
        'neon-breath': 'neon-breath 2.4s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
      },
      keyframes: {
        'neon-breath': {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 10px rgba(37,99,235,0.3)' },
          '50%':      { opacity: '1',   boxShadow: '0 0 24px rgba(37,99,235,0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)'   },
          '50%':      { transform: 'translateY(-10px)'  },
        },
      },
      boxShadow: {
        glow:        '0 0 20px rgba(37,99,235,0.4)',
        'glow-neon': '0 0 20px rgba(6,182,212,0.4)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
      },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
    },
  },
  plugins: [],
};

export default config;
