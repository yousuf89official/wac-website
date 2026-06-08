'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, X, Image as ImageIcon, Save } from 'lucide-react';
import { Button, Input, Label, SelectWrapper } from '@/components/brands/BrandPrimitives';
import { toast } from 'sonner';

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'IDR', label: 'IDR - Rupiah' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'MYR', label: 'MYR - Ringgit' },
    { value: 'AED', label: 'AED - Dirham' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'THB', label: 'THB - Thai Baht' },
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
];

interface EditBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    brand: any;
    industries: any[];
    onUpdated: () => void;
}

export const EditBrandModal = ({ isOpen, onClose, brand, industries, onUpdated }: EditBrandModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        industryId: '',
        industrySubTypeId: '',
        website: '',
        logo: '',
        brandColor: '#4F46E5',
        brandFontColor: '#000000',
        defaultCurrency: 'USD',
        location: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    // Populate form when brand changes
    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name || '',
                industryId: brand.industryId || brand.industry_id || '',
                industrySubTypeId: brand.industrySubTypeId || '',
                website: brand.website || '',
                logo: brand.logo || brand.logo_url || '',
                brandColor: brand.brandColor || '#4F46E5',
                brandFontColor: brand.brandFontColor || '#000000',
                defaultCurrency: brand.defaultCurrency || brand.default_currency || 'USD',
                location: brand.location || '',
                description: brand.description || '',
            });
            setPreview(brand.logo || brand.logo_url || null);
        }
    }, [brand]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            // SVG wrapper for consistent display
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><image href="${base64}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" /></svg>`;
            const svgBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
            setFormData(prev => ({ ...prev, logo: svgBase64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/brands/${brand.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    industry: formData.industryId,
                    industrySubTypeId: formData.industrySubTypeId,
                    website: formData.website,
                    logo: formData.logo,
                    brandColor: formData.brandColor,
                    brandFontColor: formData.brandFontColor,
                    defaultCurrency: formData.defaultCurrency,
                    location: formData.location,
                    description: formData.description,
                }),
            });

            if (res.ok) {
                toast.success('Brand updated successfully');
                onUpdated();
                onClose();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update brand');
            }
        } catch {
            toast.error('Failed to update brand');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !brand) return null;

    const selectedIndustry = industries.find((i: any) => i.id === formData.industryId);
    const availableSubTypes = selectedIndustry?.subTypes || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-2/60 p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-border max-h-[90vh] overflow-y-auto">
                <div className="p-8 border-b border-border bg-card flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Edit Brand</h3>
                        <p className="text-sm text-foreground-soft font-medium">Update brand information and visual identity.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-card rounded-full transition-colors">
                        <X className="h-6 w-6 text-foreground-soft" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Logo */}
                        <div className="col-span-2 flex items-center gap-6 p-4 bg-card rounded-2xl border border-border">
                            <div className="h-20 w-20 rounded-xl flex items-center justify-center border-2 border-dashed border-border relative overflow-hidden group hover:border-primary transition-all cursor-pointer bg-card">
                                {preview ? (
                                    <img src={preview} alt="Logo" className="h-full w-full object-contain p-2" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-foreground-soft group-hover:text-primary/60" />
                                )}
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                            </div>
                            <div className="flex-1 space-y-3">
                                <Label className="text-xs">Visual Identity</Label>
                                <div className="flex gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-foreground-soft uppercase">Card Color</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-8 w-12 rounded-lg border border-border overflow-hidden">
                                                <input type="color" value={formData.brandColor} onChange={e => setFormData({ ...formData, brandColor: e.target.value })} className="absolute inset-0 h-[150%] w-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-none" />
                                            </div>
                                            <span className="text-[10px] font-mono text-foreground-soft">{formData.brandColor}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-foreground-soft uppercase">Font Color</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-8 w-12 rounded-lg border border-border overflow-hidden">
                                                <input type="color" value={formData.brandFontColor} onChange={e => setFormData({ ...formData, brandFontColor: e.target.value })} className="absolute inset-0 h-[150%] w-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-none" />
                                            </div>
                                            <span className="text-[10px] font-mono text-foreground-soft">{formData.brandFontColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Brand Name</Label>
                            <Input required value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Industry Sector</Label>
                            <SelectWrapper value={formData.industryId} onChange={(e: any) => setFormData({ ...formData, industryId: e.target.value, industrySubTypeId: '' })}>
                                <option value="" className="bg-background-2 text-foreground">Select Sector</option>
                                {industries.map((ind: any) => <option key={ind.id} value={ind.id} className="bg-background-2 text-foreground">{ind.name}</option>)}
                            </SelectWrapper>
                        </div>
                        <div className="space-y-2">
                            <Label>Sub-Category</Label>
                            <SelectWrapper disabled={!formData.industryId} value={formData.industrySubTypeId} onChange={(e: any) => setFormData({ ...formData, industrySubTypeId: e.target.value })}>
                                <option value="" className="bg-background-2 text-foreground">Select Sub-Type</option>
                                {availableSubTypes.map((sub: any) => <option key={sub.id} value={sub.id} className="bg-background-2 text-foreground">{sub.name}</option>)}
                            </SelectWrapper>
                        </div>

                        <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <SelectWrapper value={formData.defaultCurrency} onChange={(e: any) => setFormData({ ...formData, defaultCurrency: e.target.value })}>
                                {CURRENCIES.map(c => <option key={c.value} value={c.value} className="bg-background-2 text-foreground">{c.label}</option>)}
                            </SelectWrapper>
                        </div>
                        <div className="space-y-2">
                            <Label>Location / Market</Label>
                            <Input placeholder="e.g. Global, Indonesia, UAE" value={formData.location} onChange={(e: any) => setFormData({ ...formData, location: e.target.value })} />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Official Website</Label>
                            <Input placeholder="https://brand.com" value={formData.website} onChange={(e: any) => setFormData({ ...formData, website: e.target.value })} />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Description</Label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                placeholder="Brief description of the brand..."
                                className="flex w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground shadow-sm transition-colors placeholder:text-foreground-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40 hover:bg-card/80 resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button type="button" variant="secondary" className="flex-1 h-12" onClick={onClose}>CANCEL</Button>
                        <Button type="submit" className="flex-1 h-12 gap-2" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> SAVE CHANGES</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
