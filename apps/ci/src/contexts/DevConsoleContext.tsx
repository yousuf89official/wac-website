'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { triggerLoading } from './LoadingContext';

export interface ConsoleLog {
    id: string;
    type: 'request' | 'response' | 'info' | 'error' | 'success';
    sender: string;
    message: string;
    data?: any;
    stack?: string;
    origin?: string;
    timestamp: Date;
}

interface DevConsoleContextType {
    logs: ConsoleLog[];
    addLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void;
    clearLogs: () => void;
}

const DevConsoleContext = createContext<DevConsoleContextType | undefined>(undefined);

// Static holder for non-component access (e.g. from services/api.ts)
let staticAddLog: ((log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void) | null = null;

export const triggerDevLog = (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => {
    if (staticAddLog) {
        staticAddLog(log);
    } else {
        // Fallback to console during initialization
        console.log(`[DevLog Pending] ${log.sender}: ${log.message}`, log.data);
    }
};

export function DevConsoleProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<ConsoleLog[]>([]);

    const addLog = useCallback((log: Omit<ConsoleLog, 'id' | 'timestamp'>) => {
        const newLog: ConsoleLog = {
            ...log,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date(),
        };
        setLogs(prev => [...prev, newLog].slice(-200)); // Keep last 200 logs
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    // Connect static holder
    useEffect(() => {
        staticAddLog = addLog;
        triggerDevLog({
            type: 'success',
            sender: 'System',
            message: 'Dev Protocol Active - Monitoring Fetch/XHR traffic'
        });
        return () => {
            staticAddLog = null;
        };
    }, [addLog]);

    // Global Network Interceptors (Fetch & XHR)
    useEffect(() => {
        // --- FETCH INTERCEPTOR ---
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const [resource, config] = args;
            const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.href : resource.url;
            const method = config?.method || 'GET';
            const startTime = performance.now();
            const requestId = Math.random().toString(36).substring(7);
            const origin = new Error().stack?.split('\n')[2]?.trim() || 'unknown';

            triggerLoading(true);

            let parsedBody = undefined;
            if (config?.body) {
                try {
                    parsedBody = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
                } catch (e) {
                    parsedBody = config.body;
                }
            }

            triggerDevLog({
                type: 'request',
                sender: 'Network',
                message: `${method} ${url}`,
                origin,
                data: { method, url, requestId, body: parsedBody }
            });

            try {
                const response = await originalFetch(...args);
                const duration = Math.round(performance.now() - startTime);
                const clone = response.clone();

                clone.json().then(data => {
                    triggerDevLog({
                        type: 'response',
                        sender: 'Network',
                        message: `${response.status} ${method} ${url} (${duration}ms)`,
                        origin,
                        data: { status: response.status, payload: data, requestId, duration }
                    });
                }).catch(() => {
                    triggerDevLog({
                        type: 'response',
                        sender: 'Network',
                        message: `${response.status} ${method} ${url} (${duration}ms) [No JSON]`,
                        origin,
                        data: { status: response.status, requestId, duration }
                    });
                }).finally(() => {
                    triggerLoading(false);
                });

                return response;
            } catch (error: any) {
                const duration = Math.round(performance.now() - startTime);
                triggerLoading(false);
                triggerDevLog({
                    type: 'error',
                    sender: 'Network',
                    message: `FAILED ${method} ${url} (${duration}ms)`,
                    origin,
                    data: { error: error.message, requestId, duration },
                    stack: error.stack
                });
                throw error;
            }
        };

        // --- XHR INTERCEPTOR ---
        const XHR = XMLHttpRequest.prototype;
        const originalOpen = XHR.open;
        const originalSend = XHR.send;

        (XHR as any).open = function (this: any, method: string, url: string) {
            this._method = method;
            this._url = url;
            this._startTime = performance.now();
            this._requestId = Math.random().toString(36).substring(7);
            return originalOpen.apply(this, arguments as any);
        };

        (XHR as any).send = function (this: any, postData: any) {
            triggerLoading(true);
            triggerDevLog({
                type: 'request',
                sender: 'XHR',
                message: `${this._method} ${this._url}`,
                data: { method: this._method, url: this._url, body: postData, requestId: this._requestId }
            });

            const handleFinish = () => triggerLoading(false);

            this.addEventListener('load', function (this: any) {
                const duration = Math.round(performance.now() - this._startTime);
                let payload = {};
                try { payload = JSON.parse(this.responseText); } catch (e) { }

                triggerDevLog({
                    type: 'response',
                    sender: 'XHR',
                    message: `${this.status} ${this._method} ${this._url} (${duration}ms)`,
                    data: { status: this.status, payload, requestId: this._requestId, duration }
                });
                handleFinish();
            });

            this.addEventListener('error', function (this: any) {
                const duration = Math.round(performance.now() - this._startTime);
                triggerDevLog({
                    type: 'error',
                    sender: 'XHR',
                    message: `FAILED ${this._method} ${this._url} (${duration}ms)`,
                    data: { status: this.status, requestId: this._requestId, duration }
                });
                handleFinish();
            });

            this.addEventListener('abort', handleFinish);

            return originalSend.apply(this, arguments as any);
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    return (
        <DevConsoleContext.Provider value={{ logs, addLog, clearLogs }}>
            {children}
        </DevConsoleContext.Provider>
    );
}

export function useDevConsole() {
    const context = useContext(DevConsoleContext);
    if (context === undefined) {
        throw new Error('useDevConsole must be used within a DevConsoleProvider');
    }
    return context;
}
