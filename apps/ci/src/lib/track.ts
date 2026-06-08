'use client';

import { trackEvent } from '@/app/actions/tracking';

type EventName =
    | 'cta_click' | 'form_view' | 'form_start' | 'form_submit'
    | 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_100'
    | 'outbound_click' | 'share_click' | 'download_click'
    | 'plan_view' | 'plan_select' | 'payment_start' | 'payment_complete'
    | 'referral_copy' | 'brand_create' | 'campaign_create'
    | 'report_export' | 'integration_connect';

export function track(name: EventName, metadata?: Record<string, unknown>, category?: string) {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    trackEvent({ name, category: category || inferCategory(name), path, metadata }).catch(() => {});
}

function inferCategory(name: string): string {
    if (name.startsWith('form_') || name.startsWith('payment_') || name === 'plan_select') return 'conversion';
    if (name.startsWith('scroll_') || name === 'cta_click' || name === 'outbound_click' || name === 'share_click') return 'engagement';
    if (name.startsWith('brand_') || name.startsWith('campaign_') || name === 'report_export') return 'product';
    if (name === 'referral_copy' || name === 'integration_connect') return 'growth';
    return 'general';
}
