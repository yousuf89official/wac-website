
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Upload, X, Save, FileDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const InvoiceDownloadButton = dynamic(() => import('./InvoiceDownloadButton'), {
    ssr: false,
    loading: () => (
        <button
            disabled
            className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft opacity-50"
        >
            <FileDown size={14} /> Export PDF
        </button>
    )
});

export default function InvoiceForm({ initialData = null, onSave, onCancel }: { initialData?: any, onSave: (data: any) => Promise<void>, onCancel: () => void }) {
    // Default Initial State
    const defaultState = {
        invoiceNumber: 'INV-001',
        date: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        seller: {
            name: 'Your Company Name',
            email: 'you@example.com',
            address: '123 Business Rd\nCity, Country',
            phone: '+1 (555) 000-0000',
        },
        buyer: {
            name: 'Client Company',
            email: 'client@example.com',
            address: '456 Client Street\nCity, Country',
            phone: '+1 (555) 999-9999',
        },
        items: [
            { id: 1, description: 'Web Development Services', quantity: 1, price: 15000000 },
        ],
        taxRate: 11,
        currencySymbol: 'IDR',
        paymentDetails: {
            bankName: '',
            accountName: '',
            accountNumber: ''
        },
        terms: 'Please make checks payable to Your Company Name.',
        signature: {
            image: null as string | null,
            signerName: '',
            title: 'Director',
            position: { x: 0, y: 0 }
        }
    };

    const [invoice, setInvoice] = useState(initialData || defaultState);
    const [subtotal, setSubtotal] = useState(0);

    const [taxAmount, setTaxAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef<{ isDragging: boolean, startX: number, startY: number, initialX: number, initialY: number }>({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

    // Calculate totals
    useEffect(() => {
        const newSubtotal = invoice.items.reduce((acc: number, item: any) => {
            return acc + (Number(item.quantity) * Number(item.price));
        }, 0);

        const newTaxAmount = newSubtotal * (invoice.taxRate / 100);
        const newTotal = newSubtotal + newTaxAmount;

        setSubtotal(newSubtotal);
        setTaxAmount(newTaxAmount);
        setTotal(newTotal);
    }, [invoice.items, invoice.taxRate]);

    // Format Number with Thousands Separator (e.g. 1.000.000)
    const formatNumberInput = (value: number | string) => {
        if (!value) return '';
        return new Intl.NumberFormat('id-ID').format(Number(value));
    };

    const parseNumberInput = (value: string) => {
        return Number(value.replace(/\./g, '').replace(/,/g, '.'));
    };

    // Handlers
    const handleSellerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInvoice((prev: any) => ({ ...prev, seller: { ...prev.seller, [name]: value } }));
    };

    const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInvoice((prev: any) => ({ ...prev, buyer: { ...prev.buyer, [name]: value } }));
    };

    const handleItemChange = (id: number, field: string, value: any) => {
        setInvoice((prev: any) => ({
            ...prev,
            items: prev.items.map((item: any) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const addItem = () => {
        const newId = invoice.items.length > 0 ? Math.max(...invoice.items.map((i: any) => i.id)) + 1 : 1;
        setInvoice((prev: any) => ({
            ...prev,
            items: [...prev.items, { id: newId, description: 'New Item', quantity: 1, price: 0 }]
        }));
    };

    const deleteItem = (id: number) => {
        setInvoice((prev: any) => ({
            ...prev,
            items: prev.items.filter((item: any) => item.id !== id)
        }));
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInvoice((prev: any) => ({
            ...prev,
            paymentDetails: { ...prev.paymentDetails, [name]: value }
        }));
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setInvoice((prev: any) => ({
                    ...prev,
                    signature: { ...prev.signature, image: reader.result as string }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSignature = () => {
        setInvoice((prev: any) => ({
            ...prev,
            signature: { ...prev.signature, image: null, position: { x: 0, y: 0 } }
        }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Drag Logic
    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        dragRef.current = {
            isDragging: true,
            startX: e.clientX,
            startY: e.clientY,
            initialX: invoice.signature.position?.x || 0,
            initialY: invoice.signature.position?.y || 0
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        setInvoice((prev: any) => ({
            ...prev,
            signature: {
                ...prev.signature,
                position: {
                    x: dragRef.current.initialX + dx,
                    y: dragRef.current.initialY + dy
                }
            }
        }));
    };

    const onMouseUp = () => {
        dragRef.current.isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave(invoice);
            toast.success("Invoice saved successfully!");
        } catch (error) {
            toast.error("Failed to save invoice");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('Rp', 'IDR');
    };

    return (
        <div className="min-h-screen bg-background-2 pb-12 pt-20 text-foreground">
            {/* Control Bar */}
            <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border bg-card px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="border border-border bg-background-2 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
                            {invoice.id ? 'Edit invoice' : 'New invoice'}
                        </h2>
                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                            Drafting…
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:text-foreground"
                    >
                        Cancel
                    </button>

                    <InvoiceDownloadButton
                        invoice={invoice}
                        subtotal={subtotal}
                        taxAmount={taxAmount}
                        total={total}
                    />

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-primary px-5 py-2 font-mono text-2xs uppercase tracking-widest text-background transition-colors hover:bg-foreground disabled:opacity-50"
                    >
                        <Save size={14} /> {isSaving ? 'Saving…' : 'Save invoice'}
                    </button>
                </div>
            </div>

            {/* Two-column layout: form + PDF-style preview */}
            <div className="mx-auto max-w-[210mm] px-4">
                {/* Editorial preface */}
                <div className="mb-6 flex items-center gap-3">
                    <span className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                        Invoice
                    </span>
                    <span className="inline-block h-px w-8 bg-foreground-soft" />
                    <span className="font-mono text-2xs uppercase tracking-widest text-primary">
                        Editor
                    </span>
                </div>

                {/* "Paper" preview — light cream surface that mirrors the PDF */}
                <div className="relative flex min-h-[297mm] w-full flex-col border border-border" style={{ backgroundColor: '#F5F1EA', color: '#0A0A0A' }}>
                    {/* Sienna accent bar — matches PDF */}
                    <div className="h-2 w-full shrink-0" style={{ backgroundColor: '#C8553D' /* sienna */ }} />

                    <div className="flex flex-1 flex-col p-12 font-serif">

                        {/* Top Header Section */}
                        <div className="mb-12 flex items-start justify-between border-b pb-8" style={{ borderColor: 'rgba(10,10,10,0.12)' }}>
                            <div className="w-1/2 pr-8">
                                <label className="mb-2 block font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>
                                    From
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={invoice.seller.name}
                                    onChange={handleSellerChange}
                                    className="mb-1 w-full border-none bg-transparent p-0 font-display text-2xl font-medium tracking-tight focus:outline-none focus:ring-0"
                                    style={{ color: '#0A0A0A' }}
                                    placeholder="Your Company Name"
                                />
                                <div className="space-y-0.5">
                                    <input
                                        type="email"
                                        name="email"
                                        value={invoice.seller.email}
                                        onChange={handleSellerChange}
                                        className="block w-full border-none bg-transparent p-0 font-serif text-sm focus:outline-none focus:ring-0"
                                        style={{ color: '#6B6661' }}
                                        placeholder="Email Address"
                                    />
                                    <textarea
                                        name="address"
                                        value={invoice.seller.address}
                                        onChange={handleSellerChange}
                                        rows={2}
                                        className="block w-full resize-none border-none bg-transparent p-0 font-serif text-sm focus:outline-none focus:ring-0"
                                        style={{ color: '#6B6661' }}
                                        placeholder="Address"
                                    />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={invoice.seller.phone}
                                        onChange={handleSellerChange}
                                        className="block w-full border-none bg-transparent p-0 font-serif text-sm focus:outline-none focus:ring-0"
                                        style={{ color: '#6B6661' }}
                                        placeholder="Phone"
                                    />
                                </div>
                            </div>

                            <div className="w-1/3 text-right">
                                <h1
                                    className="mb-4 select-none font-display text-5xl font-medium uppercase leading-none tracking-tighter"
                                    style={{ color: 'rgba(10,10,10,0.1)' }}
                                >
                                    Invoice
                                </h1>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-end gap-3">
                                        <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>
                                            Number
                                        </span>
                                        <input
                                            type="text"
                                            value={invoice.invoiceNumber}
                                            onChange={(e) => setInvoice((prev: any) => ({ ...prev, invoiceNumber: e.target.value }))}
                                            className="w-32 border-none bg-transparent p-0 text-right font-mono text-sm focus:outline-none focus:ring-0"
                                            style={{ color: '#0A0A0A' }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>
                                            Date
                                        </span>
                                        <input
                                            type="date"
                                            value={invoice.date}
                                            onChange={(e) => setInvoice((prev: any) => ({ ...prev, date: e.target.value }))}
                                            className="w-32 border-none bg-transparent p-0 text-right font-mono text-sm focus:outline-none focus:ring-0"
                                            style={{ color: '#6B6661' }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>
                                            Due
                                        </span>
                                        <input
                                            type="date"
                                            value={invoice.dueDate}
                                            onChange={(e) => setInvoice((prev: any) => ({ ...prev, dueDate: e.target.value }))}
                                            className="w-32 border-none bg-transparent p-0 text-right font-mono text-sm focus:outline-none focus:ring-0"
                                            style={{ color: '#6B6661' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-12">
                            <label className="mb-2 block font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>
                                Bill to
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={invoice.buyer.name}
                                onChange={handleBuyerChange}
                                className="mb-1 w-full border-none bg-transparent p-0 font-display text-xl font-medium tracking-tight focus:outline-none focus:ring-0"
                                style={{ color: '#0A0A0A' }}
                                placeholder="Client Company Name"
                            />
                            <div className="w-1/2 space-y-0.5">
                                <input
                                    type="email"
                                    name="email"
                                    value={invoice.buyer.email}
                                    onChange={handleBuyerChange}
                                    className="block w-full border-none bg-transparent p-0 font-serif text-sm focus:outline-none focus:ring-0"
                                    style={{ color: '#6B6661' }}
                                    placeholder="client@email.com"
                                />
                                <textarea
                                    name="address"
                                    value={invoice.buyer.address}
                                    onChange={handleBuyerChange}
                                    rows={2}
                                    className="block w-full resize-none border-none bg-transparent p-0 font-serif text-sm focus:outline-none focus:ring-0"
                                    style={{ color: '#6B6661' }}
                                    placeholder="Client Address"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    value={invoice.buyer.phone}
                                    onChange={handleBuyerChange}
                                    className="block w-full border-none bg-transparent p-0 font-serif text-sm focus:outline-none focus:ring-0"
                                    style={{ color: '#6B6661' }}
                                    placeholder="Client Phone"
                                />
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                            <div
                                className="mb-4 grid grid-cols-12 gap-4 border-b pb-3 font-mono text-2xs uppercase tracking-widest"
                                style={{ borderColor: '#0A0A0A', color: '#0A0A0A' }}
                            >
                                <div className="col-span-5">Description</div>
                                <div className="col-span-2 text-right">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-2 text-right">Amount</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="space-y-1">
                                {invoice.items.map((item: any) => (
                                    <div key={item.id} className="group grid grid-cols-12 items-start gap-4 py-2 font-serif text-sm">
                                        <div className="col-span-5">
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                rows={1}
                                                className="w-full resize-none overflow-hidden border-none bg-transparent p-0 font-serif text-sm leading-snug focus:outline-none focus:ring-0"
                                                style={{ color: '#0A0A0A', minHeight: '1.5em' }}
                                                placeholder="Item description"
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = 'auto';
                                                    target.style.height = target.scrollHeight + 'px';
                                                }}
                                            />
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="w-full border-none bg-transparent p-0 text-right font-mono text-sm focus:outline-none focus:ring-0"
                                                style={{ color: '#6B6661' }}
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-1 text-right">
                                            <span className="font-mono text-2xs uppercase" style={{ color: '#6B6661' }}>IDR</span>
                                            <input
                                                type="text"
                                                value={formatNumberInput(item.price)}
                                                onChange={(e) => handleItemChange(item.id, 'price', parseNumberInput(e.target.value))}
                                                className="w-24 border-none bg-transparent p-0 text-right font-mono text-sm focus:outline-none focus:ring-0"
                                                style={{ color: '#6B6661' }}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-span-2 text-right font-mono text-sm" style={{ color: '#0A0A0A' }}>
                                            {formatCurrency(item.quantity * item.price)}
                                        </div>
                                        <div className="col-span-1 text-center opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="transition-colors"
                                                style={{ color: '#6B6661' }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addItem}
                                className="mt-6 inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-widest transition-colors"
                                style={{ color: '#C8553D' /* sienna */ }}
                            >
                                <Plus className="h-3 w-3" /> Add item
                            </button>
                        </div>

                        {/* Totals */}
                        <div className="mt-4 flex flex-col justify-end md:flex-row">
                            <div className="w-full space-y-3 md:w-5/12">
                                <div className="flex items-center justify-between border-b py-2" style={{ borderColor: 'rgba(10,10,10,0.12)' }}>
                                    <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>
                                        Subtotal
                                    </span>
                                    <span className="font-mono text-sm" style={{ color: '#0A0A0A' }}>{formatCurrency(subtotal)}</span>
                                </div>

                                <div className="flex items-center justify-between border-b py-2" style={{ borderColor: 'rgba(10,10,10,0.12)' }}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#C8553D' /* sienna */ }}>
                                            VAT
                                        </span>
                                        <div className="relative w-14">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={invoice.taxRate}
                                                onChange={(e) => setInvoice((prev: any) => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                                                className="w-full border px-1 py-0.5 text-right font-mono text-2xs"
                                                style={{ borderColor: 'rgba(200,85,61,0.3)', color: '#C8553D', backgroundColor: 'rgba(200,85,61,0.08)' }}
                                            />
                                            <span className="absolute -right-3 top-0.5 font-mono text-2xs" style={{ color: '#C8553D' }}>%</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-sm" style={{ color: '#C8553D' /* sienna */ }}>{formatCurrency(taxAmount)}</span>
                                </div>

                                <div className="flex items-center justify-between pb-2 pt-4">
                                    <span className="font-display text-lg font-medium tracking-tight" style={{ color: '#0A0A0A' }}>
                                        Total
                                    </span>
                                    <span className="font-display text-xl font-medium tracking-tight" style={{ color: '#0A0A0A' }}>
                                        {formatCurrency(total)}
                                    </span>
                                </div>
                                <div className="h-px w-full" style={{ backgroundColor: '#0A0A0A' }}></div>
                            </div>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-16 border-t pt-12" style={{ borderColor: 'rgba(10,10,10,0.12)' }}>
                            {/* Payment & Terms */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="mb-3 font-mono text-2xs uppercase tracking-widest" style={{ color: '#0A0A0A' }}>
                                        Payment information
                                    </h3>
                                    <div className="grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                                        <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>Bank</span>
                                        <input
                                            type="text"
                                            name="bankName"
                                            value={invoice.paymentDetails.bankName}
                                            onChange={handlePaymentChange}
                                            className="border-none bg-transparent p-0 font-mono text-sm focus:outline-none focus:ring-0"
                                            style={{ color: '#0A0A0A' }}
                                            placeholder="Bank Name"
                                        />

                                        <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>Account</span>
                                        <input
                                            type="text"
                                            name="accountNumber"
                                            value={invoice.paymentDetails.accountNumber}
                                            onChange={handlePaymentChange}
                                            className="border-none bg-transparent p-0 font-mono text-sm focus:outline-none focus:ring-0"
                                            style={{ color: '#0A0A0A' }}
                                            placeholder="000 000 000"
                                        />

                                        <span className="font-mono text-2xs uppercase tracking-widest" style={{ color: '#6B6661' }}>Holder</span>
                                        <input
                                            type="text"
                                            name="accountName"
                                            value={invoice.paymentDetails.accountName}
                                            onChange={handlePaymentChange}
                                            className="border-none bg-transparent p-0 font-mono text-sm focus:outline-none focus:ring-0"
                                            style={{ color: '#0A0A0A' }}
                                            placeholder="Account Name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-2 font-mono text-2xs uppercase tracking-widest" style={{ color: '#0A0A0A' }}>
                                        Terms
                                    </h3>
                                    <textarea
                                        value={invoice.terms}
                                        onChange={(e) => setInvoice((prev: any) => ({ ...prev, terms: e.target.value }))}
                                        rows={2}
                                        className="w-full resize-none border-none bg-transparent p-0 font-serif text-sm leading-relaxed focus:outline-none focus:ring-0"
                                        style={{ color: '#6B6661' }}
                                        placeholder="Add terms and conditions…"
                                    />
                                </div>
                            </div>

                            {/* Digital Signature */}
                            <div className="relative border-l pl-8" style={{ borderColor: 'rgba(10,10,10,0.12)' }}>
                                <h3 className="mb-4 font-mono text-2xs uppercase tracking-widest" style={{ color: '#0A0A0A' }}>
                                    Authorised signatory
                                </h3>

                                <div
                                    className="group/sig relative h-32 w-full overflow-hidden border border-dashed transition-colors"
                                    style={{ borderColor: 'rgba(10,10,10,0.2)', backgroundColor: 'rgba(10,10,10,0.02)' }}
                                >
                                    {!invoice.signature.image && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center transition-colors"
                                            style={{ color: '#6B6661' }}
                                        >
                                            <Upload className="mb-2 h-5 w-5 opacity-60" />
                                            <span className="font-mono text-2xs uppercase tracking-widest">Upload signature</span>
                                        </div>
                                    )}

                                    {invoice.signature.image && (
                                        <>
                                            <div
                                                className="absolute cursor-move select-none p-2"
                                                style={{
                                                    transform: `translate(${invoice.signature.position?.x || 0}px, ${invoice.signature.position?.y || 0}px)`,
                                                    touchAction: 'none'
                                                }}
                                                onMouseDown={onMouseDown}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={invoice.signature.image}
                                                    alt="Signature"
                                                    className="pointer-events-none h-16 object-contain"
                                                />
                                            </div>
                                            <button
                                                onClick={removeSignature}
                                                className="absolute right-2 top-2 z-10 p-1 opacity-0 transition-opacity group-hover/sig:opacity-100"
                                                style={{ color: '#6B6661' }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleSignatureUpload}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <div className="mt-3 border-t pt-2" style={{ borderColor: '#0A0A0A' }}>
                                    <input
                                        type="text"
                                        value={invoice.signature.signerName || ''}
                                        onChange={(e) => setInvoice((prev: any) => ({ ...prev, signature: { ...prev.signature, signerName: e.target.value } }))}
                                        className="w-full border-none bg-transparent p-0 font-mono text-sm uppercase tracking-widest focus:outline-none focus:ring-0"
                                        style={{ color: '#0A0A0A' }}
                                        placeholder="Signer name"
                                    />
                                    <input
                                        type="text"
                                        value={invoice.signature.title || ''}
                                        onChange={(e) => setInvoice((prev: any) => ({ ...prev, signature: { ...prev.signature, title: e.target.value } }))}
                                        className="mt-0.5 w-full border-none bg-transparent p-0 font-serif text-xs italic focus:outline-none focus:ring-0"
                                        style={{ color: '#6B6661' }}
                                        placeholder="Title (e.g. Director)"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
