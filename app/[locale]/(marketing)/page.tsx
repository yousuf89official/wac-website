import { setRequestLocale } from 'next-intl/server';
import HomeSections from '@/components/marketing/HomeSections';
import { generateWebSiteSchema, generateLocalBusinessSchema } from '@/utils/structured-data';

export default async function Home({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema(locale)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLocalBusinessSchema(locale)) }}
            />
            <HomeSections />
        </>
    );
}
