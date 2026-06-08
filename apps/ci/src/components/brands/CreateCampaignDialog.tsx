import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, CampaignMarket } from '@/services/api';
import { toast } from 'sonner';

interface CreateCampaignDialogProps {
    brandId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CreateCampaignDialog = ({ brandId, open, onOpenChange, onSuccess }: CreateCampaignDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [markets, setMarkets] = useState<CampaignMarket[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        marketId: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    useEffect(() => {
        if (open) {
            fetchMarkets();
        }
    }, [open]);

    const fetchMarkets = async () => {
        try {
            const data = await api.campaignMarkets.getAll();
            setMarkets(data);
        } catch (error) {
            console.error("Failed to fetch markets", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create Umbrella Campaign
            await api.campaigns.create({
                ...formData,
                brandId,
                status: 'active', // Default to active
                parentId: null,   // Explicitly null for Umbrella
                budgetPlanned: 0,  // 0 for Umbrella, sum of subs usually
                slug: '' // Backend generates slug
            });
            toast.success("Umbrella campaign created successfully");
            onSuccess();
            onOpenChange(false);
            setFormData({ name: '', marketId: '', startDate: '', endDate: '', description: '' });
        } catch (error) {
            console.error(error);
            toast.error("Failed to create umbrella campaign");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>New Umbrella Campaign</DialogTitle>
                    <DialogDescription className="text-foreground-soft">
                        Create a high-level campaign to group your marketing activities.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-foreground-soft">Campaign Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Ninja CREAMi Launch"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3 bg-card border-border text-foreground focus-visible:ring-primary"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="market" className="text-right text-foreground-soft">Market</Label>
                            <Select
                                value={formData.marketId}
                                onValueChange={val => setFormData({ ...formData, marketId: val })}
                            >
                                <SelectTrigger className="col-span-3 bg-card border-border text-foreground">
                                    <SelectValue placeholder="Select Market" />
                                </SelectTrigger>
                                <SelectContent className="bg-background-2 border-border">
                                    {markets.map(market => (
                                        <SelectItem key={market.id} value={market.id} className="text-foreground-soft focus:bg-card focus:text-foreground">
                                            {market.name} ({market.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right text-foreground-soft">Dates</Label>
                            <div className="col-span-3 flex gap-2">
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="Start"
                                />
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="bg-card border-border text-foreground"
                                    placeholder="End"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right text-foreground-soft">Description</Label>
                            <Input
                                id="desc"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3 bg-card border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-foreground-soft hover:text-foreground hover:bg-card">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {loading ? 'Creating...' : 'Create Campaign'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
