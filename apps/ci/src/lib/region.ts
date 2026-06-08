/**
 * Region auto-detection and pricing helpers.
 * Maps user locale/timezone to a pricing region for localized pricing.
 */

export interface RegionInfo {
    region: string;
    currency: string;
    currencySymbol: string;
    locale: string;
    label: string;
}

const REGION_MAP: Record<string, RegionInfo> = {
    sea_id: { region: 'sea_id', currency: 'IDR', currencySymbol: 'Rp', locale: 'id-ID', label: 'Indonesia' },
    sea_my: { region: 'sea_my', currency: 'MYR', currencySymbol: 'RM', locale: 'ms-MY', label: 'Malaysia' },
    sea_sg: { region: 'sea_sg', currency: 'SGD', currencySymbol: 'S$', locale: 'en-SG', label: 'Singapore' },
    sea_th: { region: 'sea_th', currency: 'THB', currencySymbol: '฿', locale: 'th-TH', label: 'Thailand' },
    sea_ph: { region: 'sea_ph', currency: 'PHP', currencySymbol: '₱', locale: 'en-PH', label: 'Philippines' },
    south_asia_in: { region: 'south_asia_in', currency: 'INR', currencySymbol: '₹', locale: 'en-IN', label: 'India' },
    gcc_ae: { region: 'gcc_ae', currency: 'AED', currencySymbol: 'AED', locale: 'ar-AE', label: 'UAE' },
    gcc_sa: { region: 'gcc_sa', currency: 'SAR', currencySymbol: 'SAR', locale: 'ar-SA', label: 'Saudi Arabia' },
    global_us: { region: 'global_us', currency: 'USD', currencySymbol: '$', locale: 'en-US', label: 'United States' },
    global_uk: { region: 'global_uk', currency: 'GBP', currencySymbol: '£', locale: 'en-GB', label: 'United Kingdom' },
    global_au: { region: 'global_au', currency: 'AUD', currencySymbol: 'A$', locale: 'en-AU', label: 'Australia' },
    global_eu: { region: 'global_eu', currency: 'EUR', currencySymbol: '€', locale: 'en-IE', label: 'Europe' },
};

export const ALL_REGIONS = Object.values(REGION_MAP);

// Timezone → region mapping
const TZ_TO_REGION: Record<string, string> = {
    'Asia/Jakarta': 'sea_id', 'Asia/Makassar': 'sea_id', 'Asia/Jayapura': 'sea_id',
    'Asia/Kuala_Lumpur': 'sea_my', 'Asia/Kuching': 'sea_my',
    'Asia/Singapore': 'sea_sg',
    'Asia/Bangkok': 'sea_th',
    'Asia/Manila': 'sea_ph',
    'Asia/Kolkata': 'south_asia_in', 'Asia/Calcutta': 'south_asia_in', 'Asia/Mumbai': 'south_asia_in',
    'Asia/Dubai': 'gcc_ae', 'Asia/Muscat': 'gcc_ae',
    'Asia/Riyadh': 'gcc_sa',
    'Asia/Bahrain': 'gcc_ae', 'Asia/Qatar': 'gcc_ae', 'Asia/Kuwait': 'gcc_ae',
    'America/New_York': 'global_us', 'America/Chicago': 'global_us', 'America/Denver': 'global_us',
    'America/Los_Angeles': 'global_us', 'US/Eastern': 'global_us', 'US/Pacific': 'global_us',
    'Europe/London': 'global_uk',
    'Australia/Sydney': 'global_au', 'Australia/Melbourne': 'global_au', 'Australia/Perth': 'global_au',
    'Europe/Paris': 'global_eu', 'Europe/Berlin': 'global_eu', 'Europe/Amsterdam': 'global_eu',
    'Europe/Madrid': 'global_eu', 'Europe/Rome': 'global_eu', 'Europe/Zurich': 'global_eu',
};

/**
 * Detect region from browser timezone (client-side).
 */
export function detectRegion(): RegionInfo {
    if (typeof Intl === 'undefined') return REGION_MAP.global_us;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const regionKey = TZ_TO_REGION[tz] || 'global_us';
    return REGION_MAP[regionKey] || REGION_MAP.global_us;
}

export function getRegionInfo(regionKey: string): RegionInfo {
    return REGION_MAP[regionKey] || REGION_MAP.global_us;
}

/**
 * Format price from smallest currency unit to display string.
 * e.g. 2900 USD → "$29", 14900000 IDR → "Rp149,000"
 */
export function formatPrice(amount: number, currency: string, locale?: string): string {
    if (amount <= 0) return 'Free';
    const info = ALL_REGIONS.find(r => r.currency === currency);
    const loc = locale || info?.locale || 'en-US';

    // Convert from smallest unit
    const divisor = ['IDR', 'JPY', 'KRW', 'VND'].includes(currency) ? 100 : 100;
    const value = amount / divisor;

    try {
        return new Intl.NumberFormat(loc, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    } catch {
        return `${info?.currencySymbol || '$'}${Math.round(value).toLocaleString()}`;
    }
}
