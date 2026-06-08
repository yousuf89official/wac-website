import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

export const InstagramMockup = ({ type }: { type: 'feed-image' | 'feed-video' | 'story' | 'reel' }) => {
    if (type === 'story') {
        return (
            <div className="w-[300px] h-[533px] bg-gradient-to-tr from-purple-500 to-orange-400 rounded-[32px] overflow-hidden relative shadow-2xl border-[8px] border-black">
                {/* Progress Bar */}
                <div className="absolute top-4 left-0 w-full px-2 flex gap-1 z-20">
                    <div className="h-0.5 flex-1 bg-white/40 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-white"></div>
                    </div>
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 flex items-center gap-2 z-20">
                    <Avatar className="w-8 h-8 border-2 border-white/20">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className="text-white text-sm font-semibold text-shadow">Brand Name</span>
                    <span className="text-white/60 text-xs ml-1">2h</span>
                </div>

                {/* Content Area */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl rotate-[-15deg] opacity-80 mix-blend-overlay">STORY CONTENT</span>
                </div>

                {/* Footer */}
                <div className="absolute bottom-6 left-0 w-full px-4 flex items-center gap-4 z-20">
                    <div className="flex-1 h-11 border border-white/40 rounded-full flex items-center px-4 text-white text-sm">
                        Send message...
                    </div>
                    <Heart className="w-6 h-6 text-white" />
                    <Send className="w-6 h-6 text-white" />
                </div>
            </div>
        );
    }

    // Default Feed Post
    return (
        <div className="w-[370px] bg-black text-white rounded-xl border border-white/10 shadow-xl overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 ring-2 ring-red-500 ring-offset-1 ring-offset-black">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold leading-none">brand_official</span>
                        {type === 'feed-video' && <span className="text-[10px] text-white/60">Original Audio</span>}
                    </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-white" />
            </div>

            {/* Content */}
            <div className="w-full aspect-square bg-white/5 flex items-center justify-center relative group">
                {type === 'feed-video' ? (
                    <div className="text-muted-foreground text-sm flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center mb-2">▶</div>
                        Video Content
                    </div>
                ) : (
                    <span className="text-muted-foreground text-sm">Image Content (4:5 or 1:1)</span>
                )}
            </div>

            {/* Actions */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Heart className="w-6 h-6 hover:text-white/80 cursor-pointer" />
                        <MessageCircle className="w-6 h-6 hover:text-white/80 cursor-pointer" />
                        <Send className="w-6 h-6 hover:text-white/80 cursor-pointer" />
                    </div>
                    <Bookmark className="w-6 h-6 hover:text-white/80 cursor-pointer" />
                </div>
                <div className="text-sm font-semibold mb-1">1,234 likes</div>
                <div className="text-sm">
                    <span className="font-semibold mr-1">brand_official</span>
                    <span className="text-white/80">Launching our new summer campaign! ☀️ #summer #vibes</span>
                </div>
                <div className="text-xs text-white/40 mt-1 uppercase">2 HOURS AGO</div>
            </div>
        </div>
    );
};
