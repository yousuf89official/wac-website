"use client";

import Link from 'next/link';
import { Clock } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';

export default function CheckoutPendingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
            <div className="max-w-md text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-yellow-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter mb-2">Payment Pending</h1>
                <p className="text-gray-400 text-sm mb-8">We&apos;re waiting for your payment to be confirmed. This usually takes a few minutes.</p>

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard/orders">
                        <NeonButton variant="primary" className="w-full py-3">
                            Go to Dashboard
                        </NeonButton>
                    </Link>
                    <Link href="/academy" className="text-gray-500 text-sm hover:text-white transition-colors">
                        Back to Academy
                    </Link>
                </div>
            </div>
        </div>
    );
}
