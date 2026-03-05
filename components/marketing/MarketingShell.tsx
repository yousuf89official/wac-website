"use client";

import { AppProvider } from '@/contexts/AppContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';
import NewsletterPopup from '@/components/marketing/NewsletterPopup';

export default function MarketingShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppProvider>
            <div className="dark">
                <div className="min-h-screen bg-[#0a0a0a]">
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </div>
                <ChatWidget />
                <NewsletterPopup />
            </div>
        </AppProvider>
    );
}
