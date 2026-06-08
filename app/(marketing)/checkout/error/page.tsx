"use client";

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';

export default function CheckoutErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
            <div className="max-w-md text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter mb-2">Payment Failed</h1>
                <p className="text-gray-400 text-sm mb-8">Something went wrong with your payment. Please try again.</p>

                <div className="flex flex-col gap-3">
                    <Link href="/academy">
                        <NeonButton variant="primary" className="w-full py-3">
                            Try Again
                        </NeonButton>
                    </Link>
                    <Link href="/dashboard" className="text-gray-500 text-sm hover:text-white transition-colors">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
