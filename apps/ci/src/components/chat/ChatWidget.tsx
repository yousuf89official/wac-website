'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, MessageSquare, Send } from 'lucide-react';

// Types
export type ChatUser = {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'busy' | 'offline';
};

export type ChatMessage = {
    id: number;
    text: string;
    sender: 'me' | 'them';
    timestamp: string;
};

// Mock Data
const MOCK_CHAT_USERS: ChatUser[] = [
    { id: 'u1', name: 'Sarah Miller', role: 'Brand Manager', status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop' },
    { id: 'u2', name: 'David Chen', role: 'Performance Lead', status: 'busy', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop' },
    { id: 'u3', name: 'Emma Wilson', role: 'Creative Director', status: 'offline', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop' },
];

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
        'u1': [
            { id: 1, text: 'Hey, did you see the CTR on the new campaign?', sender: 'them', timestamp: '10:30 AM' },
            { id: 2, text: 'Yeah, it\'s looking great! Way above benchmark.', sender: 'me', timestamp: '10:31 AM' },
        ]
    });
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeUser, isTyping]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeUser) return;

        const newMessage: ChatMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
            ...prev,
            [activeUser]: [...(prev[activeUser] || []), newMessage]
        }));
        setInputText('');

        // Simulate reply
        setIsTyping(true);
        setTimeout(() => {
            const replyMessage: ChatMessage = {
                id: Date.now() + 1,
                text: 'Got it! I will update the report shortly.',
                sender: 'them',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => ({
                ...prev,
                [activeUser]: [...(prev[activeUser] || []), replyMessage]
            }));
            setIsTyping(false);
        }, 2000);
    };

    const activeUserData = activeUser ? MOCK_CHAT_USERS.find(u => u.id === activeUser) : null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            {isOpen && (
                <div className="bg-white/[0.04] rounded-xl shadow-2xl border border-white/10 w-80 sm:w-96 flex flex-col overflow-hidden transition-all duration-200 origin-bottom-right" style={{ height: '500px' }}>
                    {/* Header */}
                    <div className="p-4 border-b border-white/[0.06] bg-white/[0.03] flex justify-between items-center">
                        {activeUser ? (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" onClick={() => setActiveUser(null)}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div className="relative">
                                    <img src={activeUserData?.avatar} alt={activeUserData?.name || 'User'} className="h-8 w-8 rounded-full object-cover" />
                                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${activeUserData?.status === 'online' ? 'bg-green-500' : activeUserData?.status === 'busy' ? 'bg-red-500' : 'bg-white/[0.08]'}`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-white">{activeUserData?.name}</h4>
                                    <p className="text-[10px] text-white/50">{activeUserData?.role}</p>
                                </div>
                            </div>
                        ) : (
                            <h3 className="font-bold text-white">Team Chat</h3>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-white/[0.04] p-4">
                        {activeUser ? (
                            <div className="space-y-4">
                                {(messages[activeUser] || []).map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'me' ? 'bg-[rgba(22,32,50,0.8)] text-white rounded-br-none' : 'bg-white/[0.06] text-white rounded-bl-none'}`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-white/40 mt-1 px-1">{msg.timestamp}</span>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex items-center gap-1 text-white/40 text-xs ml-2">
                                        <span className="animate-bounce">●</span>
                                        <span className="animate-bounce delay-100">●</span>
                                        <span className="animate-bounce delay-200">●</span>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {MOCK_CHAT_USERS.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => setActiveUser(user.id)}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.06] cursor-pointer transition-colors group"
                                    >
                                        <div className="relative">
                                            <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' : user.status === 'busy' ? 'bg-red-500' : 'bg-white/[0.08]'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-sm text-white group-hover:text-blue-600 transition-colors">{user.name}</h4>
                                                <span className="text-[10px] text-white/40">10:30 AM</span>
                                            </div>
                                            <p className="text-xs text-white/50 truncate">{user.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer (Input) */}
                    {activeUser && (
                        <div className="p-3 border-t border-white/[0.06] bg-white/[0.04]">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 text-sm bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[rgba(22,32,50,0.8)] transition-all text-white"
                                />
                                <Button type="submit" size="icon" className="rounded-full h-9 w-9 shrink-0 bg-[rgba(22,32,50,0.8)] hover:bg-white/[0.08]">
                                    <Send className="h-4 w-4 ml-0.5" />
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-white/[0.08] text-white/60 rotate-90' : 'bg-[rgba(22,32,50,0.8)] text-white'}`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </button>
        </div>
    );
};
