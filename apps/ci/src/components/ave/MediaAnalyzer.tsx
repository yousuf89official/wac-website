'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    Calculator, TrendingUp, DollarSign, BarChart3, Sparkles,
    Target, Activity, Save, Loader2
} from 'lucide-react';
import { CampaignInfo } from './CampaignInfo';
import { CampaignAutoFill } from './CampaignAutoFill';
import { ChannelBreakdown } from './ChannelBreakdown';
import { AVEExport } from './AVEExport';
import { CalculationHistory } from './CalculationHistory';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MetricSelections {
    sov: boolean;
    ave: boolean;
    sovInternal: boolean;
    sovExternal: boolean;
    linkSovAve: boolean;
    weightedSov: boolean;
    weightedAve: boolean;
}

interface FormData {
    [key: string]: string;
}

// ─── Channel Weights for Weighted SOV ───────────────────────────────────────

const CHANNEL_WEIGHTS: Record<string, number> = {
    'instagram': 1.2,
    'tiktok': 1.2,
    'youtube': 1.1,
    'facebook': 1.0,
    'google-sem': 0.9,
    'linkedin': 0.8,
    'display-banner': 0.7,
    'kol': 1.3,
    'pr': 1.1,
    'snack-video': 1.0,
    'ott-ads': 0.9,
    'audio': 0.8,
    'dooh': 0.9,
};

// ─── Formatting Helpers ──────────────────────────────────────────────────────

const formatIDR = (value: string | number): string => {
    const str = String(value || '');
    const number = str.replace(/[^\d]/g, '');
    if (!number) return '';
    return `IDR ${parseInt(number).toLocaleString('id-ID')}`;
};

const formatNumber = (value: string | number): string => {
    const str = String(value || '');
    const number = str.replace(/[^\d,]/g, '');
    if (!number) return '';
    const parts = number.split(',');
    parts[0] = parseInt(parts[0] || '0').toLocaleString('id-ID');
    return parts.join(',');
};

const parseNum = (val: string | number | undefined): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.replace(/\./g, '').replace(',', '.') || '0');
};

// ─── Component ───────────────────────────────────────────────────────────────

export const MediaAnalyzer = () => {
    const [selections, setSelections] = useState<MetricSelections>({
        sov: false,
        ave: false,
        sovInternal: false,
        sovExternal: false,
        linkSovAve: false,
        weightedSov: false,
        weightedAve: false,
    });
    const [formData, setFormData] = useState<FormData>({});
    const [results, setResults] = useState<any>(null);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [brandId, setBrandId] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [channelAVEResults, setChannelAVEResults] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const toggle = (key: keyof MetricSelections) =>
        setSelections((s) => ({ ...s, [key]: !s[key] }));

    const handleInputChange = (field: string, value: string, isCurrency = false) => {
        if (isCurrency) {
            setFormData({ ...formData, [field]: value.replace(/[^\d]/g, '') });
        } else if (['brandName', 'categoryBusiness', 'campaignName', 'campaignType', 'campaignObjective'].includes(field)) {
            setFormData({ ...formData, [field]: value });
        } else {
            setFormData({ ...formData, [field]: value.replace(/[^\d,]/g, '') });
        }
    };

    const handleChannelChange = (channel: string, checked: boolean) => {
        setSelectedChannels((prev) => checked ? [...prev, channel] : prev.filter((c) => c !== channel));
    };

    // ─── Auto-Fill Handler ──────────────────────────────────────────────────

    const handleAutoFill = (data: Record<string, any>) => {
        setBrandId(data.brandId);
        setCampaignId(data.campaignId);

        const updates: FormData = { ...formData };
        if (data.brandName) updates.brandName = data.brandName;
        if (data.campaignName) updates.campaignName = data.campaignName;
        if (data.impressions) updates.impressions = data.impressions;
        if (data.reach) updates.totalReach = data.reach;
        if (data.engagement) updates.engagements = data.engagement;
        setFormData(updates);

        if (data.channels && data.channels.length > 0) {
            setSelectedChannels(data.channels);
        }

        toast.success('Auto-Fill Complete', { description: `Loaded data for ${data.campaignName || data.brandName || 'campaign'}.` });
    };

    // ─── Channel AVE Handler ────────────────────────────────────────────────

    const handleChannelAVECalculated = (channelResults: any[]) => {
        setChannelAVEResults(channelResults);
    };

    // ─── Save Handler ───────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!brandId) {
            toast.error('Brand Required', { description: 'Please select a brand via auto-fill or enter a brand name before saving.' });
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/media-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandId,
                    campaignId: campaignId || null,
                    name: formData.campaignName || 'Untitled',
                    inputs: JSON.stringify(formData),
                    results: JSON.stringify(results),
                    aiAnalysis,
                    channels: JSON.stringify(selectedChannels),
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save');
            }

            toast.success('Calculation saved');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            toast.error('Save Failed', { description: message });
        } finally {
            setSaving(false);
        }
    };

    // ─── Load from History Handler ──────────────────────────────────────────

    const handleLoadFromHistory = (analysis: {
        inputs: string;
        results: string;
        aiAnalysis?: string | null;
        channels?: string | null;
        brandId: string;
        campaignId?: string | null;
    }) => {
        try {
            const loadedInputs = JSON.parse(analysis.inputs);
            const loadedResults = JSON.parse(analysis.results);
            const loadedChannels = analysis.channels ? JSON.parse(analysis.channels) : [];

            setFormData(loadedInputs);
            setResults(loadedResults);
            if (analysis.aiAnalysis) setAiAnalysis(analysis.aiAnalysis);
            setSelectedChannels(loadedChannels);
            setBrandId(analysis.brandId);
            if (analysis.campaignId) setCampaignId(analysis.campaignId);

            // Restore metric selections based on loaded results
            setSelections((prev) => ({
                ...prev,
                sov: !!(loadedResults.sovReach || loadedResults.sovEngagement || loadedResults.are),
                ave: !!(loadedResults.impressionAve || loadedResults.engagementAve || loadedResults.videoViewAve),
                sovExternal: !!(loadedResults.sovReach || loadedResults.sovEngagement),
                sovInternal: !!(loadedResults.are || loadedResults.ee || loadedResults.taa),
                weightedAve: !!loadedResults.weightedAve,
            }));

            toast.success('Analysis Loaded', { description: 'Previous calculation has been restored.' });
        } catch {
            toast.error('Load Failed', { description: 'Could not parse saved analysis data.' });
        }
    };

    // ─── Validation ──────────────────────────────────────────────────────────

    const validateAndCalculate = () => {
        const required: string[] = [];
        if (selections.sovExternal) required.push('brandReach', 'categoryReach', 'brandEngagement', 'categoryEngagement');
        if (selections.sovInternal) required.push('totalReach', 'totalAudiencePool', 'totalEngagement');
        if (selections.ave) required.push('impressions', 'engagements', 'videoViews', 'cpm', 'cpe', 'cpv');

        const missing = required.filter((f) => !formData[f]);
        if (missing.length > 0) {
            toast.error('Missing Required Fields', { description: 'Please fill in all required fields before calculating.' });
            return;
        }
        calculateMetrics();
    };

    // ─── Calculation Engine ──────────────────────────────────────────────────

    const calculateMetrics = () => {
        const r: any = {};

        // External SOV
        if (selections.sovExternal) {
            const brandReach = parseNum(formData.brandReach);
            const catReach = parseNum(formData.categoryReach);
            const brandEng = parseNum(formData.brandEngagement);
            const catEng = parseNum(formData.categoryEngagement);
            if (catReach > 0) r.sovReach = (brandReach / catReach * 100).toFixed(2);
            if (catEng > 0) r.sovEngagement = (brandEng / catEng * 100).toFixed(2);
        }

        // Internal Efficiency
        if (selections.sovInternal) {
            const totalReach = parseNum(formData.totalReach);
            const pool = parseNum(formData.totalAudiencePool);
            const totalEng = parseNum(formData.totalEngagement);
            if (pool > 0) {
                r.are = (totalReach / pool * 100).toFixed(2);
                r.ee = (totalEng / pool * 100).toFixed(2);
                r.taa = ((totalReach + totalEng) / pool * 100).toFixed(2);
            }
        }

        // AVE
        if (selections.ave) {
            const impressions = parseNum(formData.impressions);
            const engagements = parseNum(formData.engagements);
            const videoViews = parseNum(formData.videoViews);
            const cpm = parseNum(formData.cpm);
            const cpe = parseNum(formData.cpe);
            const cpv = parseNum(formData.cpv);
            r.impressionAve = (impressions / 1000 * cpm).toFixed(2);
            r.engagementAve = (engagements * cpe).toFixed(2);
            r.videoViewAve = (videoViews * cpv).toFixed(2);

            // Use per-channel AVE sum if available
            if (channelAVEResults.length > 0) {
                const channelSum = channelAVEResults.reduce((sum, ch) => sum + (ch.totalAVE || 0), 0);
                if (channelSum > 0) {
                    r.impressionAve = channelSum.toFixed(2);
                }
            }

            if (selections.weightedAve) {
                r.weightedAve = (parseFloat(r.impressionAve) + parseFloat(r.engagementAve) + parseFloat(r.videoViewAve)).toFixed(2);
            }
        }

        // Link SOV & AVE — multiply AVE by SOV factor
        if (selections.linkSovAve && r.sovReach) {
            const sovMultiplier = 1 + (parseFloat(r.sovReach) / 100);
            if (r.impressionAve) r.impressionAve = (parseFloat(r.impressionAve) * sovMultiplier).toFixed(2);
            if (r.engagementAve) r.engagementAve = (parseFloat(r.engagementAve) * sovMultiplier).toFixed(2);
            if (r.videoViewAve) r.videoViewAve = (parseFloat(r.videoViewAve) * sovMultiplier).toFixed(2);
            if (r.weightedAve) {
                r.weightedAve = (parseFloat(r.impressionAve) + parseFloat(r.engagementAve) + parseFloat(r.videoViewAve)).toFixed(2);
            }
        }

        // Weighted SOV — apply channel weights to SOV calculation
        if (selections.weightedSov && selectedChannels.length > 0) {
            const totalWeight = selectedChannels.reduce((sum, ch) => sum + (CHANNEL_WEIGHTS[ch] || 1.0), 0);
            const avgWeight = totalWeight / selectedChannels.length;
            if (r.sovReach) r.sovReach = (parseFloat(r.sovReach) * avgWeight).toFixed(2);
            if (r.sovEngagement) r.sovEngagement = (parseFloat(r.sovEngagement) * avgWeight).toFixed(2);
        }

        setResults(r);
        generateAIAnalysis(r);
        toast.success('Calculation Complete', { description: 'Marketing metrics calculated successfully.' });
    };

    // ─── AI Analysis Generator ───────────────────────────────────────────────

    const generateAIAnalysis = (m: any) => {
        let a = '## Expert Analysis\n\n';

        if (m.sovReach) {
            const v = parseFloat(m.sovReach);
            a += `**Share of Reach (${v.toFixed(2)}%)**: `;
            a += v > 30 ? 'Excellent market visibility! Your brand commands a strong presence in the category. '
                : v > 15 ? 'Good market presence with room to increase visibility through strategic channel expansion. '
                : 'Lower visibility indicates opportunity for growth. Diversify your channel mix. ';
        }

        if (m.sovEngagement) {
            const v = parseFloat(m.sovEngagement);
            a += `\n\n**Share of Engagement (${v.toFixed(2)}%)**: `;
            a += v > 25 ? 'Outstanding engagement! Your content resonates strongly with the audience. '
                : v > 12 ? 'Decent engagement levels. Focus on content quality and audience targeting. '
                : 'Engagement needs attention. Review content strategy and platform alignment. ';
        }

        if (m.are) {
            const v = parseFloat(m.are);
            a += `\n\n**Audience Reach Efficiency (${v.toFixed(2)}%)**: `;
            a += v > 80 ? 'Excellent reach efficiency across your audience pool. '
                : v > 50 ? 'Good efficiency with optimization opportunities available. '
                : 'Low efficiency indicates potential audience targeting issues. ';
        }

        if (m.weightedAve || m.impressionAve) {
            const v = parseFloat(m.weightedAve || m.impressionAve);
            a += `\n\n**Advertising Value Equivalency**: Earned media value of IDR ${v.toLocaleString('id-ID')} demonstrates `;
            a += v > 100000000 ? 'exceptional ROI from PR and content efforts. '
                : v > 50000000 ? 'solid value generation from organic reach. '
                : 'moderate value. Consider amplifying high-performing content. ';
        }

        if (formData.campaignType) {
            a += `\n\n**${formData.campaignType.replace(/-/g, ' ').toUpperCase()} Strategy**: `;
            a += formData.campaignType === 'top-funnel' ? 'Focus on maximizing reach and brand awareness. SOV metrics are critical. '
                : formData.campaignType === 'middle-funnel' ? 'Balance reach with engagement quality. Optimize cost per engagement. '
                : 'Prioritize conversion-focused channels. Engagement efficiency is key. ';
        }

        if (selectedChannels.length > 0) {
            a += `\n\n**Channel Mix**: With ${selectedChannels.length} channels activated, ensure budget allocation aligns with each channel's performance. `;
        }

        a += `\n\n**Recommendations for ${formData.brandName || 'your brand'}**:`;
        a += '\n- Monitor competitor SOV trends monthly to maintain competitive advantage';
        a += '\n- A/B test content formats to improve engagement rates';
        a += '\n- Leverage high-performing channels for amplification';
        a += '\n- Track AVE against paid media spend for ROI validation';

        setAiAnalysis(a);
    };

    // ─── Number Input Helper ─────────────────────────────────────────────────

    const NumberInput = ({ field, label, currency = false }: { field: string; label: string; currency?: boolean }) => (
        <div className="space-y-2">
            <Label className="text-sm">{label}</Label>
            <Input
                value={currency ? (formData[field] ? formatIDR(formData[field]) : '') : (formData[field] ? formatNumber(formData[field]) : '')}
                onChange={(e) => handleInputChange(field, e.target.value, currency)}
                placeholder={currency ? 'IDR 0' : '0'}
            />
        </div>
    );

    // ─── Render ──────────────────────────────────────────────────────────────

    const isActive = selections.sov || selections.ave;

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Form (3/4 width on desktop) */}
            <div className="flex-1 lg:w-3/4 space-y-6">
                {/* Campaign Auto-Fill */}
                <CampaignAutoFill onAutoFill={handleAutoFill} />

                {/* Campaign Info */}
                <CampaignInfo
                    formData={formData}
                    onInputChange={handleInputChange}
                    selectedChannels={selectedChannels}
                    onChannelChange={handleChannelChange}
                />

                {/* Channel Breakdown — show when AVE is active and channels selected */}
                {selections.ave && selectedChannels.length > 0 && (
                    <ChannelBreakdown
                        selectedChannels={selectedChannels}
                        onChannelAVECalculated={handleChannelAVECalculated}
                    />
                )}

                {/* Metric Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card
                        className={`bg-card border border-border cursor-pointer transition-all hover:border-primary/40 ${selections.sov ? 'border-primary/60 bg-primary/5' : ''}`}
                        onClick={() => toggle('sov')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Checkbox
                                    checked={selections.sov}
                                    onCheckedChange={(checked) => setSelections({ ...selections, sov: checked as boolean })}
                                    className="mt-1 h-5 w-5"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div>
                                    <div className="flex items-center gap-2 text-lg font-semibold">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Share of Voice (SOV)
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Measure brand visibility vs competitors and internal audience efficiency
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`bg-card border border-border cursor-pointer transition-all hover:border-accent/40 ${selections.ave ? 'border-accent/60 bg-accent/5' : ''}`}
                        onClick={() => toggle('ave')}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Checkbox
                                    checked={selections.ave}
                                    onCheckedChange={(checked) => setSelections({ ...selections, ave: checked as boolean })}
                                    className="mt-1 h-5 w-5"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div>
                                    <div className="flex items-center gap-2 text-lg font-semibold">
                                        <DollarSign className="w-5 h-5 text-accent" />
                                        Advertising Value Equivalency (AVE)
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Calculate equivalent advertising value of earned media
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SOV Sub-options */}
                {selections.sov && (
                    <Card className="bg-card border border-border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                SOV Analysis Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer hover:bg-card/80">
                                    <Checkbox
                                        checked={selections.sovExternal}
                                        onCheckedChange={(checked) => setSelections({ ...selections, sovExternal: checked as boolean })}
                                        className="mt-0.5 h-5 w-5"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm">External SOV (vs Category)</span>
                                        <p className="text-xs text-muted-foreground mt-1">Compare against category benchmarks</p>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer hover:bg-card/80">
                                    <Checkbox
                                        checked={selections.sovInternal}
                                        onCheckedChange={(checked) => setSelections({ ...selections, sovInternal: checked as boolean })}
                                        className="mt-0.5 h-5 w-5"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm">Internal Efficiency Metrics</span>
                                        <p className="text-xs text-muted-foreground mt-1">Measure efficiency vs your own audience pool</p>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Combined Options */}
                {selections.sov && selections.ave && (
                    <Card className="bg-card border border-border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Combined Analysis Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-border transition-all cursor-pointer hover:bg-card/80">
                                    <Checkbox
                                        checked={selections.linkSovAve}
                                        onCheckedChange={(checked) => setSelections({ ...selections, linkSovAve: checked as boolean })}
                                        className="mt-0.5 h-5 w-5"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm">Link SOV & AVE</span>
                                        <p className="text-xs text-muted-foreground mt-1">Multiply AVE by SOV factor for comprehensive analysis</p>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-border transition-all cursor-pointer hover:bg-card/80">
                                    <Checkbox
                                        checked={selections.weightedSov}
                                        onCheckedChange={(checked) => setSelections({ ...selections, weightedSov: checked as boolean })}
                                        className="mt-0.5 h-5 w-5"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm">Weighted SOV</span>
                                        <p className="text-xs text-muted-foreground mt-1">Apply channel weights to SOV calculation</p>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-border transition-all cursor-pointer hover:bg-card/80">
                                    <Checkbox
                                        checked={selections.weightedAve}
                                        onCheckedChange={(checked) => setSelections({ ...selections, weightedAve: checked as boolean })}
                                        className="mt-0.5 h-5 w-5"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm">Weighted AVE Score</span>
                                        <p className="text-xs text-muted-foreground mt-1">Calculate total weighted advertising value</p>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* External SOV Inputs */}
                {selections.sovExternal && (
                    <Card className="bg-card border border-border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                External SOV Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <NumberInput field="brandReach" label="Brand Reach" />
                                <NumberInput field="categoryReach" label="Category Reach" />
                                <NumberInput field="brandEngagement" label="Brand Engagement" />
                                <NumberInput field="categoryEngagement" label="Category Engagement" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Internal Efficiency Inputs */}
                {selections.sovInternal && (
                    <Card className="bg-card border border-border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="w-4 h-4 text-success" />
                                Internal Efficiency Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <NumberInput field="totalReach" label="Total Reach" />
                                <NumberInput field="totalAudiencePool" label="Total Audience Pool" />
                                <NumberInput field="totalEngagement" label="Total Engagement" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* AVE Inputs */}
                {selections.ave && (
                    <Card className="bg-card border border-border">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-accent" />
                                AVE Calculation Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <NumberInput field="impressions" label="Total Impressions" />
                                <NumberInput field="engagements" label="Total Engagements" />
                                <NumberInput field="videoViews" label="Video Views" />
                                <NumberInput field="cpm" label="CPM (Cost per 1,000 Impressions)" currency />
                                <NumberInput field="cpe" label="CPE (Cost per Engagement)" currency />
                                <NumberInput field="cpv" label="CPV (Cost per View)" currency />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Calculate + Save Buttons */}
                {isActive && (
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={validateAndCalculate}
                            size="lg"
                            className="h-14 px-10 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-lg"
                        >
                            <Calculator className="mr-2 h-5 w-5" />
                            Calculate Metrics
                        </Button>
                        {results && (
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 text-base font-semibold border-border hover:bg-card/80 transition-colors"
                            >
                                {saving ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-5 w-5" />
                                )}
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        )}
                    </div>
                )}

                {/* Results */}
                {results && (
                    <Card className="bg-card border border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Calculation Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.sovReach && (
                                    <ResultCard label="Share of Reach (SOV)" value={`${results.sovReach}%`} tone="primary" />
                                )}
                                {results.sovEngagement && (
                                    <ResultCard label="Share of Engagement (SOV)" value={`${results.sovEngagement}%`} tone="accent" />
                                )}
                                {results.are && (
                                    <ResultCard label="Audience Reach Efficiency (ARE)" value={`${results.are}%`} tone="success" />
                                )}
                                {results.ee && (
                                    <ResultCard label="Engagement Efficiency (EE)" value={`${results.ee}%`} tone="primary" />
                                )}
                                {results.taa && (
                                    <ResultCard label="Total Audience Activation (TAA)" value={`${results.taa}%`} tone="accent" />
                                )}
                                {results.impressionAve && (
                                    <ResultCard
                                        label="Impression-Based AVE"
                                        value={`IDR ${parseFloat(results.impressionAve).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`}
                                        tone="success"
                                    />
                                )}
                                {results.engagementAve && (
                                    <ResultCard
                                        label="Engagement-Based AVE"
                                        value={`IDR ${parseFloat(results.engagementAve).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`}
                                        tone="primary"
                                    />
                                )}
                                {results.videoViewAve && (
                                    <ResultCard
                                        label="Video View-Based AVE"
                                        value={`IDR ${parseFloat(results.videoViewAve).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`}
                                        tone="accent"
                                    />
                                )}
                                {results.weightedAve && (
                                    <div className="sm:col-span-2 lg:col-span-3 p-6 rounded-xl bg-primary border border-border">
                                        <p className="text-sm text-primary-foreground/70 mb-1">Weighted AVE (Total)</p>
                                        <p className="text-4xl font-bold text-primary-foreground">
                                            IDR {parseFloat(results.weightedAve).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* AVE Export — show when results exist */}
                {results && (
                    <AVEExport
                        campaignInfo={{
                            brandName: formData.brandName || '',
                            campaignName: formData.campaignName || '',
                            campaignType: formData.campaignType || '',
                            campaignObjective: formData.campaignObjective || '',
                            categoryBusiness: formData.categoryBusiness || '',
                        }}
                        results={results}
                        channels={selectedChannels}
                        aiAnalysis={aiAnalysis}
                    />
                )}

                {/* AI Analysis */}
                {aiAnalysis && (
                    <Card className="bg-card border border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                AI-Powered Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {aiAnalysis.split('\n').map((line, i) => {
                                    if (line.startsWith('## ')) {
                                        return <h3 key={i} className="text-xl font-bold mt-4 mb-3">{line.replace('## ', '')}</h3>;
                                    }
                                    if (line.startsWith('**')) {
                                        const parts = line.split('**');
                                        return (
                                            <p key={i} className="text-sm leading-relaxed">
                                                {parts.map((part, j) =>
                                                    j % 2 === 1 ? <strong key={j} className="text-primary">{part}</strong> : part
                                                )}
                                            </p>
                                        );
                                    }
                                    if (line.startsWith('-')) {
                                        return <li key={i} className="text-sm text-muted-foreground ml-4">{line.replace('- ', '')}</li>;
                                    }
                                    if (line.trim()) {
                                        return <p key={i} className="text-sm text-muted-foreground">{line}</p>;
                                    }
                                    return null;
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* History Panel (1/4 width on desktop, full width on mobile) */}
            <div className="w-full lg:w-1/4 lg:min-w-[280px]">
                <CalculationHistory
                    brandId={brandId}
                    onLoad={handleLoadFromHistory}
                />
            </div>
        </div>
    );
};

// ─── Result Card ─────────────────────────────────────────────────────────────

type ResultTone = 'primary' | 'accent' | 'success';

const TONE_STYLES: Record<ResultTone, { border: string; bg: string; text: string }> = {
    primary: { border: 'border-primary/20', bg: 'bg-primary/[0.04]', text: 'text-primary' },
    accent: { border: 'border-accent/20', bg: 'bg-accent/[0.04]', text: 'text-accent' },
    success: { border: 'border-success/20', bg: 'bg-success/[0.04]', text: 'text-success' },
};

const ResultCard = ({ label, value, tone }: { label: string; value: string; tone: ResultTone }) => {
    const styles = TONE_STYLES[tone];
    return (
        <div className={`p-5 rounded-xl border-2 transition-colors ${styles.border} ${styles.bg}`}>
            <p className="text-xs text-muted-foreground mb-2">{label}</p>
            <p className={`text-2xl font-bold ${styles.text}`}>{value}</p>
        </div>
    );
};
