import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import NeonButton from '../ui/NeonButton';
import { Pencil, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface FieldConfig {
    key: string;
    label: string;
    type?: 'text' | 'textarea' | 'image' | 'number';
}

interface ContentManagerProps {
    type: 'services' | 'testimonials' | 'clients' | 'blogs' | 'case-studies' | 'navigation' | 'stats' | 'courses';
    fields: FieldConfig[];
    title: string;
}

const ContentManager: React.FC<ContentManagerProps> = ({ type, fields, title }) => {
    const [items, setItems] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { notify } = useNotification();

    useEffect(() => {
        fetchItems();
    }, [type]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/${type}`);
            setItems(data);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            notify.error(`Failed to fetch ${title}. Please check your connection.`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/${type}/${id}`);
            setItems(items.filter(item => item.id !== id));
            notify.success('Item deleted successfully.');
        } catch (error) {
            console.error('Error deleting item:', error);
            notify.error('Failed to delete item.');
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingItem) {
                const { data } = await api.put(`/${type}/${editingItem.id}`, formData);
                setItems(items.map(item => item.id === editingItem.id ? data : item));
                notify.success('Item updated successfully.');
            } else {
                const { data } = await api.post(`/${type}`, formData);
                setItems([data, ...items]);
                notify.success('New item created successfully.');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving item:', error);
            notify.error('Failed to save item. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Helper to get a stable display value for the list view
    const getDisplayValue = (item: any, field: string) => {
        if (field === 'image' || field === 'logo') {
            return (
                <img
                    src={item[field]}
                    alt="thumbnail"
                    className="w-10 h-10 object-cover rounded bg-white/5"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')}
                />
            );
        }
        const val = item[field];
        if (typeof val === 'string' && val.length > 50) return val.substring(0, 50) + '...';
        return val;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <NeonButton variant="primary" size="sm" onClick={handleAdd} icon={<Plus size={16} />}>
                    Add New
                </NeonButton>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary w-8 h-8" />
                </div>
            ) : (
                <div className="rounded-[2rem] bg-card border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                {fields.slice(0, 3).map(field => (
                                    <th key={field.key} className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">
                                        {field.label}
                                    </th>
                                ))}
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={fields.length + 1} className="p-8 text-center text-gray-500">
                                        No items found. Create your first one!
                                    </td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    {fields.slice(0, 3).map(field => (
                                        <td key={field.key} className="p-4 text-sm text-gray-300">
                                            {getDisplayValue(item, field.key)}
                                        </td>
                                    ))}
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-primary transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-destructive transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">
                                {editingItem ? 'Edit Item' : 'Create New Item'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {fields.map(field => (
                                <div key={field.key}>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                                        {field.label}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.key] || ''}
                                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                            className="w-full bg-background border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none min-h-[100px]"
                                            required
                                        />
                                    ) : (
                                        <input
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            value={formData[field.key] || ''}
                                            onChange={e => setFormData({ ...formData, [field.key]: e.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                                            className="w-full bg-background border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                            required={field.key !== 'image' && field.key !== 'logo'}
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-end gap-4 pt-4">
                                <NeonButton type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </NeonButton>
                                <NeonButton type="submit" variant="primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </NeonButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentManager;
