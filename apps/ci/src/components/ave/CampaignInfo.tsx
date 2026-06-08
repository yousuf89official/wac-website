'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CampaignInfoProps {
    formData: Record<string, string>;
    onInputChange: (field: string, value: string) => void;
    selectedChannels: string[];
    onChannelChange: (channel: string, checked: boolean) => void;
}

const CHANNELS = [
    { id: 'google-sem', name: 'Google SEM', icon: 'search' },
    { id: 'youtube', name: 'YouTube', icon: 'play_circle' },
    { id: 'facebook', name: 'Facebook', icon: 'groups' },
    { id: 'instagram', name: 'Instagram', icon: 'photo_camera' },
    { id: 'tiktok', name: 'TikTok', icon: 'music_note' },
    { id: 'snack-video', name: 'Snack Video', icon: 'videocam' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'work' },
    { id: 'display-banner', name: 'Display Banner', icon: 'web' },
    { id: 'ott-ads', name: 'OTT Ads', icon: 'tv' },
    { id: 'audio', name: 'Audio', icon: 'headphones' },
    { id: 'dooh', name: 'DOOH', icon: 'location_city' },
    { id: 'kol', name: 'KOL', icon: 'person' },
    { id: 'pr', name: 'PR', icon: 'newspaper' },
];

export const CampaignInfo = ({ formData, onInputChange, selectedChannels, onChannelChange }: CampaignInfoProps) => {
    return (
        <Card className="bg-card border border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                    Campaign Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Brand Name</Label>
                        <Input
                            value={formData.brandName || ''}
                            onChange={(e) => onInputChange('brandName', e.target.value)}
                            placeholder="Enter brand name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Category / Industry</Label>
                        <Input
                            value={formData.categoryBusiness || ''}
                            onChange={(e) => onInputChange('categoryBusiness', e.target.value)}
                            placeholder="Enter business category"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Campaign Name</Label>
                        <Input
                            value={formData.campaignName || ''}
                            onChange={(e) => onInputChange('campaignName', e.target.value)}
                            placeholder="Enter campaign name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Campaign Type</Label>
                        <Select value={formData.campaignType || ''} onValueChange={(val) => onInputChange('campaignType', val)}>
                            <SelectTrigger className="bg-card border-border text-foreground">
                                <SelectValue placeholder="Select funnel stage" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="top-funnel" className="text-foreground-soft focus:bg-card focus:text-foreground">Top Funnel (Awareness)</SelectItem>
                                <SelectItem value="middle-funnel" className="text-foreground-soft focus:bg-card focus:text-foreground">Middle Funnel (Consideration)</SelectItem>
                                <SelectItem value="bottom-funnel" className="text-foreground-soft focus:bg-card focus:text-foreground">Bottom Funnel (Conversion)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                        <Label>Campaign Objective</Label>
                        <Input
                            value={formData.campaignObjective || ''}
                            onChange={(e) => onInputChange('campaignObjective', e.target.value)}
                            placeholder="Enter campaign objective"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Channels</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {CHANNELS.map((ch) => (
                            <label
                                key={ch.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-all cursor-pointer hover:bg-card/80"
                            >
                                <Checkbox
                                    checked={selectedChannels.includes(ch.id)}
                                    onCheckedChange={(checked) => onChannelChange(ch.id, checked as boolean)}
                                    className="h-5 w-5"
                                />
                                <span className="material-symbols-outlined text-base text-foreground-soft">{ch.icon}</span>
                                <span className="text-sm font-medium">{ch.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
