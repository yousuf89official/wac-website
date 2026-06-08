
import React from 'react';
import { RefreshCcw, Trash2 } from 'lucide-react';
import { BrandAvatar } from './BrandAvatar';
import { Badge, Button } from './BrandPrimitives';
import { EnrichedBrand } from '@/lib/brands-data';

export const ArchiveTable = ({ brands, onRestore, onDelete, onUpdateStatus }: {
    brands: EnrichedBrand[],
    onRestore: (id: string, name: string) => void,
    onDelete: (id: string, name: string, permanent?: boolean) => void,
    onUpdateStatus: (id: string, status: string) => void
}) => {
    return (
        <div className="bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="px-6 py-4 text-left font-mono text-2xs uppercase tracking-widest text-foreground-soft">Brand</th>
                            <th className="px-6 py-4 text-left font-mono text-2xs uppercase tracking-widest text-foreground-soft">Sector</th>
                            <th className="px-6 py-4 text-left font-mono text-2xs uppercase tracking-widest text-foreground-soft">Archived</th>
                            <th className="px-6 py-4 text-left font-mono text-2xs uppercase tracking-widest text-foreground-soft">Status</th>
                            <th className="px-6 py-4 text-right font-mono text-2xs uppercase tracking-widest text-foreground-soft">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="transition-colors hover:bg-foreground/[0.03]">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <BrandAvatar
                                            logo_url={brand.logo}
                                            name={brand.name}
                                            brand_color={brand.brandColor || undefined}
                                            size="sm"
                                        />
                                        <div>
                                            <div className="font-display text-base text-foreground tracking-tight">{brand.name}</div>
                                            <div className="font-mono text-2xs text-foreground-soft">{brand.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-sans text-sm text-foreground">{brand.industry}</span>
                                        <span className="font-mono text-2xs text-foreground-soft uppercase tracking-widest">{brand.sub_category}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-2xs text-foreground-soft uppercase tracking-widest">
                                        {new Date(brand.updatedAt).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="inactive">Archived</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onRestore(brand.id, brand.name)}
                                            className="h-8 w-8 p-0"
                                            title="Restore to Active"
                                        >
                                            <RefreshCcw className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onDelete(brand.id, brand.name, true)}
                                            className="h-8 w-8 p-0 hover:border-destructive/30"
                                            title="Delete Permanently"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
