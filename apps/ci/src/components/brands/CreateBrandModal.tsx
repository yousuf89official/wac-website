
import React, { useState } from 'react';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Button, Input, Label, SelectWrapper } from '@/components/brands/BrandPrimitives';

export const CreateBrandModal = ({ isOpen, onClose, onCreate, industries }: any) => {
    const [formData, setFormData] = useState({
        name: '',
        industryId: '',
        industrySubTypeId: '',
        website: '',
        logo_url: '',
        brandColor: '#4F46E5',
        brandFontColor: '#000000',
        defaultCurrency: 'USD'
    });
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const convertToSVG = (base64: string) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
            <image href="${base64}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    };

    const extractColor = async (dataUrl: string) => {
        return new Promise<string>((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve('#4F46E5');

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < imageData.length; i += 40) {
                    if (imageData[i + 3] > 128) {
                        r += imageData[i];
                        g += imageData[i + 1];
                        b += imageData[i + 2];
                        count++;
                    }
                }

                if (count === 0) return resolve('#4F46E5');

                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                resolve(hex);
            };
            img.src = dataUrl;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setPreview(base64);
            const extracted = await extractColor(base64);
            const svgLogo = convertToSVG(base64);
            setFormData(prev => ({ ...prev, logo_url: svgLogo, brandColor: extracted }));
        };
        reader.readAsDataURL(file);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onCreate(formData);
            onClose();
            setFormData({ name: '', industryId: '', industrySubTypeId: '', website: '', logo_url: '', brandColor: '#4F46E5', brandFontColor: '#000000', defaultCurrency: 'USD' });
            setPreview(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const selectedIndustry = industries.find((i: any) => i.id === formData.industryId);
    const availableSubTypes = selectedIndustry?.subTypes || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border max-w-xl w-full overflow-hidden">
                <div className="flex justify-between items-start p-8 border-b border-border">
                    <div>
                        <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-2">
                            New Brand
                        </p>
                        <h3 className="font-display text-2xl font-medium tracking-tight text-foreground">
                            Add a brand to the portfolio
                        </h3>
                        <p className="mt-2 font-serif text-sm text-foreground-soft">
                            Initialize a new portfolio asset with its visual identity.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-foreground-soft transition-colors hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 flex items-center gap-6 p-4 bg-background-2 border border-border">
                            <div
                                className="h-20 w-20 flex items-center justify-center border border-dashed border-border relative overflow-hidden group hover:border-foreground/30 transition-colors cursor-pointer bg-card"
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" />
                                ) : (
                                    <ImageIcon className="h-7 w-7 text-foreground-soft group-hover:text-foreground" strokeWidth={1.5} />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="flex-1 space-y-3">
                                <Label>Visual identity</Label>
                                <p className="font-serif text-xs text-foreground-soft">Upload a logo for auto-color extraction, or set the palette manually.</p>
                                <div className="flex gap-4">
                                    <div className="space-y-1">
                                        <label className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">Card</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-8 w-12 border border-border overflow-hidden">
                                                <input
                                                    type="color"
                                                    value={formData.brandColor}
                                                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                                                    className="absolute inset-0 h-[150%] w-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-none"
                                                />
                                            </div>
                                            <span className="font-mono text-2xs text-foreground-soft">{formData.brandColor}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-mono text-2xs uppercase tracking-widest text-foreground-soft">Font</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-8 w-12 border border-border overflow-hidden">
                                                <input
                                                    type="color"
                                                    value={formData.brandFontColor}
                                                    onChange={(e) => setFormData({ ...formData, brandFontColor: e.target.value })}
                                                    className="absolute inset-0 h-[150%] w-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-none"
                                                />
                                            </div>
                                            <span className="font-mono text-2xs text-foreground-soft">{formData.brandFontColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Brand name</Label>
                            <Input
                                required
                                placeholder="e.g. SharkNinja Global"
                                value={formData.name}
                                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Industry sector</Label>
                            <SelectWrapper
                                required
                                value={formData.industryId}
                                onChange={(e: any) => {
                                    setFormData({ ...formData, industryId: e.target.value, industrySubTypeId: '' });
                                }}
                            >
                                <option value="">Select sector</option>
                                {industries.map((ind: any) => (
                                    <option key={ind.id} value={ind.id}>{ind.name}</option>
                                ))}
                            </SelectWrapper>
                        </div>
                        <div className="space-y-2">
                            <Label>Sub-category</Label>
                            <SelectWrapper
                                required
                                disabled={!formData.industryId}
                                value={formData.industrySubTypeId}
                                onChange={(e: any) => setFormData({ ...formData, industrySubTypeId: e.target.value })}
                            >
                                <option value="">Select sub-type</option>
                                {availableSubTypes.map((sub: any) => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </SelectWrapper>
                        </div>
                        <div className="col-span-1 space-y-2">
                            <Label>Default currency</Label>
                            <SelectWrapper
                                value={formData.defaultCurrency}
                                onChange={(e: any) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                            >
                                <option value="USD">USD — US Dollar</option>
                                <option value="IDR">IDR — Rupiah</option>
                                <option value="SGD">SGD — Singapore Dollar</option>
                                <option value="MYR">MYR — Ringgit</option>
                            </SelectWrapper>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Official website</Label>
                            <Input
                                placeholder="https://brand.com"
                                value={formData.website}
                                onChange={(e: any) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1 h-11"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-11"
                            disabled={loading || !formData.logo_url}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : 'Add brand'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
