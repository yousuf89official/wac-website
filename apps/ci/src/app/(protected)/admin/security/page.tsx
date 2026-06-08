'use client';

import { useState } from 'react';
import { Shield, Check, AlertTriangle } from 'lucide-react';

const COMPLIANCE_STANDARDS = [
    { name: 'SOC 2 Type II', status: 'compliant', desc: 'Annual audit of security, availability, processing integrity, confidentiality, and privacy controls.', lastAudit: '2025-12-15', nextAudit: '2026-12-15', priority: 'Critical' },
    { name: 'ISO 27001', status: 'compliant', desc: 'Information Security Management System (ISMS) certification for enterprise data protection.', lastAudit: '2025-11-01', nextAudit: '2026-11-01', priority: 'Critical' },
    { name: 'GDPR', status: 'compliant', desc: 'EU General Data Protection Regulation compliance including consent management and data portability.', lastAudit: '2025-09-20', nextAudit: '2026-03-20', priority: 'Mandatory' },
    { name: 'CCPA / CPRA', status: 'compliant', desc: 'California Consumer Privacy Act compliance for US data subjects.', lastAudit: '2025-10-10', nextAudit: '2026-04-10', priority: 'Mandatory' },
    { name: 'PCI DSS', status: 'not_applicable', desc: 'Payment Card Industry standard. N/A — payments handled via Stripe.', lastAudit: null, nextAudit: null, priority: 'N/A' },
    { name: 'HIPAA', status: 'not_applicable', desc: 'Healthcare data standard. Not applicable to current product scope.', lastAudit: null, nextAudit: null, priority: 'N/A' },
];

const SECURITY_FEATURES = [
    { category: 'Authentication', features: [
        { name: 'Multi-Factor Authentication (MFA)', status: 'enabled', desc: 'TOTP-based 2FA for all users' },
        { name: 'SSO / SAML 2.0', status: 'enabled', desc: 'Enterprise single sign-on integration' },
        { name: 'OAuth 2.0 / OIDC', status: 'enabled', desc: 'Third-party authentication providers' },
        { name: 'Passwordless Login', status: 'planned', desc: 'Magic link and WebAuthn support' },
    ]},
    { category: 'Encryption', features: [
        { name: 'TLS 1.3 In Transit', status: 'enabled', desc: 'All data encrypted during transmission' },
        { name: 'AES-256 At Rest', status: 'enabled', desc: 'Database and file storage encryption' },
        { name: 'bcrypt Password Hashing', status: 'enabled', desc: 'Industry-standard password hashing' },
        { name: 'API Key Encryption', status: 'enabled', desc: 'All API keys encrypted at rest' },
    ]},
    { category: 'Access Control', features: [
        { name: 'Role-Based Access Control', status: 'enabled', desc: '7-tier RBAC with granular permissions' },
        { name: 'Row-Level Security', status: 'enabled', desc: 'Database-level tenant isolation' },
        { name: 'IP Whitelisting', status: 'enabled', desc: 'Restrict access by IP range' },
        { name: 'Session Management', status: 'enabled', desc: 'Configurable timeout and concurrent limits' },
    ]},
    { category: 'Monitoring', features: [
        { name: 'Immutable Audit Logs', status: 'enabled', desc: 'All user actions logged with timestamps' },
        { name: 'Anomaly Detection', status: 'enabled', desc: 'AI-powered suspicious activity alerts' },
        { name: 'Real-Time Alerts', status: 'enabled', desc: 'Instant notifications for security events' },
        { name: 'Penetration Testing', status: 'enabled', desc: 'Annual third-party security assessment' },
    ]},
    { category: 'Data Protection', features: [
        { name: 'Data Residency Control', status: 'enabled', desc: 'Choose data storage region (US, EU, APAC)' },
        { name: 'Automated Backups', status: 'enabled', desc: 'Daily backups with 30-day retention' },
        { name: 'Data Export / Portability', status: 'enabled', desc: 'Full data export in standard formats' },
        { name: 'Right to Erasure', status: 'enabled', desc: 'GDPR-compliant data deletion workflows' },
    ]},
];

export default function SecurityPage() {
    const [activeTab, setActiveTab] = useState<'compliance' | 'features' | 'settings'>('compliance');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Security & Compliance
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Security & Compliance
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Enterprise-grade security controls, compliance certifications, and data protection features.
                </p>
            </header>

            {/* Security Score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Security Score', value: '96/100', tone: 'success' as const },
                    { label: 'Compliance Status', value: '4/4 Active', tone: 'primary' as const },
                    { label: 'Last Pen Test', value: 'Dec 2025', tone: 'accent' as const },
                    { label: 'Uptime SLA', value: '99.95%', tone: 'primary' as const },
                ].map(s => (
                    <div key={s.label} className="p-5 rounded-xl border border-border bg-card">
                        <p className="text-[10px] text-foreground-soft uppercase tracking-wider mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.tone === 'success' ? 'text-success' : s.tone === 'primary' ? 'text-primary' : 'text-accent'}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 border-b border-border">
                {[{ id: 'compliance', label: 'Compliance' }, { id: 'features', label: 'Security Features' }, { id: 'settings', label: 'Settings' }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-foreground-soft'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'compliance' && (
                <div className="space-y-4">
                    {COMPLIANCE_STANDARDS.map(c => (
                        <div key={c.name} className={`p-6 rounded-xl border ${c.status === 'compliant' ? 'border-success/10 bg-success/[0.02]' : 'border-border bg-card'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {c.status === 'compliant' ? <Check className="h-5 w-5 text-success" /> : <Shield className="h-5 w-5 text-foreground-soft" />}
                                    <div>
                                        <h3 className="font-bold text-foreground">{c.name}</h3>
                                        <p className="text-xs text-foreground-soft mt-1">{c.desc}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.status === 'compliant' ? 'bg-success/10 text-success' : 'bg-card text-foreground-soft'}`}>
                                        {c.status === 'compliant' ? 'Compliant' : 'N/A'}
                                    </span>
                                    {c.lastAudit && <p className="text-[10px] text-foreground-soft mt-2">Last audit: {c.lastAudit}</p>}
                                    {c.nextAudit && <p className="text-[10px] text-foreground-soft">Next: {c.nextAudit}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'features' && (
                <div className="space-y-8">
                    {SECURITY_FEATURES.map(cat => (
                        <div key={cat.category}>
                            <h3 className="text-xs font-bold text-foreground-soft uppercase tracking-wider mb-3">{cat.category}</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {cat.features.map(f => (
                                    <div key={f.name} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                                        {f.status === 'enabled' ? <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />}
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{f.name}</p>
                                            <p className="text-[10px] text-foreground-soft">{f.desc}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ml-auto shrink-0 ${f.status === 'enabled' ? 'text-success' : 'text-warning'}`}>{f.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                    {[
                        { label: 'Enforce MFA for all users', enabled: true },
                        { label: 'SSO required (disable password login)', enabled: false },
                        { label: 'IP Whitelisting', enabled: true },
                        { label: 'Session timeout (minutes)', value: '30' },
                        { label: 'Max concurrent sessions', value: '3' },
                        { label: 'Password minimum length', value: '12' },
                        { label: 'Require password complexity', enabled: true },
                        { label: 'Data residency region', value: 'APAC (Singapore)' },
                        { label: 'Backup frequency', value: 'Daily' },
                        { label: 'Audit log retention (days)', value: '365' },
                    ].map(s => (
                        <div key={s.label} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                            <span className="text-sm text-foreground">{s.label}</span>
                            {'enabled' in s ? (
                                <div className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${s.enabled ? 'bg-primary' : 'bg-card'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-foreground rounded-full shadow transition-transform ${s.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                            ) : (
                                <span className="text-sm text-foreground-soft font-mono">{s.value}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
