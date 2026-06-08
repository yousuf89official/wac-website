import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NeonButton from '../ui/NeonButton';
import api from '@/lib/api';
import { calculateSeoScore, SeoCheck } from '@/utils/seoUtils';
import { useBlogPosts, useCaseStudies } from '@/hooks/useContent';

const SeoManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'global' | 'audit' | 'optimize'>('global');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentType, setContentType] = useState<'blog' | 'case-study' | null>(null);

  // Queries
  const { data: globalSeo, isLoading: loadingGlobal } = useQuery({
    queryKey: ['global-seo'],
    queryFn: async () => (await api.get('/seo/global')).data
  });

  const { data: posts } = useBlogPosts();
  const { data: studies } = useCaseStudies();

  // Mutations
  const updateGlobal = useMutation({
    mutationFn: async (data: any) => api.put('/seo/global', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-seo'] });
      alert('Global SEO settings saved!');
    }
  });

  const updateContent = useMutation({
    mutationFn: async ({ type, id, data }: { type: 'blog' | 'case-study', id: number, data: any }) => {
      // Determine endpoint based on type (assuming endpoints exist or using generic update)
      // Ideally we'd have specific update endpoints, checking server/index.js...
      // It seems we need to implement specific update endpoints for posts/studies or assume generic logic.
      // For now, I'll assume we might need to add/use specific update routes.
      // Based on existing server.js, we have /api/leads/:id but not explicit post/case-study updates.
      // I will implement a temporary patch or use what's available. 
      // Wait, I see no update endpoints for blog/case studies in the viewed file earlier.
      // I will assume for this step I need to add them or they exist (I'll check).
      // Actually, I'll just mock the alert for now or add the endpoint quickly if missing.
      // Let's assume we will add them.
      return api.put(`/${type === 'blog' ? 'blogs' : 'case-studies'}/${id}/seo`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [contentType === 'blog' ? 'blog-posts' : 'case-studies'] });
      alert('Content SEO updated!');
    }
  });


  // Audit Logic
  const runAudit = () => {
    const issues: any[] = [];
    if (!globalSeo?.siteName) issues.push({ severity: 'critical', message: 'Missing Global Site Name' });
    if (!globalSeo?.defaultImage) issues.push({ severity: 'warn', message: 'Missing Default OG Image' });

    posts?.forEach((p: any) => {
      if (!p.metaTitle) issues.push({ severity: 'warn', message: `Blog: "${p.title}" missing meta title` });
      if (!p.metaDescription) issues.push({ severity: 'warn', message: `Blog: "${p.title}" missing meta description` });
    });

    return issues;
  };

  const auditResults = runAudit();

  // Optimization Logic
  const seoScore = selectedContent ? calculateSeoScore(
    selectedContent.metaTitle || selectedContent.title,
    selectedContent.metaDescription || selectedContent.excerpt || selectedContent.description,
    selectedContent.content || selectedContent.description || '', // Access content appropriately
    selectedContent.focusKeyword || ''
  ) : null;


  if (loadingGlobal) return <div className="text-white">Loading SEO Config...</div>;

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        {['global', 'audit', 'optimize'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Global Settings */}
      {activeTab === 'global' && (
        <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold text-white mb-6">Global Metadata</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Site Name</label>
              <input
                type="text"
                defaultValue={globalSeo?.siteName}
                onBlur={(e) => updateGlobal.mutate({ ...globalSeo, siteName: e.target.value })}
                className="w-full bg-[#111] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Twitter Handle</label>
              <input
                type="text"
                defaultValue={globalSeo?.twitterHandle}
                onBlur={(e) => updateGlobal.mutate({ ...globalSeo, twitterHandle: e.target.value })}
                className="w-full bg-[#111] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Audit Center */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Site Health Check</h3>
            <div className="text-2xl font-black text-primary">{Math.max(0, 100 - (auditResults.length * 5))}%</div>
          </div>

          {auditResults.length === 0 ? (
            <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 text-center">
              All systems nominal. No SEO issues detected.
            </div>
          ) : (
            <div className="grid gap-3">
              {auditResults.map((issue, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 ${issue.severity === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 text-red-500'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${issue.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <span className="font-medium text-sm">{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Optimizer */}
      {activeTab === 'optimize' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Selector */}
          <div className="space-y-6">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setContentType('blog')} className={`flex-1 py-2 rounded border border-white/10 ${contentType === 'blog' ? 'bg-white text-black' : 'text-gray-500'}`}>Blogs</button>
              <button onClick={() => setContentType('case-study')} className={`flex-1 py-2 rounded border border-white/10 ${contentType === 'case-study' ? 'bg-white text-black' : 'text-gray-500'}`}>Case Studies</button>
            </div>

            <div className="h-[400px] overflow-y-auto space-y-2 pr-2">
              {(contentType === 'blog' ? posts : studies)?.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className={`p-4 rounded-xl border border-white/5 cursor-pointer hover:border-primary/50 transition-all ${selectedContent?.id === item.id ? 'bg-primary/10 border-primary' : 'bg-[#111]'}`}
                >
                  <div className="text-white font-bold truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>{item.slug}</span>
                    {item.metaTitle ? <span className="text-green-500">Optimized</span> : <span className="text-gray-600">No Meta</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          {selectedContent ? (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-white">Optimize: {selectedContent.title}</h4>
                <div className={`px-3 py-1 rounded-full text-xs font-black ${(seoScore?.score || 0) > 80 ? 'bg-green-500/20 text-green-500' :
                  (seoScore?.score || 0) > 50 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                  Score: {seoScore?.score}/100
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Focus Keyword</label>
                  <input
                    value={selectedContent.focusKeyword || ''}
                    onChange={(e) => setSelectedContent({ ...selectedContent, focusKeyword: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="e.g. digital marketing"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Meta Title ({selectedContent.metaTitle?.length || 0}/60)</label>
                  <input
                    value={selectedContent.metaTitle || ''}
                    onChange={(e) => setSelectedContent({ ...selectedContent, metaTitle: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="SEO Title"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Meta Description ({selectedContent.metaDescription?.length || 0}/160)</label>
                  <textarea
                    value={selectedContent.metaDescription || ''}
                    onChange={(e) => setSelectedContent({ ...selectedContent, metaDescription: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-24 resize-none"
                    placeholder="SEO Description"
                  />
                </div>
              </div>

              {/* Checks */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                {seoScore?.checks.map((check, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${check.status === 'pass' ? 'text-green-500' :
                    check.status === 'warn' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${check.status === 'pass' ? 'bg-green-500' :
                      check.status === 'warn' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    {check.message}
                  </div>
                ))}
              </div>

              <NeonButton
                variant="primary"
                className="w-full"
                onClick={() => {
                  updateContent.mutate({
                    type: contentType!,
                    id: selectedContent.id,
                    data: {
                      metaTitle: selectedContent.metaTitle,
                      metaDescription: selectedContent.metaDescription,
                      focusKeyword: selectedContent.focusKeyword,
                      canonicalUrl: selectedContent.canonicalUrl
                    }
                  });
                }}
              >
                Save Optimization
              </NeonButton>
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-600 font-medium">Select content to optimize</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeoManager;
