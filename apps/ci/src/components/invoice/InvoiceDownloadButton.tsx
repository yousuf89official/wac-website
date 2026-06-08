'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF';

interface InvoiceDownloadButtonProps {
    invoice: any;
    subtotal: number;
    taxAmount: number;
    total: number;
}

const InvoiceDownloadButton: React.FC<InvoiceDownloadButtonProps> = ({ invoice, subtotal, taxAmount, total }) => {
    return (
        <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} subtotal={subtotal} taxAmount={taxAmount} total={total} />}
            fileName={`Invoice-${invoice.invoiceNumber}.pdf`}
        >
            {({ loading }) => (
                <span className="inline-flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft transition-colors hover:border-foreground/30 hover:text-foreground">
                    <FileDown size={14} />
                    {loading ? 'Preparing…' : 'Export PDF'}
                </span>
            )}
        </PDFDownloadLink>
    );
};

export default InvoiceDownloadButton;
