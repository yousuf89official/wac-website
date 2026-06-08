
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { Link2, CheckCircle, RefreshCw, Plus, Trash2, Globe, FileSpreadsheet, Facebook } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface IntegrationsCardProps {
    brandId: string;
}

interface Account {
    id: string; // Integration ID
    customerId: string;
    accountName: string;
    updatedAt: string;
}

interface ProviderConfig {
    key: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const PROVIDERS: ProviderConfig[] = [
    {
        key: 'meta_ads',
        name: 'Meta Ads',
        icon: <Facebook className="h-5 w-5" />,
        color: 'text-blue-600',
        description: 'Connect Facebook & Instagram Ad Accounts'
    },
    {
        key: 'tiktok_ads',
        name: 'TikTok Ads',
        icon: <span className="font-bold text-lg">T</span>,
        color: 'text-white',
        description: 'Connect TikTok For Business Accounts'
    },
    {
        key: 'google_sheets',
        name: 'Google Sheets',
        icon: <FileSpreadsheet className="h-5 w-5" />,
        color: 'text-green-600',
        description: 'Sync data with Google Sheets'
    },
    {
        key: 'google_ads',
        name: 'Google Ads',
        icon: <span className="font-bold text-lg">G</span>,
        color: 'text-blue-500',
        description: 'Connect Google Ad Accounts'
    }
];

export const IntegrationsCard = ({ brandId }: IntegrationsCardProps) => {
    const { showConfirm, showAlert } = useModal();

    // State to track ALL loaded integrations data
    // Map provider key -> { accounts: Account[], hasPending?: boolean, loading: boolean }
    const [integrationsData, setIntegrationsData] = useState<Record<string, { accounts: Account[], hasPending?: boolean, loading: boolean }>>({});

    // Manual Connection Modal State
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<ProviderConfig | null>(null);
    const [manualForm, setManualForm] = useState({ accountName: '', accountId: '' });
    const [submitting, setSubmitting] = useState(false);

    // Google Ads Specific State
    const [selectingAccount, setSelectingAccount] = useState(false);
    const [adAccounts, setAdAccounts] = useState<string[]>([]); // List of available customers from Google API
    const [selectedAdAccount, setSelectedAdAccount] = useState('');
    const [selectedAdAccountName, setSelectedAdAccountName] = useState('');

    const fetchStatus = async (providerKey: string) => {
        setIntegrationsData(prev => ({ ...prev, [providerKey]: { ...prev[providerKey], loading: true } }));
        try {
            let data;
            if (providerKey === 'google_ads') {
                const res = await api.integrations.googleAds.getStatus(brandId);
                data = { accounts: res.accounts || [], hasPending: res.hasPending };
            } else if (providerKey === 'meta_ads') {
                const res = await api.integrations.metaAds.getStatus(brandId);
                data = { accounts: res.accounts || [], hasPending: res.hasPending };
            } else if (providerKey === 'tiktok_ads') {
                const res = await api.integrations.tiktokAds.getStatus(brandId);
                data = { accounts: res.accounts || [], hasPending: res.hasPending };
            } else {
                const response = await fetch(`/api/integrations/${providerKey}?brandId=${brandId}`);
                if (response.status === 404) {
                    data = { accounts: [] };
                } else if (!response.ok) {
                    throw new Error(`Status ${response.status}`);
                } else {
                    const res = await response.json();
                    data = { accounts: res.accounts || [] };
                }
            }
            setIntegrationsData(prev => ({
                ...prev,
                [providerKey]: { accounts: data.accounts, hasPending: data.hasPending, loading: false }
            }));
        } catch (e) {
            console.error(`Failed to fetch ${providerKey}`, e);
            setIntegrationsData(prev => ({ ...prev, [providerKey]: { ...prev[providerKey], loading: false } }));
        }
    };

    const fetchAll = () => {
        PROVIDERS.forEach(p => fetchStatus(p.key));
    };

    useEffect(() => {
        if (brandId) fetchAll();
    }, [brandId]);

    // --- Google Ads Logic ---
    const handleGoogleConnect = async () => {
        try {
            const { url } = await api.integrations.googleAds.getAuthUrl(brandId);
            window.location.href = url;
        } catch (e) {
            console.error(e);
            toast.error('Failed to initiate connection');
        }
    };

    const fetchGoogleAccounts = async () => {
        setIntegrationsData(prev => ({ ...prev, google_ads: { ...prev.google_ads!, loading: true } }));
        try {
            const res = await api.integrations.googleAds.listCustomers(brandId);
            setAdAccounts(res.customers || []);
            setSelectingAccount(true);
        } catch (e) {
            toast.error('Failed to fetch Google Ad accounts');
        } finally {
            setIntegrationsData(prev => ({ ...prev, google_ads: { ...prev.google_ads!, loading: false } }));
        }
    };

    const saveGoogleAccount = async () => {
        if (!selectedAdAccount) return;
        try {
            await api.integrations.googleAds.selectCustomer(brandId, selectedAdAccount, selectedAdAccountName || selectedAdAccount);
            setSelectingAccount(false);
            fetchStatus('google_ads');
            toast.success('Account connected');
        } catch (e) {
            toast.error('Failed to save account');
        }
    };

    // --- Meta Ads Account Selection ---
    const fetchMetaAccounts = async () => {
        setIntegrationsData(prev => ({ ...prev, meta_ads: { ...prev.meta_ads!, loading: true } }));
        try {
            const res = await api.integrations.metaAds.listAccounts(brandId);
            setAdAccounts((res.accounts || []).map((a: any) => `${a.account_id}|${a.name}`));
            setSelectingAccount(true);
        } catch (e) {
            toast.error('Failed to fetch Meta Ad accounts');
        } finally {
            setIntegrationsData(prev => ({ ...prev, meta_ads: { ...prev.meta_ads!, loading: false } }));
        }
    };

    const saveMetaAccount = async () => {
        if (!selectedAdAccount) return;
        const [accountId, name] = selectedAdAccount.split('|');
        try {
            await api.integrations.metaAds.selectAccount(brandId, accountId, selectedAdAccountName || name || accountId);
            setSelectingAccount(false);
            fetchStatus('meta_ads');
            toast.success('Meta Ads account connected');
        } catch (e) { toast.error('Failed to save account'); }
    };

    // --- TikTok Ads Account Selection ---
    const fetchTiktokAccounts = async () => {
        setIntegrationsData(prev => ({ ...prev, tiktok_ads: { ...prev.tiktok_ads!, loading: true } }));
        try {
            const res = await api.integrations.tiktokAds.listAccounts(brandId);
            setAdAccounts((res.accounts || []).map((a: any) => `${a.advertiser_id}|${a.advertiser_name}`));
            setSelectingAccount(true);
        } catch (e) {
            toast.error('Failed to fetch TikTok advertiser accounts');
        } finally {
            setIntegrationsData(prev => ({ ...prev, tiktok_ads: { ...prev.tiktok_ads!, loading: false } }));
        }
    };

    const saveTiktokAccount = async () => {
        if (!selectedAdAccount) return;
        const [advertiserId, name] = selectedAdAccount.split('|');
        try {
            await api.integrations.tiktokAds.selectAccount(brandId, advertiserId, selectedAdAccountName || name || advertiserId);
            setSelectingAccount(false);
            fetchStatus('tiktok_ads');
            toast.success('TikTok Ads account connected');
        } catch (e) { toast.error('Failed to save account'); }
    };

    const handleMetaConnect = async () => {
        try {
            const { url } = await api.integrations.metaAds.getAuthUrl(brandId);
            window.location.href = url;
        } catch (e) {
            console.error(e);
            toast.error('Failed to initiate Meta Ads connection');
        }
    };

    const handleTiktokConnect = async () => {
        try {
            const { url } = await api.integrations.tiktokAds.getAuthUrl(brandId);
            window.location.href = url;
        } catch (e) {
            console.error(e);
            toast.error('Failed to initiate TikTok Ads connection');
        }
    };

    // --- Generic Logic ---
    const openConnectModal = (provider: ProviderConfig) => {
        if (provider.key === 'google_ads') {
            handleGoogleConnect();
        } else if (provider.key === 'meta_ads') {
            handleMetaConnect();
        } else if (provider.key === 'tiktok_ads') {
            handleTiktokConnect();
        } else {
            setCurrentProvider(provider);
            setManualForm({ accountName: '', accountId: '' });
            setConnectModalOpen(true);
        }
    };

    const handleManualSubmit = async () => {
        if (!currentProvider || !manualForm.accountName || !manualForm.accountId) return;
        setSubmitting(true);
        try {
            await fetch('/api/integrations/manual/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandId,
                    provider: currentProvider.key,
                    accountName: manualForm.accountName,
                    accountId: manualForm.accountId
                })
            });
            setConnectModalOpen(false);
            fetchStatus(currentProvider.key);
            toast.success('Account connected');
        } catch (e) {
            toast.error('Failed to connect');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisconnect = async (integrationId: string, providerKey: string) => {
        showConfirm({
            title: 'Disconnect Account?',
            message: 'Are you sure? This will stop data syncing for this account.',
            confirmText: 'Disconnect',
            cancelText: 'Cancel',
            type: 'error',
            onConfirm: async () => {
                try {
                    await fetch('/api/integrations/disconnect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: integrationId })
                    });
                    fetchStatus(providerKey);
                    toast.success('Account disconnected');
                } catch (e) {
                    toast.error('Failed to disconnect');
                }
            }
        });
    };

    return (
        <Card className="p-5 bg-white/[0.04] border-white/10">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-white/[0.06] rounded-lg flex items-center justify-center">
                        <Link2 className="h-4 w-4 text-white/50" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Integrations</h2>
                </div>
                <Button size="sm" variant="ghost" onClick={fetchAll} className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4 text-white/40" />
                </Button>
            </div>

            <div className="space-y-4">
                {PROVIDERS.map(provider => {
                    const data = integrationsData[provider.key];
                    const accounts = data?.accounts || [];
                    const loading = data?.loading;
                    const hasPending = data?.hasPending;
                    const isConnected = accounts.length > 0;

                    return (
                        <div key={provider.key} className="p-4 bg-white/[0.03] border border-white/10 rounded-lg transition-all hover:bg-white/[0.06]">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`h-12 w-12 bg-white/[0.04] rounded-lg flex items-center justify-center border border-white/[0.06] shadow-sm ${provider.color}`}>
                                        {provider.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{provider.name}</h3>
                                        <p className="text-xs text-white/50 mb-2">{provider.description}</p>

                                        {/* Connected Accounts List */}
                                        {accounts.length > 0 && (
                                            <div className="space-y-2 mt-2">
                                                {accounts.map(acc => (
                                                    <div key={acc.id} className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded border border-green-200 shadow-sm">
                                                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-white">{acc.accountName}</span>
                                                            <span className="text-[10px] text-white/40 font-mono">ID: {acc.customerId}</span>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 ml-2 text-white/40 hover:text-red-500"
                                                            onClick={() => handleDisconnect(acc.id, provider.key)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pending State — Select Account */}
                                        {hasPending && !selectingAccount && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Action Required</Badge>
                                                <Button size="sm" variant="link" className="text-blue-600 h-auto p-0" onClick={() => {
                                                    if (provider.key === 'google_ads') fetchGoogleAccounts();
                                                    else if (provider.key === 'meta_ads') fetchMetaAccounts();
                                                    else if (provider.key === 'tiktok_ads') fetchTiktokAccounts();
                                                }}>
                                                    Select Ad Account
                                                </Button>
                                            </div>
                                        )}

                                        {/* Account Selection UI (all OAuth providers) */}
                                        {['google_ads', 'meta_ads', 'tiktok_ads'].includes(provider.key) && hasPending && selectingAccount && (
                                            <div className="mt-3 bg-white/[0.04] p-3 rounded border border-white/10 w-full max-w-sm">
                                                <p className="text-xs font-bold mb-2 text-white">Select {provider.name} Account</p>
                                                <select
                                                    className="w-full text-sm border border-white/[0.08] bg-[#0d1320] text-white rounded-md p-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                                                    value={selectedAdAccount}
                                                    onChange={e => {
                                                        setSelectedAdAccount(e.target.value);
                                                        if (provider.key === 'google_ads') {
                                                            const id = e.target.value.replace('customers/', '');
                                                            setSelectedAdAccountName(`Account ${id}`);
                                                        } else {
                                                            const parts = e.target.value.split('|');
                                                            setSelectedAdAccountName(parts[1] || parts[0]);
                                                        }
                                                    }}
                                                >
                                                    <option value="" className="bg-[#0a0f1a] text-white">Choose account...</option>
                                                    {adAccounts.map(acc => {
                                                        const display = provider.key === 'google_ads'
                                                            ? acc.replace('customers/', '')
                                                            : acc.split('|').reverse().join(' — ');
                                                        return <option key={acc} value={acc} className="bg-[#0a0f1a] text-white">{display}</option>;
                                                    })}
                                                </select>
                                                <Input
                                                    placeholder="Account Name (Optional)"
                                                    className="h-8 text-xs mb-2 bg-white/[0.04] border-white/10"
                                                    value={selectedAdAccountName}
                                                    onChange={e => setSelectedAdAccountName(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectingAccount(false)}>Cancel</Button>
                                                    <Button size="sm" className="h-7 text-xs" onClick={() => {
                                                        if (provider.key === 'google_ads') saveGoogleAccount();
                                                        else if (provider.key === 'meta_ads') saveMetaAccount();
                                                        else if (provider.key === 'tiktok_ads') saveTiktokAccount();
                                                    }} disabled={!selectedAdAccount}>Confirm</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant={isConnected ? "outline" : "default"} // "default" is usually black/dark
                                    className={isConnected ? "" : "bg-[rgba(22,32,50,0.8)] text-white"}
                                    onClick={() => openConnectModal(provider)}
                                    disabled={loading || hasPending}
                                >
                                    {isConnected ? <Plus className="h-4 w-4 mr-1" /> : ''}
                                    {isConnected ? 'Connect Another' : 'Connect'}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Manual Connection Modal */}
            <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Connect {currentProvider?.name}</DialogTitle>
                        <DialogDescription>
                            Enter your account details to connect this integration.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Account Name</Label>
                            <Input
                                placeholder="e.g. Summer Campaign Account"
                                value={manualForm.accountName}
                                onChange={e => setManualForm({ ...manualForm, accountName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Account ID</Label>
                            <Input
                                placeholder="e.g. 123456789"
                                value={manualForm.accountId}
                                onChange={e => setManualForm({ ...manualForm, accountId: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConnectModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleManualSubmit} disabled={submitting || !manualForm.accountName}>
                            {submitting ? 'Connecting...' : 'Connect'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
