import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import prisma from '@/lib/prisma';
import { PageHero } from '@wac/ui';
import { generateBreadcrumbSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

const EFFECTIVE_DATE = '12 June 2026';
const LEGAL_ENTITY = 'PT Stimulate Global Media';
const GOVERNING_LAW = 'the Republic of Indonesia';

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Terms of Service | We Are Collaborative';
    const description =
        'The terms and conditions that govern your use of the We Are Collaborative website, academy, and services.';
    return {
        title,
        description,
        openGraph: { type: 'website', title, description, url: `${SITE_URL}/terms` },
        twitter: { card: 'summary_large_image', title, description },
        alternates: { canonical: `${SITE_URL}/terms` },
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

export default async function TermsPage() {
    const brand = await prisma.brandConfig.findFirst().catch(() => null);
    const brandName = brand?.name || 'We Are Collaborative';
    const contactEmail = brand?.defaultEmail || 'hello@wearecollaborative.net';

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Terms of Service', href: '/terms' },
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
                        name: 'Terms of Service',
                        url: `${SITE_URL}/terms`,
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
                        Terms of <span className="italic">Service</span>
                    </>
                }
                lede={`The terms that govern your use of ${brandName}, operated by ${LEGAL_ENTITY}. Please read them carefully — by using our services you agree to them.`}
            />

            <div className="mx-auto max-w-3xl px-6 py-20 md:px-12 md:py-28">
                <p className="eyebrow mb-14">Last updated: {EFFECTIVE_DATE}</p>

                <div className="space-y-14">
                    <Section title="1. Agreement to these terms">
                        <p>
                            These Terms of Service (&ldquo;Terms&rdquo;) form a binding agreement between
                            you and {brandName}, operated by {LEGAL_ENTITY} (&ldquo;we&rdquo;,
                            &ldquo;us&rdquo;, &ldquo;our&rdquo;). They govern your access to and use of our
                            website, academy, customer portal, content, and services (together, the
                            &ldquo;Services&rdquo;). By accessing or using the Services, you agree to these
                            Terms and to our{' '}
                            <a href="/privacy" className="text-primary underline-offset-4 hover:underline">
                                Privacy Policy
                            </a>
                            . If you do not agree, do not use the Services.
                        </p>
                    </Section>

                    <Section title="2. Eligibility">
                        <p>
                            You must be at least 18 years old, or the age of majority in your jurisdiction,
                            and able to form a binding contract to use the Services. By using the Services
                            you represent that you meet these requirements and that the information you
                            provide is accurate.
                        </p>
                    </Section>

                    <Section title="3. Your account">
                        <List>
                            <li>
                                You are responsible for the information you provide and for keeping it
                                accurate and up to date.
                            </li>
                            <li>
                                You are responsible for safeguarding your password and for all activity
                                that occurs under your account. Notify us promptly of any unauthorized use.
                            </li>
                            <li>You may not share, sell, or transfer your account to anyone else.</li>
                        </List>
                    </Section>

                    <Section title="4. Our services">
                        <p>
                            We provide digital marketing services, an academy with online courses and
                            resources, a customer portal, and related community features. Some content is
                            free; some requires payment or a subscription. We may add, change, or remove
                            features at any time.
                        </p>
                    </Section>

                    <Section title="5. Purchases, payments & subscriptions">
                        <List>
                            <li>
                                Prices for courses, services, and subscriptions are shown at checkout and
                                may change. You agree to pay all applicable fees and taxes.
                            </li>
                            <li>
                                Payments are processed by our third-party payment provider (Midtrans). By
                                purchasing, you authorize us and our provider to charge your selected
                                payment method.
                            </li>
                            <li>
                                Subscriptions, where offered, renew automatically for the stated billing
                                period until cancelled. You may cancel future renewals at any time; cancellation
                                takes effect at the end of the current period.
                            </li>
                            <li>
                                You are responsible for providing valid, current payment information.
                            </li>
                        </List>
                    </Section>

                    <Section title="6. Refunds & cancellations">
                        <p>
                            Except where required by applicable law, payments for digital products and
                            course access are generally non-refundable once access has been granted or the
                            content has been delivered. Any specific refund terms presented at the point of
                            purchase apply in addition to this section. If you believe you are entitled to a
                            refund, contact us and we will review your request in good faith.
                        </p>
                    </Section>

                    <Section title="7. License to use content">
                        <p>
                            Subject to these Terms and your payment of any applicable fees, we grant you a
                            limited, non-exclusive, non-transferable, revocable license to access and use
                            our content and courses for your own personal, non-commercial learning. You may
                            not copy, reproduce, redistribute, resell, sublicense, publicly display, or
                            create derivative works from our content except as expressly permitted.
                        </p>
                    </Section>

                    <Section title="8. Acceptable use">
                        <p>You agree not to:</p>
                        <List>
                            <li>Break the law or infringe the rights of others;</li>
                            <li>
                                Access the Services by automated means, scrape, or attempt to bypass
                                security or access controls;
                            </li>
                            <li>
                                Upload malware, interfere with or disrupt the Services, or probe for
                                vulnerabilities without authorization;
                            </li>
                            <li>
                                Share your paid access with others or circumvent payment or access limits;
                            </li>
                            <li>
                                Post unlawful, harmful, harassing, deceptive, or infringing content in our
                                community or other interactive areas.
                            </li>
                        </List>
                    </Section>

                    <Section title="9. User content & community">
                        <p>
                            You retain ownership of content you submit (such as community posts and
                            replies). By submitting it, you grant us a worldwide, non-exclusive, royalty-free
                            license to host, store, display, and use that content to operate and improve the
                            Services. You are responsible for your content and represent that you have the
                            rights to share it. We may moderate, remove, or restrict content or accounts that
                            violate these Terms, at our discretion.
                        </p>
                    </Section>

                    <Section title="10. Intellectual property">
                        <p>
                            The Services and all related content, trademarks, logos, course materials,
                            software, and design are owned by us or our licensors and are protected by
                            intellectual-property laws. Except for the rights expressly granted to you, no
                            rights are transferred to you.
                        </p>
                    </Section>

                    <Section title="11. Third-party services">
                        <p>
                            The Services may link to or rely on third-party websites and services (for
                            example, our payment provider). We are not responsible for third-party services,
                            and your use of them is subject to their own terms and policies.
                        </p>
                    </Section>

                    <Section title="12. Disclaimers">
                        <p>
                            The Services and all content are provided &ldquo;as is&rdquo; and &ldquo;as
                            available,&rdquo; without warranties of any kind, whether express or implied, to
                            the fullest extent permitted by law. Our marketing services, courses, and
                            educational content are provided for general information and skill development —
                            they are not guarantees of any particular result, income, or outcome, and they
                            do not constitute professional, legal, financial, or investment advice. Any
                            decisions you make based on the Services are your own responsibility.
                        </p>
                    </Section>

                    <Section title="13. Limitation of liability">
                        <p>
                            To the maximum extent permitted by law, {brandName} and {LEGAL_ENTITY} will not
                            be liable for any indirect, incidental, special, consequential, or punitive
                            damages, or for any loss of profits, revenue, data, or goodwill, arising out of
                            or related to your use of the Services. To the extent we are found liable, our
                            total liability for any claim will not exceed the amount you paid us for the
                            Services giving rise to the claim in the twelve months before the event. Nothing
                            in these Terms limits liability that cannot be limited under applicable law.
                        </p>
                    </Section>

                    <Section title="14. Indemnification">
                        <p>
                            You agree to indemnify and hold harmless {brandName} and {LEGAL_ENTITY} and our
                            officers, employees, and agents from any claims, losses, or expenses (including
                            reasonable legal fees) arising from your misuse of the Services, your content, or
                            your breach of these Terms.
                        </p>
                    </Section>

                    <Section title="15. Suspension & termination">
                        <p>
                            We may suspend or terminate your access to the Services at any time if you
                            breach these Terms or to protect the Services or other users. You may stop using
                            the Services and request closure of your account at any time. Provisions that by
                            their nature should survive termination (such as intellectual property,
                            disclaimers, and limitation of liability) will survive.
                        </p>
                    </Section>

                    <Section title="16. Changes to the Services & these Terms">
                        <p>
                            We may update these Terms from time to time. When we do, we will revise the
                            &ldquo;Last updated&rdquo; date above, and where changes are material we will
                            take reasonable steps to notify you. Your continued use of the Services after an
                            update means you accept the revised Terms.
                        </p>
                    </Section>

                    <Section title="17. Governing law">
                        <p>
                            These Terms are governed by the laws of {GOVERNING_LAW}, without regard to
                            conflict-of-laws principles. Any dispute will be subject to the competent courts
                            of that jurisdiction, except where applicable consumer-protection law gives you
                            the right to bring a claim in your place of residence.
                        </p>
                    </Section>

                    <Section title="18. Contact us">
                        <p>Questions about these Terms? Contact us at:</p>
                        <p className="text-foreground">
                            {brandName} — {LEGAL_ENTITY}
                            <br />
                            <a
                                href={`mailto:${contactEmail}?subject=Terms%20Enquiry`}
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                {contactEmail}
                            </a>
                        </p>
                    </Section>
                </div>

                <div className="mt-20 border-t border-foreground/10 pt-10 text-sm leading-relaxed text-foreground/45">
                    <p>
                        These Terms are provided in plain language for transparency and do not constitute
                        legal advice.
                    </p>
                </div>
            </div>
        </>
    );
}
