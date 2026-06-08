'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { MasterDataProvider } from '@/contexts/MasterDataContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import { useState } from 'react';

import { ModalProvider } from '@/contexts/ModalContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
// @wac/ui light/dark mode (drives the `data-theme` attribute that index.css
// reads). Distinct from CI's ThemeContext above, which manages whitelabel
// brand colors. The shared <ThemeSwitcher/> in the sidebar needs this provider.
import { ThemeProvider as WacThemeProvider } from '@wac/ui/theme-provider';

import { DevConsoleProvider } from '@/contexts/DevConsoleContext';
import { DevConsole } from '@/components/ui/DevConsole';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LayoutProvider } from '@/contexts/LayoutContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <LoadingProvider>
            <LayoutProvider>
                <DevConsoleProvider>
                    <ErrorProvider>
                        <GlobalErrorBoundary>
                            <ModalProvider>
                                <QueryClientProvider client={queryClient}>
                                    <AuthProvider>
                                        <WacThemeProvider defaultTheme="light">
                                            <ThemeProvider>
                                                <MasterDataProvider>
                                                    <ProgressBar />
                                                    {children}
                                                    <DevConsole />
                                                </MasterDataProvider>
                                            </ThemeProvider>
                                        </WacThemeProvider>
                                    </AuthProvider>
                                </QueryClientProvider>
                            </ModalProvider>
                        </GlobalErrorBoundary>
                    </ErrorProvider>
                </DevConsoleProvider>
            </LayoutProvider>
        </LoadingProvider>
    );
}
