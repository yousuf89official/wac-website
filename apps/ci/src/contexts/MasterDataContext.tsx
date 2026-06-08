'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
    Brand,
    Campaign,
    Platform,
    Channel
} from '@/services/api';
import {
    CHANNELS, CAMPAIGN_TYPES_CONFIG, METRICS,
    CAMPAIGN_OBJECTIVES, BUYING_MODELS
} from '@/constants';
import type {
    CampaignTypeConfig, Metric,
    CampaignObjective, BuyingModel
} from '@/services/api';

interface MasterDataContextType {
    brands: Brand[];
    campaigns: Campaign[];
    platforms: Platform[];
    channels: Channel[];
    campaignTypes: CampaignTypeConfig[];
    objectives: CampaignObjective[];
    metrics: Metric[];
    buyingModels: BuyingModel[];
    isLoading: boolean;

    // Actions
    addChannel: (item: Channel) => void;
    updateChannel: (item: Channel) => void;
    deleteChannel: (id: string) => void;

    addCampaignType: (item: CampaignTypeConfig) => void;
    updateCampaignType: (item: CampaignTypeConfig) => void;
    deleteCampaignType: (id: string) => void;

    addObjective: (item: CampaignObjective) => void;
    updateObjective: (item: CampaignObjective) => void;
    deleteObjective: (id: string) => void;

    addMetric: (item: Metric) => void;
    updateMetric: (item: Metric) => void;
    deleteMetric: (id: string) => void;

    addBuyingModel: (item: BuyingModel) => void;
    updateBuyingModel: (item: BuyingModel) => void;
    deleteBuyingModel: (id: string) => void;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize with mock data, but could be localStorage in future
    const [brands, setBrands] = useState<Brand[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [channels, setChannels] = useState<Channel[]>(CHANNELS);
    const [campaignTypes, setCampaignTypes] = useState<CampaignTypeConfig[]>(CAMPAIGN_TYPES_CONFIG);
    const [objectives, setObjectives] = useState<CampaignObjective[]>(CAMPAIGN_OBJECTIVES);
    const [metrics, setMetrics] = useState<Metric[]>(METRICS);
    const [buyingModels, setBuyingModels] = useState<BuyingModel[]>(BUYING_MODELS);
    const [isLoading, setIsLoading] = useState(false);

    // Initial fetching removed for performance. Pages fetch their own data.
    // MasterData now serves primarily as a holder for static config (metrics, objectives, etc) 
    // and local state for things that simply MUST be shared (though even those are better via React Query cache).

    // --- Actions ---

    // Channels
    const addChannel = (item: Channel) => setChannels(prev => [...prev, item]);
    const updateChannel = (item: Channel) => setChannels(prev => prev.map(i => i.id === item.id ? item : i));
    const deleteChannel = (id: string) => setChannels(prev => prev.filter(i => i.id !== id));

    // Types
    const addCampaignType = (item: CampaignTypeConfig) => setCampaignTypes(prev => [...prev, item]);
    const updateCampaignType = (item: CampaignTypeConfig) => setCampaignTypes(prev => prev.map(i => i.id === item.id ? item : i));
    const deleteCampaignType = (id: string) => setCampaignTypes(prev => prev.filter(i => i.id !== id));

    // Objectives
    const addObjective = (item: CampaignObjective) => setObjectives(prev => [...prev, item]);
    const updateObjective = (item: CampaignObjective) => setObjectives(prev => prev.map(i => i.id === item.id ? item : i));
    const deleteObjective = (id: string) => setObjectives(prev => prev.filter(i => i.id !== id));

    // Metrics
    const addMetric = (item: Metric) => setMetrics(prev => [...prev, item]);
    const updateMetric = (item: Metric) => setMetrics(prev => prev.map(i => i.id === item.id ? item : i));
    const deleteMetric = (id: string) => setMetrics(prev => prev.filter(i => i.id !== id));

    // Buying Models
    const addBuyingModel = (item: BuyingModel) => setBuyingModels(prev => [...prev, item]);
    const updateBuyingModel = (item: BuyingModel) => setBuyingModels(prev => prev.map(i => i.id === item.id ? item : i));
    const deleteBuyingModel = (id: string) => setBuyingModels(prev => prev.filter(i => i.id !== id));


    return (
        <MasterDataContext.Provider value={{
            brands, campaigns, platforms, channels, campaignTypes, objectives, metrics, buyingModels, isLoading,
            addChannel, updateChannel, deleteChannel,
            addCampaignType, updateCampaignType, deleteCampaignType,
            addObjective, updateObjective, deleteObjective,
            addMetric, updateMetric, deleteMetric,
            addBuyingModel, updateBuyingModel, deleteBuyingModel
        }}>
            {children}
        </MasterDataContext.Provider>
    );
};

export const useMasterData = () => {
    const context = useContext(MasterDataContext);
    if (context === undefined) {
        throw new Error('useMasterData must be used within a MasterDataProvider');
    }
    return context;
};
