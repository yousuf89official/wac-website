'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDevConsole } from '@/contexts/DevConsoleContext';
import {
    Terminal,
    Trash2,
    Search,
    ExternalLink,
    AlertCircle,
    Activity,
    Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const DevConsole = () => {
    const { logs, clearLogs } = useDevConsole();
    const [height, setHeight] = useState(200);
    const [isMinimized, setIsMinimized] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current && !isMinimized && !expandedLog) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isMinimized, expandedLog]);

    // Resizing logic
    const startResizing = useCallback((e: React.MouseEvent) => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'row-resize';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight > 50 && newHeight < window.innerHeight * 0.95) {
            setHeight(newHeight);
        }
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'all' || log.type === filter;
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.sender.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-[9999]">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="flex items-center gap-2 bg-background-2 border border-border text-foreground px-3 py-1.5 rounded-md shadow-2xl hover:bg-card transition-all group scale-90 hover:scale-100"
                >
                    <Terminal className="h-3.5 w-3.5 text-success" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Console</span>
                    {logs.length > 0 && (
                        <span className="bg-success text-success-foreground text-[9px] font-black px-1 py-0.5 rounded-sm">
                            {logs.length}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div
            style={{ height: `${height}px` }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-background-2 border-t border-border flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.9)]"
        >
            {/* Resize Handle */}
            <div
                onMouseDown={startResizing}
                className="h-1 w-full cursor-row-resize bg-card hover:bg-success/50 transition-colors"
                title="Drag to resize"
            />

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1 bg-background-2 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 grayscale opacity-70">
                        <Terminal className="h-3 w-3 text-foreground" />
                        <h2 className="text-[9px] font-black text-foreground uppercase tracking-widest">Protocol.Terminal</h2>
                    </div>

                    <div className="flex items-center gap-1.5 bg-card border border-border rounded px-1.5 h-5">
                        <Search className="h-2 w-2 text-foreground/30" />
                        <input
                            type="text"
                            placeholder="Filter..."
                            className="bg-transparent border-none outline-none text-[9px] text-foreground w-24 font-normal placeholder:text-foreground/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-0.5">
                        {['all', 'request', 'response', 'error'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter transition-all",
                                    filter === t ? "bg-foreground text-background-2" : "text-foreground/30 hover:text-foreground"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={clearLogs}
                        className="p-1 hover:bg-card rounded text-foreground/20 hover:text-foreground transition-colors"
                        title="Clear Console"
                    >
                        <Trash2 className="h-2.5 w-2.5" />
                    </button>
                    <div className="w-px h-3 bg-card mx-1" />
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-card hover:bg-card border border-border rounded text-foreground/70 hover:text-foreground text-[9px] font-bold uppercase tracking-wider transition-all"
                    >
                        Shrink
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-1.5 font-mono text-[10px] space-y-px leading-none bg-background-2 selection:bg-foreground selection:text-background-2"
            >
                {filteredLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-foreground/10 gap-1 select-none">
                        <Activity className="h-5 w-5" />
                        <p className="font-black uppercase tracking-[0.3em] text-[7px]">Ready.</p>
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className={cn(
                                "flex flex-col border-b border-border py-0.5 cursor-pointer hover:bg-card transition-colors group",
                                log.type === 'error' ? "bg-destructive/5" : ""
                            )}
                        >
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-foreground/20 shrink-0 tabular-nums">
                                    {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
                                    {log.timestamp.getMilliseconds().toString().padStart(3, '0')}
                                </span>
                                <span className={cn(
                                    "shrink-0 font-black px-1 uppercase text-[8px] tracking-tighter rounded-[1px]",
                                    log.type === 'request' ? "bg-card text-foreground-soft" :
                                        log.type === 'response' ? "bg-success/10 text-success" :
                                            log.type === 'error' ? "bg-destructive/20 text-destructive" : "bg-card text-foreground/40"
                                )}>
                                    {log.type.slice(0, 3)}
                                </span>
                                <span className="text-foreground/40 font-bold shrink-0">{log.sender}:</span>
                                <span className={cn(
                                    "truncate font-medium",
                                    log.type === 'error' ? "text-destructive" : "text-foreground"
                                )}>
                                    {log.message}
                                </span>
                                {log.origin && (
                                    <span className="ml-auto text-foreground/20 text-[8px] font-bold truncate max-w-[150px] flex items-center gap-1 group-hover:text-foreground/40" title={log.origin}>
                                        <Code className="h-2 w-2" />
                                        {log.origin.split('/').pop()?.split('?')[0]}
                                    </span>
                                )}
                            </div>

                            {expandedLog === log.id && (
                                <div className="mt-1 mx-2 p-2 bg-background-2 border border-border rounded-sm selection:bg-success animate-in fade-in slide-in-from-top-1 duration-200">
                                    {log.data && (
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest border-b border-border pb-1 flex items-center gap-1">
                                                <ExternalLink className="h-2 w-2" /> Payload Data
                                            </p>
                                            <pre className="text-foreground/80 overflow-x-auto p-1 text-[9px] leading-tight">
                                                {JSON.stringify(log.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {(log.stack || log.origin) && (
                                        <div className="mt-2 pt-2 border-t border-border">
                                            <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest flex items-center gap-1">
                                                <AlertCircle className="h-2 w-2" /> Call Stack
                                            </p>
                                            <p className="text-[9px] text-foreground/40 break-all leading-tight italic mt-1 font-mono">
                                                {log.stack || log.origin}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-3 h-4 bg-background-2 border-t border-border flex justify-between items-center shrink-0">
                <div className="flex gap-4">
                    <span className="text-[8px] text-foreground/20 font-black uppercase">
                        BUF: <span className="text-success">{logs.length}</span>
                    </span>
                    <span className="text-[8px] text-foreground/20 font-black uppercase">
                        HGT: <span className="text-foreground-soft">{height}px</span>
                    </span>
                </div>
                <div className="flex items-center gap-1.5 opacity-30">
                    <div className="h-0.5 w-0.5 rounded-full bg-success" />
                    <span className="text-[7px] text-foreground font-black uppercase tracking-[0.2em]">Runtime.Active</span>
                </div>
            </div>
        </div>
    );
};
