"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "wac-theme";

export function ThemeProvider({
    children,
    defaultTheme = "dark",
}: {
    children: React.ReactNode;
    defaultTheme?: Theme;
}) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme);

    useEffect(() => {
        const saved = (typeof window !== "undefined"
            ? (window.localStorage.getItem(STORAGE_KEY) as Theme | null)
            : null);
        const initial: Theme = saved ?? defaultTheme;
        setThemeState(initial);
        document.documentElement.dataset.theme = initial;
    }, [defaultTheme]);

    const persistAndApply = useCallback((next: Theme) => {
        setThemeState(next);
        document.documentElement.dataset.theme = next;
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // ignore quota / private mode
        }
    }, []);

    const setTheme = useCallback(
        (next: Theme) => {
            const supported =
                typeof document !== "undefined" &&
                "startViewTransition" in document;
            if (supported) {
                (document as Document & {
                    startViewTransition: (cb: () => void) => void;
                }).startViewTransition(() => persistAndApply(next));
            } else {
                persistAndApply(next);
            }
        },
        [persistAndApply]
    );

    const toggle = useCallback(
        () => setTheme(theme === "dark" ? "light" : "dark"),
        [setTheme, theme]
    );

    const value = useMemo(
        () => ({ theme, setTheme, toggle }),
        [theme, setTheme, toggle]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
    return ctx;
}

/* Inline script that runs BEFORE React hydration to set the
 * theme attribute on <html>, eliminating the flash-of-wrong-theme. */
export const themeBootScript = `
(function() {
  try {
    var saved = localStorage.getItem("${STORAGE_KEY}");
    var theme = saved || "dark";
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;
