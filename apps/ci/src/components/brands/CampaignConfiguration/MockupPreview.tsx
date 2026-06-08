import { InstagramMockup } from "./Mockups/InstagramMockup";
import { FacebookMockup } from "./Mockups/FacebookMockup";
import { TikTokMockup } from "./Mockups/TikTokMockup";
import type { CssMockup } from "@/services/api";

interface MockupPreviewProps {
    mockup: CssMockup;
}

export const MockupPreview = ({ mockup }: MockupPreviewProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/50 rounded-xl border border-white/5 h-full">
            <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">{mockup.name} ({mockup.channelId})</h3>

            <div className="scale-90 origin-top transform transition-all duration-500 hover:scale-100">
                {mockup.channelId === 'instagram' && <InstagramMockup type={mockup.componentType as any} />}
                {mockup.channelId === 'facebook' && <FacebookMockup type={mockup.componentType as any} />}
                {mockup.channelId === 'tiktok' && <TikTokMockup type={mockup.componentType as any} />}
            </div>
        </div>
    );
};
