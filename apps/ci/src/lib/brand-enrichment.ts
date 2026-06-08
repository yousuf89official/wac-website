
import * as cheerio from 'cheerio';

interface BrandEnrichmentData {
    description?: string;
    image?: string; // OG Image / Wallpaper proxy
    title?: string;
}

export async function enrichBrandFromWeb(websiteUrl: string): Promise<BrandEnrichmentData> {
    try {
        if (!websiteUrl || !websiteUrl.startsWith('http')) {
            return {};
        }

        // Fetch HTML with a user-agent to avoid being blocked immediately
        const res = await fetch(websiteUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            console.warn(`Failed to fetch ${websiteUrl}: ${res.status}`);
            return {};
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        const title = $('meta[property="og:title"]').attr('content') || $('title').text();
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');

        return {
            title: title?.trim(),
            description: description?.trim(),
            image: image?.startsWith('http') ? image : undefined
        };

    } catch (error) {
        console.error("Brand enrichment failed:", error);
        return {};
    }
}
