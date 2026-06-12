import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import prisma from '@/lib/prisma';
import { PageHero } from '@wac/ui';
import { generateBreadcrumbSchema } from '@/utils/structured-data';
import { SITE_URL } from '@/lib/urls';

const EFFECTIVE_DATE = '12 June 2026';
const LEGAL_ENTITY = 'PT Stimulate Global Media';

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Privacy Policy | We Are Collaborative';
    const description =
        'How We Are Collaborative collects, uses, shares, secures, and retains your personal data — and the rights you have over it.';
    return {
        title,
        description,
        openGraph: { type: 'website', title, description, url: `${SITE_URL}/privacy` },
        twitter: { card: 'summary_large_image', title, description },
        alternates: { canonical: `${SITE_URL}/privacy` },
    };
}

/** One numbered policy section. */
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
    return (
        <ul className="list-disc space-y-2 pl-5 marker:text-foreground/30">{children}</ul>
    );
}

export default async function PrivacyPolicyPage() {
    // Pull the public contact details; tolerate a DB cold-start with sane fallbacks.
    const brand = await prisma.brandConfig.findFirst().catch(() => null);
    const brandName = brand?.name || 'We Are Collaborative';
    const contactEmail = brand?.defaultEmail || 'hello@wearecollaborative.net';

    const breadcrumbs = generateBreadcrumbSchema([
        { name: 'Home', href: '' },
        { name: 'Privacy Policy', href: '/privacy' },
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
                        '@type': 'PrivacyPolicy',
                        name: 'Privacy Policy',
                        url: `${SITE_URL}/privacy`,
                        inLanguage: 'en',
                        dateModified: '2026-06-12',
                        publisher: {
                            '@type': 'Organization',
                            name: brandName,
                            url: SITE_URL,
                        },
                    }),
                }}
            />

            <PageHero
                eyebrow="Legal"
                headline={
                    <>
                        Privacy <span className="italic">Policy</span>
                    </>
                }
                lede={`How ${brandName} — operated by ${LEGAL_ENTITY} — collects, uses, shares, and protects your personal data, and the rights you hold over it.`}
            />

            <div className="mx-auto max-w-3xl px-6 py-20 md:px-12 md:py-28">
                <p className="eyebrow mb-14">Last updated: {EFFECTIVE_DATE}</p>

                <div className="space-y-14">
                    <Section title="1. Who we are">
                        <p>
                            {brandName} (&ldquo;{brandName}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
                            or &ldquo;our&rdquo;) is a digital marketing brand operated by{' '}
                            {LEGAL_ENTITY}. We are the data controller responsible for the personal
                            data processed through this website (wearecollaborative.net), our customer
                            portal, our academy, and the products and services we offer.
                        </p>
                        <p>
                            This Privacy Policy explains what personal data we collect, why we collect
                            it, how we use and share it, how long we keep it, how we protect it, and the
                            choices and rights available to you. It applies to everyone who visits our
                            site, submits an enquiry, creates an account, enrolls in a course, makes a
                            purchase, or otherwise interacts with us.
                        </p>
                    </Section>

                    <Section title="2. The personal data we collect">
                        <p>
                            <strong className="font-semibold text-foreground">
                                Information you provide to us
                            </strong>
                        </p>
                        <List>
                            <li>
                                <strong className="text-foreground">Account data</strong> — your name,
                                email address, and password when you register. Passwords are stored only
                                as a salted one-way hash (bcrypt); we never store or can read your
                                plaintext password.
                            </li>
                            <li>
                                <strong className="text-foreground">Profile data</strong> — optional
                                details you add to your profile or account settings.
                            </li>
                            <li>
                                <strong className="text-foreground">Enquiry &amp; lead data</strong> —
                                information you submit through contact, &ldquo;Get Started,&rdquo; or
                                newsletter forms, such as your name, email, company, and message.
                            </li>
                            <li>
                                <strong className="text-foreground">Purchase &amp; enrollment data</strong>{' '}
                                — courses you enroll in, orders, invoices, and subscription details.
                            </li>
                            <li>
                                <strong className="text-foreground">Payment data</strong> — payments are
                                processed by our third-party payment gateway (Midtrans). Card and payment
                                instrument details are entered with and handled by the gateway; we do not
                                collect or store full card numbers. We receive transaction metadata such
                                as order ID, status, amount, and payment method.
                            </li>
                            <li>
                                <strong className="text-foreground">Community &amp; content</strong> —
                                posts, replies, saved resources, and other content you submit within the
                                customer portal or community.
                            </li>
                            <li>
                                <strong className="text-foreground">Communications</strong> — messages
                                you send us by email, chat, or support requests, and your preferences for
                                receiving communications.
                            </li>
                            <li>
                                <strong className="text-foreground">AI assistant inputs</strong> — text
                                you enter into our on-site chat assistant (see Section 5).
                            </li>
                        </List>

                        <p className="pt-2">
                            <strong className="font-semibold text-foreground">
                                Information collected automatically
                            </strong>
                        </p>
                        <List>
                            <li>
                                <strong className="text-foreground">Device &amp; connection data</strong>{' '}
                                — IP address, browser type, device and operating system, and referring
                                pages.
                            </li>
                            <li>
                                <strong className="text-foreground">Usage &amp; analytics data</strong> —
                                pages viewed, links clicked, time on page, visitor sessions and events,
                                and similar interaction data we use to understand and improve the site.
                            </li>
                            <li>
                                <strong className="text-foreground">
                                    Personalization (affinity) data
                                </strong>{' '}
                                — signals about which topics and content you engage with, stored to
                                tailor what we show you. This is associated with a first-party cookie, not
                                your identity.
                            </li>
                            <li>
                                <strong className="text-foreground">Cookies</strong> — see Section 4.
                            </li>
                        </List>

                        <p className="pt-2">
                            <strong className="font-semibold text-foreground">
                                Information from third parties
                            </strong>{' '}
                            — we may receive limited data from our payment gateway (transaction
                            confirmations) and, where you use them, from analytics and advertising
                            platforms connected to our products.
                        </p>
                    </Section>

                    <Section title="3. How we use your data">
                        <List>
                            <li>To create and manage your account and authenticate you securely.</li>
                            <li>
                                To deliver our services — process enrollments, orders, payments, and
                                invoices, and provide access to courses, resources, and the community.
                            </li>
                            <li>To respond to your enquiries, requests, and support messages.</li>
                            <li>To operate the on-site AI chat assistant.</li>
                            <li>
                                To personalize content and recommendations based on your interests.
                            </li>
                            <li>
                                To send you service messages and, where you have opted in or it is
                                otherwise permitted, marketing and newsletter communications — which you
                                can opt out of at any time.
                            </li>
                            <li>
                                To measure, analyze, and improve our website, products, and content.
                            </li>
                            <li>
                                To maintain security, prevent fraud and abuse, and enforce our terms.
                            </li>
                            <li>
                                To comply with our legal and regulatory obligations and to establish,
                                exercise, or defend legal claims.
                            </li>
                        </List>
                    </Section>

                    <Section title="4. Cookies & similar technologies">
                        <p>We use a small number of first-party cookies and similar technologies:</p>
                        <List>
                            <li>
                                <strong className="text-foreground">Essential cookies</strong> —
                                authentication and session cookies required to keep you signed in and to
                                operate secure areas of the site. The site cannot function properly
                                without these.
                            </li>
                            <li>
                                <strong className="text-foreground">Preference / personalization</strong>{' '}
                                — to remember your settings (such as theme) and tailor content to your
                                interests.
                            </li>
                            <li>
                                <strong className="text-foreground">Analytics</strong> — to understand how
                                the site is used so we can improve it.
                            </li>
                        </List>
                        <p>
                            You can control or delete cookies through your browser settings. Blocking
                            essential cookies may prevent you from signing in or using parts of the site.
                        </p>
                    </Section>

                    <Section title="5. AI features">
                        <p>
                            Our website offers an AI chat assistant. Text you submit to the assistant is
                            sent to our AI provider (Google, via the Gemini API) to generate a response.
                            Please do not enter sensitive personal information (such as passwords, payment
                            card numbers, or government identifiers) into the chat. We use these inputs to
                            provide and improve the assistant experience.
                        </p>
                    </Section>

                    <Section title="6. How we share your data">
                        <p>
                            We do <strong className="text-foreground">not</strong> sell your personal
                            data. We share it only as needed to run our business, and with appropriate
                            safeguards, including with:
                        </p>
                        <List>
                            <li>
                                <strong className="text-foreground">Service providers (processors)</strong>{' '}
                                who help us operate, including: hosting and infrastructure (Vercel),
                                database hosting (Neon), payment processing (Midtrans), AI features
                                (Google), and email delivery. These providers process data on our behalf
                                under contract.
                            </li>
                            <li>
                                <strong className="text-foreground">Professional advisers</strong> such as
                                accountants, auditors, and lawyers, where reasonably necessary.
                            </li>
                            <li>
                                <strong className="text-foreground">Authorities</strong> where required by
                                law, regulation, legal process, or to protect rights, safety, and the
                                integrity of our services.
                            </li>
                            <li>
                                <strong className="text-foreground">Successors</strong> in connection with
                                a merger, acquisition, financing, or sale of assets, subject to this
                                policy.
                            </li>
                        </List>
                    </Section>

                    <Section title="7. International transfers">
                        <p>
                            We and our service providers may process and store your data in countries
                            other than your own, including Indonesia, Australia, and the United States.
                            Where data is transferred across borders, we take steps to ensure it is
                            protected consistent with this policy and applicable law.
                        </p>
                    </Section>

                    <Section title="8. How long we keep your data">
                        <p>
                            We keep personal data only for as long as necessary for the purposes set out
                            in this policy — for example, for the life of your account and our
                            relationship with you, and afterwards as needed to meet legal, accounting,
                            tax, or reporting obligations, or to resolve disputes. When data is no longer
                            needed, we delete or anonymize it.
                        </p>
                    </Section>

                    <Section title="9. How we protect your data">
                        <p>
                            We use technical and organizational measures appropriate to the risk,
                            including encryption of data in transit (HTTPS), one-way hashing of passwords
                            (bcrypt), access controls, and signed/verified payment webhooks. No method of
                            transmission or storage is completely secure, so we cannot guarantee absolute
                            security; please help protect your account by keeping your password
                            confidential.
                        </p>
                    </Section>

                    <Section title="10. Your rights & choices">
                        <p>
                            Depending on where you live, you may have some or all of the following rights
                            over your personal data:
                        </p>
                        <List>
                            <li>Access a copy of the personal data we hold about you.</li>
                            <li>Correct inaccurate or incomplete data.</li>
                            <li>Delete your data (&ldquo;right to be forgotten&rdquo;).</li>
                            <li>Port your data to another service in a portable format.</li>
                            <li>Object to or restrict certain processing.</li>
                            <li>Withdraw consent at any time, where processing is based on consent.</li>
                            <li>
                                Opt out of marketing — use the unsubscribe link in any marketing email or
                                contact us directly.
                            </li>
                        </List>
                        <p>
                            To exercise any of these rights, email us at{' '}
                            <a
                                href={`mailto:${contactEmail}?subject=Privacy%20Request`}
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                {contactEmail}
                            </a>
                            . We may need to verify your identity before acting on a request, and we will
                            respond within the timeframe required by applicable law. You also have the
                            right to complain to your local data protection authority.
                        </p>
                    </Section>

                    <Section title="11. Children's privacy">
                        <p>
                            Our services are intended for adults and are not directed to children. We do
                            not knowingly collect personal data from children under the age required by
                            local law (generally 16). If you believe a child has provided us with personal
                            data, please contact us and we will delete it.
                        </p>
                    </Section>

                    <Section title="12. Third-party links">
                        <p>
                            Our site may link to third-party websites and services we do not control. This
                            policy does not apply to those sites; please review their own privacy notices.
                        </p>
                    </Section>

                    <Section title="13. Changes to this policy">
                        <p>
                            We may update this Privacy Policy from time to time. When we do, we will revise
                            the &ldquo;Last updated&rdquo; date above and, where changes are material, take
                            additional steps to notify you. Your continued use of our services after an
                            update means you accept the revised policy.
                        </p>
                    </Section>

                    <Section title="14. Contact us">
                        <p>
                            If you have any questions, requests, or concerns about this policy or your
                            personal data, contact us at:
                        </p>
                        <p className="text-foreground">
                            {brandName} — {LEGAL_ENTITY}
                            <br />
                            <a
                                href={`mailto:${contactEmail}?subject=Privacy%20Enquiry`}
                                className="text-primary underline-offset-4 hover:underline"
                            >
                                {contactEmail}
                            </a>
                        </p>
                    </Section>
                </div>

                <div className="mt-20 border-t border-foreground/10 pt-10 text-sm leading-relaxed text-foreground/45">
                    <p>
                        This policy describes our current data practices in plain language. It does not
                        create contractual rights beyond those required by applicable law.
                    </p>
                </div>
            </div>
        </>
    );
}
