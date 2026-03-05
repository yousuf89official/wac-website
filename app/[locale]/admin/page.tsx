import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import AdminPage from '@/components/pages/AdminPage';

export const metadata: Metadata = {
    title: "Admin Dashboard",
    robots: { index: false, follow: false },
};

export default async function Page({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <AdminPage />;
}
