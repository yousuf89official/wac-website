'use client';

import React, { useState, useEffect } from 'react';
import {
    Database,
    RefreshCcw,
    Layout,
    Table as TableIcon,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { SchemaView } from '@/components/admin/database/SchemaView';
import { DataBrowser } from '@/components/admin/database/DataBrowser';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DatabasePage() {
    const [activeView, setActiveView] = useState<'schema' | 'data'>('schema');
    const [schema, setSchema] = useState<any>(null);
    const [tables, setTables] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDatabaseInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const [schemaResp, tablesResp] = await Promise.all([
                fetch('/api/admin/database/schema'),
                fetch('/api/admin/database/tables')
            ]);

            if (!schemaResp.ok || !tablesResp.ok) throw new Error('Failed to fetch database information');

            const [schemaData, tablesData] = await Promise.all([
                schemaResp.json(),
                tablesResp.json()
            ]);

            setSchema(schemaData);
            setTables(tablesData);
            toast.success('Database architecture synchronized');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(msg);
            toast.error(`Database Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchDatabaseInfo();
    }, []);

    return (
        <div className="space-y-8">
            <header className="mb-12">
                <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-3">
                    Intelligence · Admin · Database
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
                    Database Manager
                </h1>
            </header>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                        <Database className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-widest">System Architecture</span>
                    </div>
                    <p className="text-foreground-soft font-medium">Native introspection and data browsing for SQLite</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-card rounded-xl border border-border">
                        <button
                            onClick={() => setActiveView('schema')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                                activeView === 'schema' ? "bg-card text-primary shadow-sm border border-border" : "text-foreground-soft hover:text-foreground"
                            )}
                        >
                            <Layout className="h-4 w-4" /> ER DIAGRAM
                        </button>
                        <button
                            onClick={() => setActiveView('data')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                                activeView === 'data' ? "bg-card text-primary shadow-sm border border-border" : "text-foreground-soft hover:text-foreground"
                            )}
                        >
                            <TableIcon className="h-4 w-4" /> DATA BROWSER
                        </button>
                    </div>
                    <button
                        onClick={fetchDatabaseInfo}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                    >
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} /> REFRESH
                    </button>
                </div>
            </div>

            {error ? (
                <div className="p-12 bg-destructive/10 border border-destructive rounded-2xl flex flex-col items-center justify-center text-destructive text-center gap-4">
                    <AlertCircle className="h-12 w-12" />
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold uppercase">Introspection Failed</h3>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                    <button
                        onClick={fetchDatabaseInfo}
                        className="px-6 py-2 bg-destructive text-foreground rounded-lg font-bold text-xs hover:bg-destructive/90 transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : loading && !schema ? (
                <div className="h-[600px] flex items-center justify-center bg-card border border-dashed border-border rounded-2xl">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-foreground-soft font-bold uppercase text-xs tracking-widest animate-pulse">Introspecting Database Schema...</p>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeView === 'schema' ? (
                        <SchemaView schema={schema} />
                    ) : (
                        <DataBrowser tables={tables} />
                    )}
                </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between px-6 py-4 bg-card border border-border rounded-2xl shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-foreground-soft uppercase tracking-widest">Active Tables</span>
                        <span className="text-xl font-black text-foreground">{tables.length}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-border" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-foreground-soft uppercase tracking-widest">Storage Engine</span>
                        <span className="text-xl font-black text-foreground flex items-center gap-2">
                            SQLite 3.0 <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-foreground-soft uppercase tracking-widest">Last Update</p>
                    <p className="text-xs font-bold text-foreground-soft">
                        {mounted ? new Date().toLocaleString() : '---'}
                    </p>
                </div>
            </div>
        </div>
    );
}
