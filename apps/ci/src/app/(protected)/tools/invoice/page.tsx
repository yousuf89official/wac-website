
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getInvoices, saveInvoice, deleteInvoice } from '@/app/actions/invoice-actions';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import { toast } from 'sonner';

export default function InvoicePage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const data = await getInvoices();
            // Parse JSON fields
            const parsedData = data.map((inv: any) => ({
                ...inv,
                items: JSON.parse(inv.items),
                seller: {
                    name: inv.sellerName,
                    email: inv.sellerEmail,
                    address: inv.sellerAddress,
                    phone: inv.sellerPhone
                },
                buyer: {
                    name: inv.buyerName,
                    email: inv.buyerEmail,
                    address: inv.buyerAddress,
                    phone: inv.buyerPhone
                },
                paymentDetails: JSON.parse(inv.paymentDetails),
                signature: {
                    image: inv.signatureImage,
                    signerName: inv.signerName,
                    ...(inv.signatureMeta ? JSON.parse(inv.signatureMeta) : { position: { x: 0, y: 0 }, title: 'Director' })
                },
                // map date strings back to strings for inputs if needed, or date objects
                date: new Date(inv.date).toISOString().slice(0, 10),
                dueDate: new Date(inv.dueDate).toISOString().slice(0, 10),
            }));
            setInvoices(parsedData);
        } catch (error) {
            console.error("Failed to fetch invoices", error);
            toast.error("Failed to load invoice history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleCreateNew = () => {
        setSelectedInvoice(null);
        setIsOpen(true);
    };

    const handleEdit = (invoice: any) => {
        setSelectedInvoice(invoice);
        setIsOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this invoice?')) {
            try {
                await deleteInvoice(id);
                setInvoices(prev => prev.filter(inv => inv.id !== id));
                toast.success("Invoice deleted");
            } catch (error) {
                toast.error("Failed to delete invoice");
            }
        }
    };

    const handleDuplicate = async (e: React.MouseEvent, inv: any) => {
        e.stopPropagation();
        try {
            const duplicate = {
                ...inv,
                id: undefined, // Remove id so it creates a new record
                invoiceNumber: `${inv.invoiceNumber}-COPY`,
                date: new Date().toISOString().slice(0, 10),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            };
            await saveInvoice(duplicate);
            fetchInvoices();
            toast.success('Invoice duplicated');
        } catch {
            toast.error('Failed to duplicate invoice');
        }
    };

    const handleSaveInvoice = async (data: any) => {
        try {
            await saveInvoice(data);
            setIsOpen(false);
            fetchInvoices(); // Refresh list
        } catch (error) {
            throw error; // Let form handle error display
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-16 pb-24">
            {/* Editorial header */}
            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Intelligence
                        </span>
                        <span className="inline-block h-px w-8 bg-foreground-soft" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Tools
                        </span>
                        <span className="inline-block h-px w-8 bg-foreground-soft" />
                        <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                            Invoice generator
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.25rem)] font-medium leading-[0.96] tracking-tightest text-foreground">
                        Invoice generator.
                    </h1>
                    <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-foreground-soft">
                        Draft, archive, and export client invoices — typeset in the studio house
                        style, exported as a print-ready PDF.
                    </p>
                </div>

                <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center gap-2 self-start bg-primary px-5 py-2 font-mono text-2xs uppercase tracking-widest text-background transition-colors hover:bg-foreground md:self-auto"
                >
                    <Plus size={14} />
                    Create invoice
                </button>
            </header>

            {/* Invoice list */}
            <section>
                <div className="mb-6 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Archive
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                    <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                        Drafts &amp; sent
                    </span>
                </div>

                <div className="mb-6 flex gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-soft" />
                        <input
                            placeholder="Search invoices…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-border bg-card py-2.5 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-foreground-soft/60 focus:border-foreground/40 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto border border-border bg-card">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Invoice #</th>
                                <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Client</th>
                                <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Date</th>
                                <th className="px-6 py-3 font-mono text-2xs uppercase tracking-widest text-foreground-soft">Due date</th>
                                <th className="px-6 py-3 text-right font-mono text-2xs uppercase tracking-widest text-foreground-soft">Amount</th>
                                <th className="px-6 py-3 text-center font-mono text-2xs uppercase tracking-widest text-foreground-soft">Status</th>
                                <th className="px-6 py-3 text-right font-mono text-2xs uppercase tracking-widest text-foreground-soft">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center font-serif italic text-foreground-soft">
                                        Loading invoices…
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-14 text-center font-serif italic text-foreground-soft">
                                        No invoices yet. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => {
                                    // Calculate total for display
                                    const subtotal = inv.items.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.price)), 0);
                                    const total = subtotal + (subtotal * (inv.taxRate / 100));

                                    return (
                                        <tr
                                            key={inv.id}
                                            onClick={() => handleEdit(inv)}
                                            className="group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-foreground/[0.03]"
                                        >
                                            <td className="px-6 py-4 font-mono text-sm text-foreground">{inv.invoiceNumber}</td>
                                            <td className="px-6 py-4 font-display text-base font-medium tracking-tight text-foreground">
                                                {inv.buyer.name}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                {new Date(inv.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                                {new Date(inv.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-display text-base font-medium tracking-tight text-foreground">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-mono text-2xs uppercase tracking-widest text-success">
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        className="p-2 text-foreground-soft transition-colors hover:text-success"
                                                        onClick={(e) => handleDuplicate(e, inv)}
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-foreground-soft transition-colors hover:text-primary"
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(inv); }}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-foreground-soft transition-colors hover:text-destructive"
                                                        onClick={(e) => handleDelete(e, inv.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Full Screen Modal for Invoice Editor */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="h-[95vh] max-w-[95vw] overflow-y-auto rounded-none border border-border bg-background p-0">
                    <DialogTitle className="sr-only">Invoice Editor</DialogTitle>
                    {/* Invoice Form Component */}
                    {isOpen && (
                        <InvoiceForm
                            initialData={selectedInvoice}
                            onSave={handleSaveInvoice}
                            onCancel={() => setIsOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
