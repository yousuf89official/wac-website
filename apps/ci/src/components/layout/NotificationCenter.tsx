'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Zap, Play, RefreshCw, MessageSquare, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ActivityLog {
    id: string;
    action: string;
    detail: string | null;
    userName: string | null;
    target: string | null;
    severity: string | null;
    createdAt: string;
}

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    from: string;
    timestamp: Date;
}

type NotificationType =
    | 'alert_triggered'
    | 'rule_triggered'
    | 'campaign_status'
    | 'sync_complete'
    | 'comment_added'
    | 'system';

const notificationConfig: Record<NotificationType, { icon: typeof Bell; colorClass: string }> = {
    alert_triggered: { icon: Bell, colorClass: 'text-destructive bg-destructive/10' },
    rule_triggered: { icon: Zap, colorClass: 'text-warning bg-warning/10' },
    campaign_status: { icon: Play, colorClass: 'text-success bg-success/10' },
    sync_complete: { icon: RefreshCw, colorClass: 'text-primary bg-primary/10' },
    comment_added: { icon: MessageSquare, colorClass: 'text-primary bg-primary/10' },
    system: { icon: Info, colorClass: 'text-foreground-soft bg-card' },
};

function mapActionToType(action: string): NotificationType {
    const lower = action.toLowerCase();
    if (lower.includes('alert')) return 'alert_triggered';
    if (lower.includes('rule') || lower.includes('automation')) return 'rule_triggered';
    if (lower.includes('campaign') || lower.includes('status')) return 'campaign_status';
    if (lower.includes('sync') || lower.includes('refresh')) return 'sync_complete';
    if (lower.includes('comment') || lower.includes('message')) return 'comment_added';
    return 'system';
}

function formatTitle(action: string): string {
    return action
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [lastOpenedAt, setLastOpenedAt] = useState<Date>(() => new Date());
    const [isOpen, setIsOpen] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/activity-logs?limit=20');
            if (!res.ok) return;
            const logs: ActivityLog[] = await res.json();

            const mapped: Notification[] = logs.map((log) => ({
                id: log.id,
                type: mapActionToType(log.action),
                title: formatTitle(log.action),
                description: log.detail || log.target || '',
                from: log.userName || 'System',
                timestamp: new Date(log.createdAt),
            }));

            setNotifications(mapped);
        } catch {
            // Silently fail — notifications are non-critical
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        intervalRef.current = setInterval(fetchNotifications, 60_000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchNotifications]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Mark all current notifications as read by updating last opened time
            setLastOpenedAt(new Date());
        }
    };

    const unreadCount = notifications.filter(
        (n) => n.timestamp > lastOpenedAt
    ).length;

    const markAllRead = () => {
        setLastOpenedAt(new Date());
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    className="relative w-9 h-9 rounded-lg bg-card border border-border hover:bg-card/80 flex items-center justify-center transition-colors"
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="w-4 h-4 text-foreground-soft" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground font-medium flex items-center justify-center leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[380px] bg-card border border-border rounded-xl shadow-2xl p-0"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    <button
                        onClick={markAllRead}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                        Mark all read
                    </button>
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-foreground-soft text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const config = notificationConfig[notification.type];
                            const IconComponent = config.icon;
                            const isUnread = notification.timestamp > lastOpenedAt;

                            return (
                                <div
                                    key={notification.id}
                                    className="hover:bg-card/80 px-4 py-3 border-b border-border flex gap-3 items-start transition-colors"
                                >
                                    {/* Icon */}
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.colorClass}`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground truncate">
                                                {notification.title}
                                            </span>
                                            {isUnread && (
                                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-foreground-soft truncate mt-0.5">
                                            {notification.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] text-foreground-soft/60">
                                                {notification.from}
                                            </span>
                                            <span className="text-[11px] text-foreground-soft/60">·</span>
                                            <span className="text-[11px] text-foreground-soft/60">
                                                {relativeTime(notification.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-4 py-2.5">
                    <a
                        href="/admin/activity-logs"
                        className="text-xs text-foreground-soft hover:text-foreground transition-colors flex items-center justify-center"
                    >
                        View all activity
                    </a>
                </div>
            </PopoverContent>
        </Popover>
    );
}
