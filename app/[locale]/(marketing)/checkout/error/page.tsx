"use client";

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { XCircle } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';

export default function CheckoutErrorPage() {
    const t = useTranslations('checkout');

    return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
            <div className="max-w-md text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter mb-2">{t('error')}</h1>
                <p className="text-gray-400 text-sm mb-8">{t('errorDesc')}</p>

                <div className="flex flex-col gap-3">
                    <Link href="/academy">
                        <NeonButton variant="primary" className="w-full py-3">
                            {t('tryAgain')}
                        </NeonButton>
                    </Link>
                    <Link href="/dashboard" className="text-gray-500 text-sm hover:text-white transition-colors">
                        {t('goToDashboard')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
