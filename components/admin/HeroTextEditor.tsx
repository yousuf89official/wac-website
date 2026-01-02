import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import NeonButton from '../ui/NeonButton';
import { useGlobalContent } from '@/hooks/useContent';
import { useNotification } from '@/context/NotificationContext';

const HeroTextEditor: React.FC = () => {
    const { data: globalContent, refetch } = useGlobalContent();
    const [form, setForm] = useState({
        badge: '',
        headline: '',
        subheadline: ''
    });
    const [saving, setSaving] = useState(false);

    const { notify } = useNotification();

    useEffect(() => {
        if (globalContent?.sections?.hero) {
            setForm({
                badge: globalContent.sections.hero.badge || '',
                headline: globalContent.sections.hero.headline || '',
                subheadline: globalContent.sections.hero.subheadline || ''
            });
        }
    }, [globalContent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/sections/hero', form);
            refetch();
            notify.success('Hero section text has been updated successfully.');
        } catch (error) {
            console.error('Error updating hero:', error);
            notify.error('Failed to update hero section. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 p-8 rounded-[2rem] bg-card border border-white/5">
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Pill Badge</label>
                <input
                    type="text"
                    value={form.badge}
                    onChange={e => setForm({ ...form, badge: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none"
                    placeholder="e.g. Digital Marketing Excellence"
                />
            </div>
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Main Headline</label>
                <textarea
                    value={form.headline}
                    onChange={e => setForm({ ...form, headline: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none text-2xl font-bold min-h-[120px]"
                    placeholder="We Are Collaborative..."
                />
                <p className="text-[10px] text-gray-600 mt-2">The first line will be static, the rest will be styled.</p>
            </div>
            <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Subheadline</label>
                <textarea
                    value={form.subheadline}
                    onChange={e => setForm({ ...form, subheadline: e.target.value })}
                    className="w-full bg-background border border-white/10 rounded-xl p-4 text-white focus:border-primary outline-none min-h-[100px]"
                    placeholder="Where visionary brands..."
                />
            </div>
            <div className="flex justify-end pt-4">
                <NeonButton variant="primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Hero Text'}
                </NeonButton>
            </div>
        </form>
    );
};

export default HeroTextEditor;
