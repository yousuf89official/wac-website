import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe } from "lucide-react";

export const FacebookMockup = ({ type }: { type: 'feed-image' | 'feed-video' | 'story' | 'in-stream' }) => {
    return (
        <div className="w-[370px] bg-[#1c1e21] text-white rounded-lg border border-white/10 shadow-xl overflow-hidden font-sans">
            {/* Header */}
            <div className="p-3 flex items-start justify-between">
                <div className="flex gap-2">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-sm">Brand Name</div>
                        <div className="flex items-center text-xs text-gray-400 gap-1">
                            <span>2h</span>
                            <span>•</span>
                            <Globe className="w-3 h-3" />
                        </div>
                    </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </div>

            {/* Caption */}
            <div className="px-3 pb-3 text-sm">
                Check out our latest updates for the season! We bring you the best quality products directly to your doorstep.
            </div>

            {/* Content */}
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
                {type === 'in-stream' ? (
                    <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 text-xs rounded text-white font-medium">Sponsored • 0:15</div>
                ) : null}
                <span className="text-gray-500 text-sm">
                    {type === 'feed-video' || type === 'in-stream' ? 'Video Content (16:9)' : 'Image Content'}
                </span>
            </div>

            {/* Social Proof */}
            <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-400 border-b border-white/10">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <ThumbsUp className="w-2.5 h-2.5 text-white" fill="white" />
                    </div>
                    <span>420</span>
                </div>
                <div className="flex gap-3">
                    <span>24 Comments</span>
                    <span>5 Shares</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center px-1 py-1">
                <div className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors text-gray-400 font-medium text-sm">
                    <ThumbsUp className="w-4 h-4" /> Like
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors text-gray-400 font-medium text-sm">
                    <MessageCircle className="w-4 h-4" /> Comment
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors text-gray-400 font-medium text-sm">
                    <Share2 className="w-4 h-4" /> Share
                </div>
            </div>
        </div>
    );
};
