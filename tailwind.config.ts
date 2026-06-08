import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.5rem', md: '3rem', lg: '5rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: {
          DEFAULT: 'hsl(var(--background))',
          2: 'hsl(var(--background-2))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          soft: 'hsl(var(--foreground-soft))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',

        // Raw palette — for one-off references when semantic tokens don't fit
        ink: { DEFAULT: '#0A0A0A', 2: '#14110F' },
        cream: { DEFAULT: '#F5F1EA', 2: '#EAE3D6' },
        sienna: { DEFAULT: '#C8553D', soft: '#E07856' },
        sage: '#6B7F5F',
        goldenrod: '#D4A23A',
        plum: '#5B2A4A',
        fog: '#6B6661',
        mist: '#C9C2B8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Editorial type scale — 1.333 modular, with display sizes that push hard
        '2xs': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.06em' }],
        xs: ['0.75rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.55' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        '4xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        '5xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        '6xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        '7xl': ['6rem', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        '8xl': ['8rem', { lineHeight: '0.9', letterSpacing: '-0.035em' }],
        '9xl': ['11rem', { lineHeight: '0.85', letterSpacing: '-0.04em' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
        tight: '-0.015em',
        editorial: '-0.005em',
        normal: '0',
        wide: '0.025em',
        widest: '0.18em',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: 'var(--radius)',
        md: 'calc(var(--radius) + 2px)',
        lg: 'calc(var(--radius) + 6px)',
        xl: 'calc(var(--radius) + 12px)',
        full: '9999px',
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.25s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-out',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        marquee: 'marquee 30s linear infinite',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      typography: {
        DEFAULT: { css: { maxWidth: 'none' } },
      },
    },
  },
  plugins: [animate, typography],
} satisfies Config;
