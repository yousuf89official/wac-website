"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeSwitcher({ className = "" }: { className?: string }) {
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`group inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-background-2 transition-colors hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        >
            <Sun
                className={`h-4 w-4 transition-transform duration-300 ease-editorial ${
                    isDark
                        ? "scale-0 -rotate-90 opacity-0"
                        : "scale-100 rotate-0 opacity-100"
                } absolute`}
                strokeWidth={1.5}
            />
            <Moon
                className={`h-4 w-4 transition-transform duration-300 ease-editorial ${
                    isDark
                        ? "scale-100 rotate-0 opacity-100"
                        : "scale-0 rotate-90 opacity-0"
                } absolute`}
                strokeWidth={1.5}
            />
        </button>
    );
}
