"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Video, Image as ImageIcon, File, Trash2 } from 'lucide-react';

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
    image: ImageIcon,
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function SavedResourcesPage() {
    const [resources, setResources] = useState<SavedResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = () => {
        setLoading(true);
        fetch('/api/portal/resources')
            .then(res => res.ok ? res.json() : { resources: [] })
            .then(data => setResources(data.resources || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const handleRemove = async (id: number) => {
        const prev = resources;
        setResources(resources.filter(r => r.id !== id));
        const res = await fetch(`/api/portal/resources/${id}`, { method: 'DELETE' });
        if (!res.ok) setResources(prev);
    };

    const handleDownload = (id: number) => {
        fetch(`/api/portal/resources/${id}`, { method: 'PATCH' }).catch(() => {});
    };

    return (
        <div className="space-y-12">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
            >
                <p className="eyebrow mb-3">PORTAL / RESOURCES</p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Saved resources</h1>
                <p className="font-serif text-foreground-soft mt-3 text-lg max-w-2xl">
                    The files, templates, and reference you've bookmarked. Tap to download — we'll note when you did.
                </p>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : resources.length === 0 ? (
                <div className="border border-foreground/10 p-12 text-center">
                    <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-4">Nothing saved</p>
                    <p className="font-serif text-foreground-soft">Bookmark a resource and it will live here for safekeeping.</p>
                </div>
            ) : (
                <motion.ul
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, ease }}
                    className="divide-y divide-foreground/10 border-y border-foreground/10"
                >
                    {resources.map((resource, i) => {
                        const Icon = typeIcons[resource.resourceType] || File;
                        return (
                            <motion.li
                                key={resource.id}
                                initial={{ opacity: 0, x: -8 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.6, ease, delay: i * 0.04 }}
                                className="grid grid-cols-12 items-center gap-x-6 gap-y-3 py-6 md:py-7"
                            >
                                <span className="col-span-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft md:col-span-1">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="col-span-10 md:col-span-7 flex items-center gap-4">
                                    <Icon className="w-5 h-5 text-foreground-soft flex-shrink-0" strokeWidth={1.25} />
                                    <div className="min-w-0">
                                        <p className="font-display text-xl font-medium tracking-tight truncate">{resource.resourceName}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 font-mono text-2xs uppercase tracking-widest text-foreground-soft">
                                            <span>{resource.resourceType}</span>
                                            <span>Saved {new Date(resource.savedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-2">
                                    <a
                                        href={resource.resourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => handleDownload(resource.id)}
                                        className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-2 font-mono text-2xs uppercase tracking-widest text-foreground hover:bg-foreground/[0.04] transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Download
                                    </a>
                                    <button
                                        onClick={() => handleRemove(resource.id)}
                                        aria-label="Remove"
                                        className="inline-flex items-center gap-2 border border-foreground/15 px-3 py-2 font-mono text-2xs uppercase tracking-widest text-foreground-soft hover:text-destructive hover:border-destructive/40 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            )}
        </div>
    );
}
