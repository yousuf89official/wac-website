/**
 * CI Tailwind config — Editorial Luxe (Phase 5).
 *
 * Semantic color tokens read from CSS vars defined in packages/ui/src/tokens.css
 * (imported via src/index.css). The same vars power WAC, so `bg-primary` /
 * `text-foreground` / `border-border` flip palettes via the data-theme switch.
 *
 * Legacy raw tokens (teal, slate, lens.*, surface-dark, etc.) intentionally
 * removed. Phase 5b/c agents sweep hardcoded `teal-`, `purple-`, `sky-`,
 * `bg-white/`, `bg-black/`, glass-blur classes to the semantic tokens above.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
    darkMode: ['selector', '[data-theme="dark"]'],
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
        '../../packages/ui/src/**/*.{ts,tsx}',
    ],
    theme: {
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

                // Raw palette references — for one-offs where a semantic token
                // doesn't fit. Mirrors WAC.
                ink: { DEFAULT: '#0A0A0A', 2: '#14110F' },
                cream: { DEFAULT: '#F5F1EA', 2: '#EAE3D6' },
                sienna: { DEFAULT: '#C8553D', soft: '#E07856' },
                sage: '#6B7F5F',
                goldenrod: '#D4A23A',
                plum: '#5B2A4A',
                fog: '#6B6661',
                mist: '#C9C2B8',

                // Brand-API kept (used by white-label portal for custom brand colors).
                // These continue to resolve at runtime from --brand-primary, which
                // a whitelabel CSS injection can override on .public-site root.
                brand: {
                    primary: 'var(--brand-primary, hsl(var(--primary)))',
                    secondary: 'var(--brand-secondary, hsl(var(--accent)))',
                    bg: 'var(--brand-bg, hsl(var(--background)))',
                    surface: 'var(--brand-surface, hsl(var(--card)))',
                    border: 'var(--brand-border, hsl(var(--border)))',
                },
            },
            fontFamily: {
                display: ['var(--font-display)', 'Georgia', 'serif'],
                serif: ['var(--font-serif)', 'Georgia', 'serif'],
                sans: ['var(--font-ui)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
            },
            fontSize: {
                '2xs': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.06em' }],
            },
            letterSpacing: {
                tightest: '-0.04em',
                tighter: '-0.025em',
                tight: '-0.015em',
                widest: '0.18em',
            },
            borderRadius: {
                DEFAULT: 'var(--radius)',
                lg: 'calc(var(--radius) + 6px)',
                xl: 'calc(var(--radius) + 12px)',
            },
            keyframes: {
                shimmer: { '100%': { transform: 'translateX(100%)' } },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-left': {
                    '0%': { opacity: '0', transform: 'translateX(-40px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'slide-in-right': {
                    '0%': { opacity: '0', transform: 'translateX(40px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'count-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.8' },
                },
                'drawer-in': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(12px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                shimmer: 'shimmer 2s infinite',
                'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
                'slide-in-left': 'slide-in-left 0.7s ease-out forwards',
                'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
                'scale-in': 'scale-in 0.5s ease-out forwards',
                'count-up': 'count-up 0.5s ease-out forwards',
                'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
                'drawer-in': 'drawer-in 0.3s ease-out forwards',
                'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
            },
            transitionTimingFunction: {
                editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },
    plugins: [],
};
