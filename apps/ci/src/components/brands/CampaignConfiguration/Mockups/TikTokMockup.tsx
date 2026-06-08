import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Music } from "lucide-react";

export const TikTokMockup = ({ type }: { type: 'feed-video' | 'top-view' }) => {
    return (
        <div className="w-[300px] h-[533px] bg-black rounded-[24px] overflow-hidden relative shadow-2xl border-[4px] border-zinc-800">
            {/* Content Placeholder */}
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <span className="text-zinc-600 font-medium">9:16 Vertical Video</span>
                {type === 'top-view' && (
                    <div className="absolute top-4 left-4 bg-cyan-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">Ad</div>
                )}
            </div>

            {/* Sidebar Actions */}
            <div className="absolute bottom-20 right-2 flex flex-col items-center gap-4 z-20">
                <div className="relative mb-2">
                    <Avatar className="w-10 h-10 border border-white">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-lg">+</div>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <Heart className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
                    <span className="text-white text-xs font-medium drop-shadow-md">84.2k</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
                    <span className="text-white text-xs font-medium drop-shadow-md">1,240</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <Share2 className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
                    <span className="text-white text-xs font-medium drop-shadow-md">512</span>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                <div className="mb-2 text-white text-shadow-sm">
                    <div className="font-semibold text-sm mb-1">@brand_official</div>
                    <div className="text-sm leading-tight opacity-90 pr-12">
                        Get ready for the biggest sale of the year! Don't miss out 🔥 #sale #promo #viral
                    </div>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                    <Music className="w-3 h-3 animate-spin-slow" />
                    <div className="text-xs overflow-hidden w-32">
                        <div className="whitespace-nowrap animate-marquee">Original Sound - Brand Official Music</div>
                    </div>
                </div>
            </div>

            {/* Disc */}
            <div className="absolute bottom-4 right-4 z-20">
                <div className="w-10 h-10 bg-zinc-800 rounded-full border-4 border-zinc-900 overflow-hidden animate-spin-slow">
                    <img src="https://github.com/shadcn.png" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
    );
};
