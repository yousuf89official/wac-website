import React, { useState } from 'react';
import NotificationModal from '../ui/NotificationModal';
import NeonButton from '../ui/NeonButton';
import { useNewsletterPopup } from '@/hooks/useNewsletterPopup';

const NewsletterPopup: React.FC = () => {
    const { isOpen, dismiss, subscribe } = useNewsletterPopup();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: 'Newsletter Subscriber',
                    lead_type: 'newsletter',
                    message: 'Subscribed via Popup'
                })
            });
            subscribe(); // set persistence and close
        } catch (error) {
            console.error('Subscription failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <NotificationModal
            isOpen={isOpen}
            onClose={dismiss}
            title="Unlock Growth Insights"
            type="info"
        >
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
                <p className="text-gray-400 text-sm leading-relaxed text-center">
                    Join 10,000+ marketers getting weekly tips on scaling their brand.
                </p>

                <input
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#1a1a1a] text-white border border-[#333] rounded-lg px-4 py-3 focus:outline-none focus:border-[#00f0ff] transition-colors"
                />

                <NeonButton
                    variant="primary"
                    className="w-full justify-center py-3"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Joining...' : 'Get Access Now'}
                </NeonButton>

                <button
                    type="button"
                    onClick={dismiss}
                    className="text-gray-500 text-xs hover:text-white transition-colors"
                >
                    No thanks, I prefer slow growth.
                </button>
            </form>
        </NotificationModal>
    );
};

export default NewsletterPopup;
