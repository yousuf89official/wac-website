// ── Colors ───────────────────────────────────
// Canonical hex values — use these in JS/TS.
// CSS components should use Tailwind classes (text-primary, bg-accent, etc.)
// which resolve to HSL vars in globals.css.

export const colors = {
    primary: "#00f0ff",       // cyan
    accent: "#b000ff",        // purple
    destructive: "#ff006e",   // pink
    background: "#0a0a0a",
    card: "#1a1a1a",
    cardAlt: "#111111",
    cardHover: "#2a2a2a",
    border: "rgba(255,255,255,0.1)",
    borderHover: "rgba(255,255,255,0.3)",
};

// ── Tailwind Gradient Classes ────────────────
export const gradients = {
    text: "bg-gradient-to-r from-[#00f0ff] via-[#b000ff] to-[#ff006e] bg-clip-text text-transparent",
    cta: "bg-gradient-to-r from-[#00f0ff] to-[#b000ff]",
    ctaHover: "bg-gradient-to-r from-[#b000ff] to-[#00f0ff]",
    glow: "bg-gradient-to-br from-primary/20 via-accent/10 to-transparent",
    card: "bg-gradient-to-br from-white/5 to-white/[0.02]",
};

// ── Glow Effects ─────────────────────────────
export const glows = {
    cyan: "shadow-[0_0_20px_rgba(0,240,255,0.3)]",
    purple: "shadow-[0_0_20px_rgba(176,0,255,0.3)]",
    pink: "shadow-[0_0_20px_rgba(255,0,110,0.3)]",
    cyanLg: "shadow-[0_0_40px_rgba(0,240,255,0.4)]",
};

// ── Glass Effect ─────────────────────────────
export const glass = "bg-white/5 backdrop-blur-xl border border-white/10";
export const glassHover = "bg-white/10 backdrop-blur-xl border border-white/20";

// ── Framer Motion Variants ───────────────────

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 },
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export const scaleOnHover = {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
};

export const sectionViewport = {
    once: true,
    margin: "-100px",
};

// ── Shared Section Styles ────────────────────
export const sectionPadding = "py-24 md:py-32";
export const sectionMaxWidth = "max-w-7xl mx-auto px-6";
export const cardBase =
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all duration-300";
