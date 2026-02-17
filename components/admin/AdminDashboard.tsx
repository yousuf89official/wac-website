import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search } from 'lucide-react';
import SeoManager from './SeoManager';
import ContentManager from './ContentManager';
import HeroTextEditor from './HeroTextEditor';
import NeonButton from '../ui/NeonButton';
import { useGlobalContent, useUpdateTheme } from '@/hooks/useContent';
import { useNotification } from '@/contexts/NotificationContext';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  lead_type: string;
  status: string;
  createdAt: string;
}

interface AdminDashboardProps {
  onClose: () => void;
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: globalContent, refetch: refetchGlobal } = useGlobalContent();

  const [brandForm, setBrandForm] = useState({
    name: '',
    tagline: '',
    description: '',
    heroImage: '',
    defaultEmail: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (globalContent?.brand) {
      setBrandForm({
        name: globalContent.brand.name,
        tagline: globalContent.brand.tagline,
        description: globalContent.brand.description,
        heroImage: globalContent.brand.heroImage || '',
        defaultEmail: globalContent.brand.defaultEmail
      });
    }
  }, [globalContent]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads');
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: number, status: string) => {
    try {
      await api.put(`/leads/${id}`, { status });
      setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/brand', brandForm);
      refetchGlobal();
      alert('Brand updated successfully');
    } catch (error) {
      console.error('Error updating brand:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-background overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Command Centre</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Administrative Operations Domain</p>
          </div>
          <div className="flex gap-4">
            <NeonButton variant="secondary" onClick={onLogout}>Logout</NeonButton>
            <NeonButton variant="outline" onClick={onClose}>Close</NeonButton>
          </div>
        </div>

        <div className="flex gap-4 mb-12 border-b border-white/5 pb-6 overflow-x-auto">
          {['overview', 'leads', 'brand', 'navigation', 'hero', 'theme', 'services', 'testimonials', 'clients', 'blogs', 'work', 'seo'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-8 rounded-[2rem] bg-card border border-white/5">
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 block">Total Leads</span>
              <span className="text-4xl font-black text-white">{leads.length}</span>
            </div>
            {/* Add more stats here */}
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="rounded-[2rem] bg-card border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500">Contact</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500">Subject</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <div className="text-white font-bold">{lead.name}</div>
                      <div className="text-gray-500 text-xs">{lead.email}</div>
                    </td>
                    <td className="p-6 text-gray-400 text-sm">{lead.message}</td>
                    <td className="p-6">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="bg-background border border-white/10 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-6 text-gray-500 text-xs">{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'brand' && (
          <form onSubmit={handleBrandSubmit} className="max-w-2xl space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Agency Name</label>
              <input
                type="text"
                value={brandForm.name}
                onChange={e => setBrandForm({ ...brandForm, name: e.target.value })}
                className="w-full bg-card border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Tagline</label>
              <input
                type="text"
                value={brandForm.tagline}
                onChange={e => setBrandForm({ ...brandForm, tagline: e.target.value })}
                className="w-full bg-card border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Default Email</label>
              <input
                type="email"
                value={brandForm.defaultEmail}
                onChange={e => setBrandForm({ ...brandForm, defaultEmail: e.target.value })}
                className="w-full bg-card border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none"
              />
            </div>
            <NeonButton variant="primary" type="submit">Deploy Changes</NeonButton>
          </form>
        )}

        {activeTab === 'navigation' && (
          <ContentManager
            title="Menu Navigation"
            type="navigation"
            fields={[
              { key: 'label', label: 'Label', type: 'text' },
              { key: 'href', label: 'Link (e.g. #services)', type: 'text' },
              { key: 'order', label: 'Order', type: 'number' }
            ]}
          />
        )}

        {activeTab === 'hero' && (
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Hero Banner Text</h2>
              <HeroTextEditor />
            </div>

            <ContentManager
              title="Key Statistics"
              type="stats"
              fields={[
                { key: 'value', label: 'Value (e.g. $50M+)', type: 'text' },
                { key: 'label', label: 'Label (e.g. Revenue Generated)', type: 'text' },
                { key: 'order', label: 'Order', type: 'number' }
              ]}
            />
          </div>
        )}

        {activeTab === 'theme' && (
          <ThemeManager />
        )}

        {/* Content Management Tabs */}
        {activeTab === 'services' && (
          <ContentManager
            title="Service Offerings"
            type="services"
            fields={[
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'icon', label: 'Icon Type (strategy, performance, etc)', type: 'text' }
            ]}
          />
        )}

        {activeTab === 'testimonials' && (
          <ContentManager
            title="Client Testimonials"
            type="testimonials"
            fields={[
              { key: 'author', label: 'Author', type: 'text' },
              { key: 'role', label: 'Role & Company', type: 'text' },
              { key: 'quote', label: 'Quote', type: 'textarea' },
              { key: 'image', label: 'Avatar URL', type: 'image' }
            ]}
          />
        )}

        {activeTab === 'clients' && (
          <ContentManager
            title="Partner Brands"
            type="clients"
            fields={[
              { key: 'name', label: 'Brand Name', type: 'text' },
              { key: 'logo', label: 'Logo URL', type: 'image' }
            ]}
          />
        )}

        {activeTab === 'blogs' && (
          <ContentManager
            title="Insights & Articles"
            type="blogs"
            fields={[
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'slug', label: 'Slug (URL)', type: 'text' },
              { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
              { key: 'content', label: 'Full Content (Markdown)', type: 'textarea' },
              { key: 'category', label: 'Category', type: 'text' },
              { key: 'image', label: 'Cover Image URL', type: 'image' }
            ]}
          />
        )}

        {activeTab === 'work' && (
          <ContentManager
            title="Case Studies"
            type="case-studies"
            fields={[
              { key: 'title', label: 'Campaign Title', type: 'text' },
              { key: 'client', label: 'Client Name', type: 'text' },
              { key: 'slug', label: 'Slug (URL)', type: 'text' },
              { key: 'description', label: 'Overview', type: 'textarea' },
              { key: 'image', label: 'Cover Image URL', type: 'image' }
            ]}
          />
        )}

        {activeTab === 'seo' && (
          <SeoManager />
        )}
      </div>
    </div>
  );
};

const ThemeManager: React.FC = () => {
  const { data: globalContent } = useGlobalContent();
  const [themeForm, setThemeForm] = useState({
    primaryColor: '#00f0ff',
    secondaryColor: '#b000ff',
    accentColor: '#ff006e',
    backgroundColor: '#0a0a0a',
    cardBackground: '#1a1a1a',
    sectionPadding: '2rem'
  });

  const updateTheme = useUpdateTheme();

  const { notify } = useNotification();

  useEffect(() => {
    if (globalContent?.theme) {
      setThemeForm({
        primaryColor: globalContent.theme.primaryColor || '#00f0ff',
        secondaryColor: globalContent.theme.secondaryColor || '#b000ff',
        accentColor: globalContent.theme.accentColor || '#ff006e',
        backgroundColor: globalContent.theme.backgroundColor || '#0a0a0a',
        cardBackground: globalContent.theme.cardBackground || '#1a1a1a',
        sectionPadding: globalContent.theme.sectionPadding || '2rem'
      });
    }
  }, [globalContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTheme.mutate(themeForm, {
      onSuccess: () => notify.success('Theme settings updated successfully.'),
      onError: () => notify.error('Failed to update theme.')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Primary Color</label>
          <div className="flex gap-4">
            <input
              type="color"
              value={themeForm.primaryColor}
              onChange={e => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
              className="w-12 h-12 rounded-xl bg-card border border-white/10 cursor-pointer overflow-hidden"
            />
            <input
              type="text"
              value={themeForm.primaryColor}
              onChange={e => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
              className="flex-1 bg-card border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Accent Color</label>
          <div className="flex gap-4">
            <input
              type="color"
              value={themeForm.accentColor}
              onChange={e => setThemeForm({ ...themeForm, accentColor: e.target.value })}
              className="w-12 h-12 rounded-xl bg-card border border-white/10 cursor-pointer overflow-hidden"
            />
            <input
              type="text"
              value={themeForm.accentColor}
              onChange={e => setThemeForm({ ...themeForm, accentColor: e.target.value })}
              className="flex-1 bg-card border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Section Spacing (Top/Bottom)</label>
        <div className="flex gap-4 items-center">
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={parseFloat(themeForm.sectionPadding) || 2}
            onChange={e => setThemeForm({ ...themeForm, sectionPadding: `${e.target.value}rem` })}
            className="flex-1 accent-primary"
          />
          <input
            type="text"
            value={themeForm.sectionPadding}
            onChange={e => setThemeForm({ ...themeForm, sectionPadding: e.target.value })}
            className="w-24 bg-card border border-white/10 rounded-xl p-3 text-white text-center focus:border-primary outline-none font-mono"
          />
        </div>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2 italic">Controls vertical rhythm across all sections.</p>
      </div>

      <NeonButton variant="primary" type="submit" disabled={updateTheme.isPending}>
        {updateTheme.isPending ? 'Syncing...' : 'Deploy Theme Configuration'}
      </NeonButton>
    </form>
  );
};

export default AdminDashboard;
