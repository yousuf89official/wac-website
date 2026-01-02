import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { usePathname } from 'next/navigation';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const sessionIdRef = useRef<string>('');
    const pathname = usePathname();
    const [timeOnPage, setTimeOnPage] = useState(0);
    const [input, setInput] = useState('');

    // Initialize/Persist Session ID
    useEffect(() => {
        let storedSession = localStorage.getItem('chat_session_id');
        if (!storedSession) {
            storedSession = uuidv4();
            localStorage.setItem('chat_session_id', storedSession);
        }
        sessionIdRef.current = storedSession;
    }, []);

    // Track Time on Page
    useEffect(() => {
        setTimeOnPage(0);
        const timer = setInterval(() => setTimeOnPage(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, [pathname]);

    const { messages, sendMessage, status } = useChat({
        messages: [
            {
                id: 'welcome',
                role: 'assistant',
                parts: [{ type: 'text', text: "Hi! I'm your Collaborative Assistant. How can I help you grow your business today?" }]
            }
        ] as UIMessage[],
        onFinish: (message) => {
            console.log('[ChatWidget] Stream finished:', message);
        },
        onError: (error) => {
            console.error('[ChatWidget] Stream error:', error);
        }
    });

    // Monitor stream start via status change
    useEffect(() => {
        if (status === 'streaming') {
            console.log('[ChatWidget] Stream started (status change)');
        }
    }, [status]);

    const isLoading = status === 'streaming' || status === 'submitted';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Use sendMessage if provided by the hook, or handle it manually if needed
        // Assuming sendMessage is the correct function based on previous code
        await sendMessage(
            { text: input },
            {
                body: {
                    sessionId: sessionIdRef.current,
                    behaviorContext: {
                        currentPath: pathname,
                        timeOnPage: timeOnPage
                    }
                }
            }
        );
        setInput('');
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // Helper to render message content from parts
    const renderMessageContent = (m: any) => {
        if (m.content && typeof m.content === 'string') return m.content;
        if (m.parts) {
            return m.parts.map((part: any, idx: number) => {
                if (part.type === 'text') return <span key={idx}>{part.text}</span>;
                // Handle other part types if needed (e.g. reasoning, tools)
                return null;
            });
        }
        return '';
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#b000ff] text-white shadow-[0_0_30px_rgba(176,0,255,0.5)] hover:scale-110 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4"
            >
                <MessageCircle size={32} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-[#0a0a0a] border border-[#333] rounded-[2rem] shadow-[0_10px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border-b border-[#333] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
                    <span className="font-bold text-white tracking-wide">Collaborative Assistant</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {messages.map(m => (
                    <div
                        key={m.id}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-white/10 text-white rounded-tr-none'
                                : 'bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-tl-none'
                                }`}
                        >
                            {renderMessageContent(m)}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#1a1a1a] border border-[#333] p-3 rounded-2xl rounded-tl-none">
                            <span className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-[#0a0a0a] border-t border-[#333]">
                <div className="relative">
                    <input
                        className="w-full bg-[#1a1a1a] text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-[#00f0ff] border border-transparent placeholder-gray-500 text-sm"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#00f0ff] transition-colors disabled:opacity-50"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="text-[10px] text-gray-600 text-center mt-2">
                    Powered by Gemini
                </div>
            </form>
        </div>
    );
};

export default ChatWidget;
