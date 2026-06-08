"use client";

import { ReactLenis } from "lenis/react";

export function MarketingLenis({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root options={{ autoRaf: true }}>
            {children}
        </ReactLenis>
    );
}
