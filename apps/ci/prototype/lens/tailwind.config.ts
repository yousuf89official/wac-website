import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        lens: {
          bg: '#0f172a',
          card: '#1e293b',
          'card-hover': '#334155',
          border: '#334155',
          'border-light': '#475569',
          accent: '#14b8a6',
          'accent-hover': '#0d9488',
          'accent-muted': 'rgba(20, 184, 166, 0.15)',
          text: '#f8fafc',
          'text-secondary': '#94a3b8',
          'text-muted': '#64748b',
          positive: '#22c55e',
          neutral: '#94a3b8',
          negative: '#ef4444',
          warning: '#f59e0b',
        },
      },
      animation: {
        counter: 'counter 1s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        counter: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
