import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import prisma from '@/lib/prisma';
import { PageHero } from '@wac/ui';
import { generateBreadcrumbSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

const EFFECTIVE_DATE = '12 June 2026';
const LEGAL_ENTITY = 'PT Stimulate Global Media';

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Data Deletion | We Are Collaborative';
    const description =
        'How to request deletion of your personal data from We Are Collaborative, what we delete, and how long it takes.';
    return {
        title,
        description,
        openGraph: { type: 'website', title, description, url: `${SITE_URL}/data-deletion` },
        twitter: { card: 'summary_large_image', title, description },
        alternates: { canonical: `${SITE_URL}/data-deletion` },
    };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="scroll-mt-28">
            <h2 className="mb-5 font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                {title}
            </h2>
            <div className="space-y-4 leading-relaxed text-foreground-soft">{children}</div>
        </section>
    );
}

function List({ children }: { children: ReactNode }) {
    return <ul className="list-disc space-y-2 pl-5 marker:text-foreground/30">{children}</ul>;
}

export default async function DataDeletionPage() {
    const brand = await prisma.brandConfig.findFirst().catch(() => null);
    const brandName = brand?.name || 'We Are Collaborative';
    const contactEmail = brand?.defaultEmail || 'hello@wearecollaborative.net';
    const deletionMailto = `mailto:${contactEmail}?subject=Data%20Deletion%20Request&body=Please%20delete%20the%20personal%20data%20associated%20with%20my%20account.%20My%20registered%20email%20is%3A%20`;

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Data Deletion', href: '/data-deletion' },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: 'Data Deletion',
                        url: `${SITE_URL}/data-deletion`,
                        inLanguage: 'en',
                        dateModified: '2026-06-12',
                        publisher: { '@type': 'Organization', name: brandName, url: SITE_URL },
                    }),
                }}
            />

            <PageHero
                eyebrow="Legal"
                headline={
                    <>
                        Data <span className="italic">Deletion</span>
                    </>
                }
                lede="You can ask us to delete the personal data we hold about you at any time. Here's exactly how to do it, what we remove, and how long it takes."
            />

            <div className="mx-auto max-w-3xl px-6 py-20 md:px-12 md:py-28">
                <p className="eyebrow mb-14">Last updated: {EFFECTIVE_DATE}</p>

                <div className="space-y-14">
                    <Section title="Your right to deletion">
                        <p>
                            {brandName}, operated by {LEGAL_ENTITY}, respects your right to control your
                            personal data. You can request that we delete the personal data associated with
                            you and your account. This page explains how to make that request and what
                            happens next. For the full picture of how we handle data, see our{' '}
                            <a href="/privacy" className="text-primary underline-offset-4 hover:underline">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="How to request deletion">
                        <p>
                            <strong className="font-semibold text-foreground">
                                Option 1 — Email us (recommended)
                            </strong>
                        </p>
                        <p>
                            Send a request from the email address registered to your account to{' '}
                            <a
                                href={deletionMailto}
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                {contactEmail}
                            </a>{' '}
                            with the subject &ldquo;Data Deletion Request.&rdquo; Please include the email
                            address associated with your account so we can locate your data.
                        </p>
                        <p className="pt-2">
                            <strong className="font-semibold text-foreground">
                                Option 2 — From your account
                            </strong>
                        </p>
                        <p>
                            Where account deletion is available in your account or settings area, you can
                            start the request there. If you can&rsquo;t find it, use the email option above
                            and we&rsquo;ll handle it for you.
                        </p>
                    </Section>

                    <Section title="Verifying your request">
                        <p>
                            To protect your account, we may ask you to confirm your identity before we
                            delete anything — for example, by confirming the request from your registered
                            email. This prevents someone else from deleting your data without your
                            permission.
                        </p>
                    </Section>

                    <Section title="What we delete">
                        <p>When we action a deletion request, we remove or anonymize:</p>
                        <List>
                            <li>Your account and profile information (name, email, hashed password).</li>
                            <li>Enrollment records and saved resources tied to your account.</li>
                            <li>Community posts and replies you created (or we anonymize them).</li>
                            <li>Marketing and newsletter subscriptions and preferences.</li>
                            <li>Behavioral / analytics data that is linked to you.</li>
                        </List>
                    </Section>

                    <Section title="What we may keep (and why)">
                        <p>
                            We may need to retain a limited amount of data after deletion where the law
                            requires it or where we have an overriding legitimate reason, including:
                        </p>
                        <List>
                            <li>
                                Order, invoice, and payment records we must keep for tax, accounting, and
                                financial-reporting obligations;
                            </li>
                            <li>Records needed to detect or prevent fraud and abuse;</li>
                            <li>
                                Anonymized or aggregated data that can no longer be linked back to you.
                            </li>
                        </List>
                        <p>
                            We keep this only for as long as required, then delete or anonymize it.
                        </p>
                    </Section>

                    <Section title="Third parties">
                        <p>
                            Where your data has been shared with our service providers (such as our hosting,
                            database, payment, or email providers) to operate the Services, we will instruct
                            them to delete it in line with our agreements and applicable law, subject to the
                            retention exceptions above.
                        </p>
                    </Section>

                    <Section title="How long it takes">
                        <p>
                            We aim to acknowledge your request within a few business days and to complete
                            deletion within 30 days, or sooner where required by applicable law. If your
                            request is complex or we need more time, we&rsquo;ll let you know.
                        </p>
                    </Section>

                    <Section title="Contact us">
                        <p>To request deletion or ask a question, contact:</p>
                        <p className="text-foreground">
                            {brandName} — {LEGAL_ENTITY}
                            <br />
                            <a
                                href={deletionMailto}
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                {contactEmail}
                            </a>
                        </p>
                    </Section>
                </div>

                <div className="mt-20 border-t border-foreground/10 pt-10 text-sm leading-relaxed text-foreground/45">
                    <p>
                        This page describes our data-deletion process in plain language and does not
                        constitute legal advice.
                    </p>
                </div>
            </div>
        </>
    );
}
