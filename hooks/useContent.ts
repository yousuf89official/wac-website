import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Stat {
    id: number;
    value: string;
    label: string;
    order: number;
}

export interface SectionContent {
    id: number;
    sectionId: string;
    badge?: string;
    headline: string;
    subheadline?: string;
    description?: string;
}

export interface BrandConfig {
    id: number;
    name: string;
    tagline: string;
    logo: string;
    defaultEmail: string;
    domain: string;
    heroImage?: string;
    [key: string]: any;
}

export interface Testimonial {
    id: number;
    quote: string;
    author: string;
    role: string;
    company: string;
    image: string;
    results: string;
    order: number;
}

export interface GlobalContent {
    brand: BrandConfig;
    stats: Stat[];
    sections: Record<string, SectionContent>;
    testimonials: Testimonial[];
    [key: string]: any;
}

export const useGlobalContent = () => {
    return useQuery<GlobalContent>({
        queryKey: ['global-content'],
        queryFn: async () => {
            const { data } = await api.get('/content');
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data } = await api.get('/clients');
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export interface CaseStudy {
    id: number;
    slug: string;
    title: string;
    description: string;
    client: string;
    image: string;
    category: string;
    results: string;
    challenge?: string;
    solution?: string;
    testimonial?: string;
    author?: string;
    [key: string]: any; // Allow other fields to prevent strict type errors if schema evolves
}

export const useCaseStudies = () => {
    return useQuery<CaseStudy[]>({
        queryKey: ['case-studies'],
        queryFn: async () => {
            const { data } = await api.get('/case-studies');
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useBlogPosts = () => {
    return useQuery({
        queryKey: ['blogs'],
        queryFn: async () => {
            const { data } = await api.get('/blogs');
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useSubmitLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (leadData: any) => {
            const { data } = await api.post('/leads', leadData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
};

export const useUpdateTheme = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (themeData: any) => {
            const { data } = await api.put('/theme', themeData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-content'] });
        },
    });
};
