"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bookmark, Download, FileText, Video, Image, File } from 'lucide-react';

interface SavedResource {
    id: number;
    resourceName: string;
    resourceUrl: string;
    resourceType: string;
    savedAt: string;
    downloadedAt: string | null;
}

const typeIcons: Record<string, typeof FileText> = {
    pdf: FileText,
    template: File,
    video: Video,
    course_material: FileText,
    image: Image,
};

export default function SavedResourcesPage() {
    const t = useTranslations('dashboard');
    const [resources, setResources] = useState<SavedResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/portal/subscriptions') // TODO: Replace with /api/portal/resources when available
            .then(() => setResources([]))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-white tracking-tighter">{t('savedResources')}</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : resources.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-12 text-center">
                    <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">{t('noResources')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {resources.map((resource) => {
                        const Icon = typeIcons[resource.resourceType] || File;
                        return (
                            <div key={resource.id} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{resource.resourceName}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-gray-500 uppercase">{resource.resourceType}</span>
                                        <span className="text-xs text-gray-600">{t('savedOn')} {new Date(resource.savedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <a
                                    href={resource.resourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" /> {t('download')}
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
