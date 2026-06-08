'use client';

import { useState } from 'react';
import { Key, Plus, Copy, Check, Trash2, RefreshCw } from 'lucide-react';

const API_KEYS = [
    { id: 1, name: 'Production API Key', prefix: 'imh_prod_', key: '••••••••••••••••abcd1234', created: '2025-06-01', lastUsed: '2 min ago', status: 'active', requests: 45230, rateLimit: '1000/min', scopes: ['read:campaigns', 'read:metrics', 'read:reports', 'write:campaigns'] },
    { id: 2, name: 'Staging API Key', prefix: 'imh_stg_', key: '••••••••••••••••efgh5678', created: '2025-08-15', lastUsed: '3 hours ago', status: 'active', requests: 8420, rateLimit: '500/min', scopes: ['read:campaigns', 'read:metrics'] },
    { id: 3, name: 'Webhook Secret', prefix: 'imh_whk_', key: '••••••••••••••••ijkl9012', created: '2025-10-01', lastUsed: '1 day ago', status: 'active', requests: 2150, rateLimit: '100/min', scopes: ['webhooks'] },
    { id: 4, name: 'Legacy Integration Key', prefix: 'imh_leg_', key: '••••••••••••••••mnop3456', created: '2025-03-01', lastUsed: '30 days ago', status: 'inactive', requests: 0, rateLimit: '500/min', scopes: ['read:campaigns'] },
];

const SCOPES = [
    { scope: 'read:campaigns', desc: 'Read campaign data and configurations' },
    { scope: 'write:campaigns', desc: 'Create and modify campaigns' },
    { scope: 'read:metrics', desc: 'Access performance metrics and analytics' },
    { scope: 'write:metrics', desc: 'Push metrics data via API' },
    { scope: 'read:reports', desc: 'Generate and download reports' },
    { scope: 'read:users', desc: 'Access user information' },
    { scope: 'write:users', desc: 'Create and manage users via API' },
    { scope: 'read:brands', desc: 'Access brand information' },
    { scope: 'write:brands', desc: 'Create and modify brands' },
    { scope: 'webhooks', desc: 'Receive webhook events' },
    { scope: 'admin', desc: 'Full administrative access (use with caution)' },
];

export default function ApiKeysPage() {
    const [copied, setCopied] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const handleCopy = (id: number) => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · API Keys
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    API Keys
                </h1>
                <p className="mt-4 text-foreground-soft max-w-2xl">
                    Manage API keys for platform integrations, webhooks, and third-party connections. All keys are encrypted at rest.
                </p>
                <div className="mt-6">
                    <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-6 py-2 bg-primary text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Key className="h-4 w-4" />
                        <Plus className="h-4 w-4" /> GENERATE NEW KEY
                    </button>
                </div>
            </header>

            {/* Create form */}
            {showCreate && (
                <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                    <h3 className="font-bold text-foreground">Generate New API Key</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground-soft">Key Name</label>
                            <input placeholder="e.g., Production API" className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground-soft">Rate Limit</label>
                            <select className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all">
                                <option value="100" className="bg-background-2 text-foreground">100 requests/min</option>
                                <option value="500" className="bg-background-2 text-foreground">500 requests/min</option>
                                <option value="1000" className="bg-background-2 text-foreground">1,000 requests/min</option>
                                <option value="5000" className="bg-background-2 text-foreground">5,000 requests/min</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground-soft">Scopes</label>
                        <div className="grid grid-cols-3 gap-2">
                            {SCOPES.map(s => (
                                <label key={s.scope} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-border cursor-pointer">
                                    <input type="checkbox" className="rounded border-border bg-card text-primary focus:ring-primary/30" />
                                    <div>
                                        <span className="text-xs font-mono text-foreground-soft">{s.scope}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-6 py-2 bg-primary text-foreground rounded-xl font-bold text-xs">Generate Key</button>
                        <button onClick={() => setShowCreate(false)} className="px-6 py-2 bg-card text-foreground-soft rounded-xl font-bold text-xs">Cancel</button>
                    </div>
                </div>
            )}

            {/* Keys List */}
            <div className="space-y-4">
                {API_KEYS.map(k => (
                    <div key={k.id} className={`p-6 rounded-2xl border ${k.status === 'active' ? 'border-border' : 'border-border opacity-60'} bg-card`}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-foreground">{k.name}</h3>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${k.status === 'active' ? 'bg-success/10 text-success' : 'bg-card text-foreground-soft'}`}>{k.status}</span>
                                </div>
                                <p className="text-[10px] text-foreground-soft mt-1">Created: {k.created} · Last used: {k.lastUsed}</p>
                            </div>
                            <div className="flex gap-1">
                                <button className="p-1.5 rounded-lg hover:bg-card text-foreground-soft hover:text-foreground transition-colors"><RefreshCw className="h-3.5 w-3.5" /></button>
                                <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-foreground-soft hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-card border border-border">
                            <code className="flex-1 text-xs font-mono text-foreground-soft">{k.prefix}{k.key}</code>
                            <button onClick={() => handleCopy(k.id)} className="p-1 text-foreground-soft hover:text-foreground transition-colors">
                                {copied === k.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-foreground-soft">
                            <span>Rate: {k.rateLimit}</span>
                            <span>Requests: {k.requests.toLocaleString()}</span>
                            <span>Scopes: {k.scopes.join(', ')}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
