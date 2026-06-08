import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// ─── Editorial Luxe palette (hardcoded for React-PDF — no Tailwind here) ───
// Page bg: cream  · Body: ink  · Muted: fog  · Accent: sienna  · Hairline: ink/12%
//
// Font note: React-PDF only ships Helvetica/Times/Courier as builtins.
// Fraunces/Newsreader/Manrope (the Editorial Luxe families) are not bundled.
// We use Helvetica + Helvetica-Bold for stability. In a later pass these
// can be registered via Font.register({ family, src }) pointing at
// /public/fonts/*.ttf to bring the web faces into the PDF.

const COLORS = {
    cream: '#F5F1EA',
    cream2: '#EAE3D6',
    ink: '#0A0A0A',
    fog: '#6B6661',
    sienna: '#C8553D',
    hairline: 'rgba(10, 10, 10, 0.12)',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: COLORS.cream,
        fontFamily: 'Helvetica',
        padding: 0,
        color: COLORS.ink,
    },
    headerBar: {
        height: 6,
        backgroundColor: COLORS.sienna, // sienna brand stripe
        marginBottom: 30,
    },
    container: {
        paddingHorizontal: 40,
        paddingBottom: 40,
        flex: 1,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 36,
        paddingBottom: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.hairline,
    },
    sellerSection: {
        width: '55%',
        paddingRight: 20,
    },
    companyName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 18,
        color: COLORS.ink,
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    companyDetails: {
        fontSize: 9,
        color: COLORS.fog,
        marginBottom: 2,
        lineHeight: 1.4,
    },
    invoiceMeta: {
        width: '40%',
        alignItems: 'flex-end',
    },
    title: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 28,
        color: COLORS.ink,
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
        width: '100%',
    },
    metaLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: COLORS.fog,
        textTransform: 'uppercase',
        marginRight: 10,
        width: 60,
        textAlign: 'right',
        letterSpacing: 1.2,
    },
    metaValue: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: COLORS.ink,
        width: 80,
        textAlign: 'right',
    },
    billToSection: {
        marginBottom: 28,
    },
    billToLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: COLORS.fog,
        textTransform: 'uppercase',
        marginBottom: 6,
        letterSpacing: 1.2,
    },
    buyerName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 13,
        color: COLORS.ink,
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    buyerDetails: {
        fontSize: 9,
        color: COLORS.fog,
        marginBottom: 2,
        lineHeight: 1.4,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.ink,
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableHeaderLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        textTransform: 'uppercase',
        color: COLORS.ink,
        letterSpacing: 1.2,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.hairline,
        alignItems: 'flex-start',
    },
    colDesc: { width: '45%' },
    colQty: { width: '15%', textAlign: 'right' },
    colPrice: { width: '20%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },
    itemText: { fontSize: 9, color: COLORS.ink },
    itemBold: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: COLORS.ink },

    // Totals
    totalsSection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsBox: {
        width: '45%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.hairline,
    },
    totalLabel: {
        fontSize: 9,
        color: COLORS.fog,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    totalValue: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: COLORS.ink,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.ink,
        marginTop: 4,
    },
    grandTotalLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 13,
        color: COLORS.ink,
        letterSpacing: -0.2,
    },
    grandTotalValue: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 15,
        color: COLORS.sienna, // sienna for the headline number
        letterSpacing: -0.3,
    },

    // Footer
    footerSection: {
        flexDirection: 'row',
        marginTop: 50,
        paddingTop: 28,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.hairline,
    },
    footerColLeft: {
        width: '55%',
        paddingRight: 20,
    },
    footerColRight: {
        width: '45%',
        paddingLeft: 20,
        borderLeftWidth: 0.5,
        borderLeftColor: COLORS.hairline,
        display: 'flex',
        justifyContent: 'space-between',
    },
    paymentLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: COLORS.fog,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1.2,
    },
    paymentRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    paymentKey: {
        fontSize: 8,
        color: COLORS.fog,
        width: 70,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    paymentVal: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: COLORS.ink,
        flex: 1,
    },
    termsText: {
        fontSize: 8,
        color: COLORS.fog,
        lineHeight: 1.5,
        marginTop: 10,
    },
    signatureContainer: {
        height: 60,
        marginBottom: 10,
        position: 'relative',
        overflow: 'hidden',
    },
    signatureImage: {
        height: 60,
        objectFit: 'contain',
        alignSelf: 'flex-start',
    },
    signatureSpacer: {
        height: 60,
    },
    signerName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: COLORS.ink,
        textTransform: 'uppercase',
        borderTopWidth: 0.75,
        borderTopColor: COLORS.ink,
        paddingTop: 4,
        alignSelf: 'flex-start',
        minWidth: 150,
        letterSpacing: 0.8,
    },
    signerRole: {
        fontSize: 8,
        color: COLORS.fog,
        marginTop: 2,
        fontStyle: 'italic',
    },
});

const CurrencyFormatter = ({ value }: { value: number }) => {
    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value).replace('Rp', 'IDR');
    return <Text>{formatted}</Text>;
};

export const InvoicePDF = ({ invoice, subtotal, taxAmount, total }: { invoice: any, subtotal: number, taxAmount: number, total: number }) => {
    // Defensive copy
    const safeInvoice = {
        ...invoice,
        seller: invoice.seller || {},
        buyer: invoice.buyer || {},
        paymentDetails: invoice.paymentDetails || {},
        items: invoice.items || [],
        signature: invoice.signature || {},
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Sienna stripe */}
                <View style={styles.headerBar} />

                <View style={styles.container}>
                    {/* Top Section */}
                    <View style={styles.topSection}>
                        <View style={styles.sellerSection}>
                            <Text style={styles.companyName}>{safeInvoice.seller.name || 'Your Company Name'}</Text>
                            <Text style={styles.companyDetails}>{safeInvoice.seller.email}</Text>
                            <Text style={styles.companyDetails}>{safeInvoice.seller.address}</Text>
                            <Text style={styles.companyDetails}>{safeInvoice.seller.phone}</Text>
                        </View>
                        <View style={styles.invoiceMeta}>
                            <Text style={styles.title}>INVOICE</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Number</Text>
                                <Text style={styles.metaValue}>{safeInvoice.invoiceNumber}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Date</Text>
                                <Text style={styles.metaValue}>{safeInvoice.date}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Due Date</Text>
                                <Text style={styles.metaValue}>{safeInvoice.dueDate}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Bill To */}
                    <View style={styles.billToSection}>
                        <Text style={styles.billToLabel}>Bill To</Text>
                        <Text style={styles.buyerName}>{safeInvoice.buyer.name || 'Client Company Name'}</Text>
                        <Text style={styles.buyerDetails}>{safeInvoice.buyer.email}</Text>
                        <Text style={styles.buyerDetails}>{safeInvoice.buyer.address}</Text>
                        <Text style={styles.buyerDetails}>{safeInvoice.buyer.phone}</Text>
                    </View>

                    {/* Table */}
                    <View>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderLabel, styles.colDesc]}>DESCRIPTION</Text>
                            <Text style={[styles.tableHeaderLabel, styles.colQty]}>QTY</Text>
                            <Text style={[styles.tableHeaderLabel, styles.colPrice]}>PRICE</Text>
                            <Text style={[styles.tableHeaderLabel, styles.colTotal]}>AMOUNT</Text>
                        </View>
                        {safeInvoice.items.map((item: any) => (
                            <View key={item.id} style={styles.tableRow}>
                                <Text style={[styles.itemText, styles.colDesc]}>{item.description}</Text>
                                <Text style={[styles.itemText, styles.colQty]}>{item.quantity}</Text>
                                <View style={[styles.itemText, styles.colPrice]}>
                                    <CurrencyFormatter value={Number(item.price)} />
                                </View>
                                <View style={[styles.itemBold, styles.colTotal]}>
                                    <CurrencyFormatter value={Number(item.price) * Number(item.quantity)} />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Totals */}
                    <View style={styles.totalsSection}>
                        <View style={styles.totalsBox}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal</Text>
                                <View style={styles.totalValue}>
                                    <CurrencyFormatter value={subtotal} />
                                </View>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>VAT ({safeInvoice.taxRate}%)</Text>
                                <Text style={[styles.totalValue, { color: COLORS.sienna }]}>
                                    <CurrencyFormatter value={taxAmount} />
                                </Text>
                            </View>
                            <View style={styles.grandTotalRow}>
                                <Text style={styles.grandTotalLabel}>Total</Text>
                                <View style={styles.grandTotalValue}>
                                    <CurrencyFormatter value={total} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer: Payment & Signature */}
                    <View style={styles.footerSection}>
                        <View style={styles.footerColLeft}>
                            <Text style={styles.paymentLabel}>Payment Details</Text>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentKey}>Bank</Text>
                                <Text style={styles.paymentVal}>{safeInvoice.paymentDetails.bankName || '-'}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentKey}>Account</Text>
                                <Text style={styles.paymentVal}>{safeInvoice.paymentDetails.accountNumber || '-'}</Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentKey}>Holder</Text>
                                <Text style={styles.paymentVal}>{safeInvoice.paymentDetails.accountName || '-'}</Text>
                            </View>

                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.paymentLabel}>Terms & Conditions</Text>
                                <Text style={styles.termsText}>{safeInvoice.terms}</Text>
                            </View>
                        </View>

                        <View style={styles.footerColRight}>
                            <View style={{ width: '100%' }}>
                                <Text style={styles.paymentLabel}>Authorised Signatory</Text>
                                <View style={styles.signatureContainer}>
                                    {safeInvoice.signature.image ? (
                                        <Image
                                            src={safeInvoice.signature.image}
                                            style={[
                                                styles.signatureImage,
                                                safeInvoice.signature.position ? {
                                                    transform: `translate(${safeInvoice.signature.position.x}, ${safeInvoice.signature.position.y})`,
                                                } : {},
                                            ]}
                                        />
                                    ) : (
                                        <View style={styles.signatureSpacer} />
                                    )}
                                </View>
                                <Text style={styles.signerName}>{safeInvoice.signature.signerName}</Text>
                                <Text style={styles.signerRole}>{safeInvoice.signature.title || 'Director'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
