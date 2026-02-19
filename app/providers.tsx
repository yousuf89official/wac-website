"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import DynamicThemeProvider from "@/components/DynamicThemeProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ReactLenis } from "lenis/react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ThemeProvider defaultTheme="dark">
            <QueryClientProvider client={queryClient}>
                <DynamicThemeProvider>
                    <NotificationProvider>
                        <ReactLenis root options={{ autoRaf: true }}>
                            <TooltipProvider>
                                {children}
                            </TooltipProvider>
                        </ReactLenis>
                        <Toaster />
                        <Sonner />
                    </NotificationProvider>
                </DynamicThemeProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
