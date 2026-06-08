import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CHANNELS } from '@/constants';
import { X, ExternalLink, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MockupModalProps {
    isOpen: boolean;
    onClose: () => void;
    channelId: string | undefined;
    campaignName?: string;
    creativeUrl?: string;
    postUrl?: string;
    metrics?: {
        views?: number;
        likes?: number;
        comments?: number;
        shares?: number;
        saves?: number;
        clicks?: number;
        conversions?: number;
        ctr?: number;
        impressions?: number;
    };
}

export const MockupModal = ({ isOpen, onClose, channelId, campaignName, creativeUrl, postUrl, metrics }: MockupModalProps) => {
    if (!channelId) return null;

    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return null;

    // Helper to format numbers
    const fmt = (num?: number) => {
        if (!num) return '0';
        if (num > 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num > 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // UI Renderers per Channel
    const renderContentOverlay = () => {
        // TIKTOK OVERLAY
        if (channel.id === 'tiktok') {
            return (
                <div className="absolute right-2 bottom-12 flex flex-col gap-4 items-center z-20">
                    <div className="absolute -right-1 top-0 w-12 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />

                    <div className="relative group">
                        <div className="w-10 h-10 rounded-full bg-white/[0.04] p-0.5 mb-4 shadow-lg">
                            <div className="w-full h-full rounded-full bg-gray-300 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=${campaignName}&background=random`} alt="Avatar" />
                            </div >
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px]">+</div>
                        </div >
                    </div >

                    {
                        [
                            { icon: Heart, val: metrics?.likes, label: 'Likes' },
                            { icon: MessageCircle, val: metrics?.comments, label: 'Comments' },
                            { icon: Bookmark, val: metrics?.saves, label: 'Saves' },
                            { icon: Share2, val: metrics?.shares, label: 'Shares' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <item.icon size={28} className="fill-white text-white drop-shadow-md" />
                                <span className="text-xs font-bold text-white drop-shadow-md">{fmt(item.val)}</span>
                            </div>
                        ))
                    }

                    < div className="w-10 h-10 rounded-full bg-black/80 border-[3px] border-gray-800 flex items-center justify-center mt-4 animate-spin-slow" >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500" />
                    </div >
                </div >
            );
        }

        // INSTAGRAM REEL/STORY OVERLAY
        if (channel.id === 'instagram') {
            return (
                <div className="absolute right-4 bottom-20 flex flex-col gap-4 items-center z-20">
                    {[
                        { icon: Heart, val: metrics?.likes },
                        { icon: MessageCircle, val: metrics?.comments },
                        { icon: Share2, val: metrics?.shares }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <item.icon size={24} className="text-white drop-shadow-md" />
                            <span className="text-xs font-medium text-white drop-shadow-md">{fmt(item.val)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-background-2 border-border max-w-4xl p-0 overflow-hidden gap-0">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] h-[80vh]">

                    {/* Left: Preview Area */}
                    <div className="bg-card flex items-center justify-center p-8 relative border-r border-border">
                        <div className="absolute top-4 left-4 flex gap-2 z-10">
                            <Badge className={`${channel.color} text-white border-none`}>
                                {channel.name}
                            </Badge>
                            <Badge variant="outline" className="bg-background-2/50 text-foreground-soft border-border">
                                {campaignName || 'Campaign Preview'}
                            </Badge>
                        </div>

                        {/* Simulated Device/Content */}
                        <div className={`relative bg-black rounded-xl border border-[#333] shadow-2xl overflow-hidden group ${channel.id === 'tiktok' || channel.id.includes('instagram') ? 'aspect-[9/16] h-full max-h-[600px] rounded-3xl border-4' : 'aspect-video w-full max-w-2xl'}`}>

                            {/* Content */}
                            {creativeUrl ? (
                                <img src={creativeUrl} alt="Ad Content" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center text-gray-600">
                                    <div className="text-center">
                                        <span className="block text-4xl mb-2">📷</span>
                                        <span className="text-sm font-medium">No Asset Extracted</span>
                                    </div>
                                </div>
                            )}

                            {/* Overlays */}
                            {renderContentOverlay()}

                            {/* Simple Footer for Generic/Web */}
                            {!['tiktok', 'instagram'].includes(channel.id) && (
                                <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur p-3 flex justify-between items-center text-white">
                                    <span className="text-xs font-semibold">Sponsored</span>
                                    <Button size="sm" variant="secondary" className="h-6 text-xs">Learn More</Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Metrics & Details */}
                    <div className="bg-background-2 flex flex-col h-full">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Asset Performance</h3>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-foreground-soft hover:text-foreground">
                                <X size={16} />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Total Impact Card */}
                            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <p className="text-xs text-primary/70 mb-1">Total Views/Impressions</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-foreground">{fmt(metrics?.views || metrics?.impressions)}</span>
                                    <span className="text-xs text-success">{(metrics?.ctr || 0) > 1.5 ? 'High Performace' : 'Standard'}</span>
                                </div>
                            </div>

                            {/* Detailed Metrics List */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-foreground-soft uppercase tracking-wider">Metrics</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(metrics || {}).map(([key, val]) => (
                                        <div key={key} className="p-2 bg-card border border-border rounded">
                                            <p className="text-[10px] text-foreground-soft uppercase mb-0.5">{key}</p>
                                            <p className="text-sm font-mono text-foreground">{fmt(val)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-foreground-soft uppercase tracking-wider">Asset Details</p>
                                <div className="space-y-2 text-xs text-foreground-soft">
                                    <div className="flex justify-between">
                                        <span>Source</span>
                                        <span className="text-foreground capitalize">{channel.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status</span>
                                        <span className="text-success">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border">
                            {postUrl ? (
                                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => window.open(postUrl, '_blank')}>
                                    <ExternalLink size={16} /> View on {channel.name}
                                </Button>
                            ) : (
                                <Button disabled className="w-full bg-card text-foreground-soft gap-2">
                                    <ExternalLink size={16} /> Link not configured
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
