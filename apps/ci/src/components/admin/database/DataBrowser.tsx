import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    RefreshCcw,
    Table as TableIcon,
    Loader2,
    Copy,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DataBrowserProps {
    tables: string[];
}

export const DataBrowser = ({ tables }: DataBrowserProps) => {
    const [activeTable, setActiveTable] = useState<string>(tables[0] || '');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const fetchData = useCallback(async (table: string, page: number, query: string) => {
        setLoading(true);
        try {
            const resp = await fetch(`/api/admin/database/tables/${table}?page=${page}&limit=${pagination.limit}&q=${encodeURIComponent(query)}`);
            const result = await resp.json();
            if (result.data) {
                setData(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch table data:', error);
            toast.error('Failed to fetch table data');
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (activeTable) {
            fetchData(activeTable, 1, debouncedSearch);
        }
    }, [activeTable, debouncedSearch, fetchData]);

    const handleCopy = (value: any, id: string) => {
        navigator.clipboard.writeText(String(value));
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const exportToCSV = () => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = row[header] === null ? '' : String(row[header]);
                return `"${val.replace(/"/g, '""')}"`;
            }).join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${activeTable}_export_${new Date().toISOString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    return (
        <div className="flex flex-col h-full bg-card rounded-xl border overflow-hidden">
            {/* Table Selector */}
            <div className="flex items-center gap-2 p-4 border-b bg-card">
                <div className="font-semibold text-foreground-soft mr-2 flex items-center gap-2 whitespace-nowrap">
                    <TableIcon className="h-4 w-4 text-primary" />
                    Select Table:
                </div>
                <div className="flex flex-wrap gap-2">
                    {tables.map(table => (
                        <button
                            key={table}
                            onClick={() => {
                                setActiveTable(table);
                                setSearchQuery('');
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                activeTable === table
                                    ? "bg-primary text-foregroundshadow-md shadow-primary/10"
                                    : "bg-card border text-foreground-soft hover:bg-card"
                            )}
                        >
                            {table}
                        </button>
                    ))}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-soft" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in all columns..."
                            className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm text-foregroundbg-card placeholder:text-foreground-soft focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 w-64"
                        />
                    </div>
                    <button
                        onClick={() => fetchData(activeTable, pagination.page, debouncedSearch)}
                        className="p-2 text-foreground-soft hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Refresh"
                    >
                        <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportToCSV}
                        disabled={data.length === 0}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold text-foreground-soft hover:bg-card disabled:opacity-50"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto relative">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card ">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-[10px] font-bold text-foreground-soft uppercase tracking-widest">Loading Data...</span>
                        </div>
                    </div>
                )}

                {data.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-card border-b z-20">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-foreground-soft border-r last:border-r-0">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-card transition-colors border-b last:border-b-0 group">
                                    {columns.map(col => {
                                        const cellId = `${idx}-${col}`;
                                        return (
                                            <td key={col} className="px-4 py-3 text-sm text-foreground-soft border-r last:border-r-0 max-w-[300px] relative">
                                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                    <span className="truncate">
                                                        {row[col] === null ? <span className="text-foreground-soft italic">null</span> : String(row[col])}
                                                    </span>
                                                    {row[col] !== null && (
                                                        <button
                                                            onClick={() => handleCopy(row[col], cellId)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-card rounded transition-all text-foreground-soft hover:text-primary"
                                                            title="Copy value"
                                                        >
                                                            {copiedId === cellId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : !loading && (
                    <div className="flex flex-col items-center justify-center h-64 text-foreground-soft">
                        <TableIcon className="h-12 w-12 mb-4 opacity-20" />
                        <p className="font-medium text-lg italic">{searchQuery ? 'No results match your search' : 'No data found in this table'}</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t bg-card flex items-center justify-between">
                <div className="text-xs font-bold text-foreground-soft">
                    Showing {data.length} of {pagination.total} records
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={pagination.page <= 1 || loading}
                        onClick={() => fetchData(activeTable, pagination.page - 1, debouncedSearch)}
                        className="p-2 border rounded-lg disabled:opacity-50 hover:bg-card transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="text-xs font-black px-4 py-2 bg-card border rounded-lg shadow-sm">
                        Page {pagination.page} / {pagination.totalPages || 1}
                    </div>
                    <button
                        disabled={pagination.page >= pagination.totalPages || loading}
                        onClick={() => fetchData(activeTable, pagination.page + 1, debouncedSearch)}
                        className="p-2 border rounded-lg disabled:opacity-50 hover:bg-card transition-all shadow-sm"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
