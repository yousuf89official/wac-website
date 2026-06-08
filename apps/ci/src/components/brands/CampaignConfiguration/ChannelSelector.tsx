import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMasterData } from "@/contexts/MasterDataContext";

interface ChannelSelectorProps {
    selectedIds: string[];
    onToggle: (channelId: string) => void;
    allowedChannels?: string[];
}

export const ChannelSelector = ({ selectedIds, onToggle, allowedChannels }: ChannelSelectorProps) => {
    const { channels } = useMasterData();

    const filteredChannels = channels.filter(c => {
        if (!allowedChannels || allowedChannels.includes('all')) return true;
        return allowedChannels.includes(c.id);
    });

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredChannels.map((channel) => {
                const isSelected = selectedIds.includes(channel.id);
                return (
                    <div
                        key={channel.id}
                        onClick={() => onToggle(channel.id)}
                        className={cn(
                            "group cursor-pointer relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                            isSelected
                                ? "border-primary bg-primary/10"
                                : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-transform group-hover:scale-110",
                            channel.logo
                        )}>
                            {/* Simple Logic for icons based on name first char if no svg provided yet */}
                            {channel.name?.charAt(0) || '?'}
                        </div>
                        <span className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-primary" : "text-muted-foreground group-hover:text-white"
                        )}>
                            {channel.name}
                        </span>

                        {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">
                                <Check size={12} strokeWidth={3} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
