"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import DynamicThemeProvider from "@/components/DynamicThemeProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import { HelmetProvider } from 'react-helmet-async';
// import ErrorBoundary from '@/components/ErrorBoundary'; // Next.js uses error.tsx, but we can reuse for component level if needed. 
// Skipping manual ErrorBoundary in providers for now, relying on Global Error.

import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ThemeProvider defaultTheme="dark">
            <QueryClientProvider client={queryClient}>
                <DynamicThemeProvider>
                    <NotificationProvider>
                        <HelmetProvider>
                            <TooltipProvider>
                                {children}
                            </TooltipProvider>
                            <Toaster />
                            <Sonner />
                        </HelmetProvider>
                    </NotificationProvider>
                </DynamicThemeProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
