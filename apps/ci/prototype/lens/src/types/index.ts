export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Platform = 'Twitter' | 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook' | 'Online News';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface KPI {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  icon?: string;
  format?: 'number' | 'percent' | 'score';
}

export interface Mention {
  id: string;
  avatar: string;
  username: string;
  platform: Platform;
  time: string;
  sentiment: Sentiment;
  content: string;
  likes: number;
  shares: number;
  comments: number;
  reviewed?: boolean;
}

export interface VolumeTrendPoint {
  date: string;
  Twitter: number;
  Instagram: number;
  TikTok: number;
  YouTube: number;
  Facebook: number;
  'Online News': number;
}

export interface SentimentData {
  name: Sentiment;
  value: number;
  color: string;
}

export interface TopicData {
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface WordCloudItem {
  text: string;
  value: number;
  sentiment: Sentiment;
}

export interface HeatmapCell {
  day: string;
  hour: number;
  value: number;
}

export interface ShareOfVoiceData {
  brand: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface CrisisAlert {
  id: string;
  title: string;
  severity: Severity;
  time: string;
  description: string;
  active: boolean;
}

export interface CrisisTimelineStep {
  id: string;
  status: 'resolved' | 'active' | 'pending';
  title: string;
  time: string;
  description: string;
}

export interface NegativeAmplifier {
  rank: number;
  username: string;
  platform: Platform;
  followers: number;
  mentions: number;
  reachEstimate: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: Severity;
  enabled: boolean;
  channels: string[];
}

export interface Influencer {
  id: string;
  avatar: string;
  username: string;
  platform: Platform;
  followers: number;
  engagementRate: number;
  aqsScore: number;
  creatorScore: 'A+' | 'A' | 'B+' | 'B' | 'C';
  category: string;
  region: string;
}

export interface CampaignRow {
  influencer: string;
  posts: number;
  reach: number;
  sentimentPercent: number;
  engagementRate: number;
  roi: number;
}

export interface ReputationKPI {
  label: string;
  abbr: string;
  value: number;
  delta: number;
  description: string;
}

export interface LeaderboardRow {
  rank: number;
  brand: string;
  nss: number;
  si: number;
  emss: number;
  mentions: number;
  isOwn?: boolean;
}

export interface IndexTrendPoint {
  date: string;
  NSS: number;
  SI: number;
  EMSS: number;
}

export interface ProvinceData {
  name: string;
  sentiment: number; // -1 to 1
  mentions: number;
}

export interface Stakeholder {
  name: string;
  mentions: number;
  positive: number;
  neutral: number;
  negative: number;
  keyNarrative: string;
}

export interface IssueTaxonomyNode {
  id: string;
  label: string;
  sentiment: Sentiment;
  children?: IssueTaxonomyNode[];
  count?: number;
}

export interface SourceBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface MarketplaceSentiment {
  product: string;
  rating: number;
  totalReviews: number;
  positive: number;
  neutral: number;
  negative: number;
  topComplaints: string[];
}
