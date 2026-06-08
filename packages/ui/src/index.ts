// Barrel — every consumer can `import { FadeUp } from "@wac/ui"`
// Components also exported individually via "./*" subpath for tree-shaking
// e.g. `import { FadeUp } from "@wac/ui/FadeUp"`.

export { FadeUp } from "./FadeUp";
export { SectionFrame } from "./SectionFrame";
export { PageHero } from "./PageHero";
export { CTAFinale } from "./CTAFinale";
export { ThemeProvider, useTheme, themeBootScript } from "./theme-provider";
export { ThemeSwitcher } from "./theme-switcher";
export { cn } from "./utils";
