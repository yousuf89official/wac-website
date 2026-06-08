import type {
  Mention, VolumeTrendPoint, SentimentData, TopicData, WordCloudItem,
  HeatmapCell, ShareOfVoiceData, CrisisAlert, CrisisTimelineStep,
  NegativeAmplifier, AlertRule, Influencer, CampaignRow,
  ReputationKPI, LeaderboardRow, IndexTrendPoint, ProvinceData,
  Stakeholder, IssueTaxonomyNode, SourceBreakdown, MarketplaceSentiment, Platform
} from '@/types/lens';

// ═══════════════════════════════════════════════════════════
//  Lens — Mock Data: Bank Negara Indonesia (BNI)
//  Based on real FY2025 financials, social media reviews,
//  BankQuality survey, Google Play ratings, and news data.
//  Sources: BNI Annual Report 2025, Databoks/Katadata,
//           Digivestasi, TrustFinance, PitchBook, Statista,
//           Asian Banker BankQuality Survey, Google Play Store
// ═══════════════════════════════════════════════════════════

// ─── KPI Data ────────────────────────────────────────
// BNI: 16.9M mobile banking users, 4.2 Google Play rating,
// FY2025 net profit Rp20.04T, total assets Rp1,269T
export const socialKPIs = {
  totalMentions: 31_842,
  positivePercent: 58.7,
  nssScore: 38.6,
  totalReach: 42_100_000,
};

// ─── Volume Trend (7 days) ───────────────────────────
// Banking conversations spike on weekdays (payday, promo announcements)
export const volumeTrend: VolumeTrendPoint[] = [
  { date: '01 Apr', Twitter: 680, Instagram: 420, TikTok: 310, YouTube: 85, Facebook: 540, 'Online News': 380 },
  { date: '02 Apr', Twitter: 920, Instagram: 510, TikTok: 440, YouTube: 110, Facebook: 620, 'Online News': 450 },
  { date: '03 Apr', Twitter: 1100, Instagram: 580, TikTok: 520, YouTube: 95, Facebook: 580, 'Online News': 520 },
  { date: '04 Apr', Twitter: 850, Instagram: 460, TikTok: 380, YouTube: 120, Facebook: 490, 'Online News': 410 },
  { date: '05 Apr', Twitter: 1350, Instagram: 690, TikTok: 710, YouTube: 140, Facebook: 720, 'Online News': 580 },
  { date: '06 Apr', Twitter: 780, Instagram: 380, TikTok: 290, YouTube: 75, Facebook: 410, 'Online News': 320 },
  { date: '07 Apr', Twitter: 950, Instagram: 490, TikTok: 420, YouTube: 105, Facebook: 560, 'Online News': 440 },
];

// ─── Sentiment Donut ─────────────────────────────────
// Based on Indonesian banking social media sentiment patterns:
// ~58% positive (convenience, Wondr app praise),
// ~24% neutral (info/news), ~18% negative (app issues, queue complaints)
export const sentimentData: SentimentData[] = [
  { name: 'positive', value: 18691, color: '#22c55e' },
  { name: 'neutral', value: 7642, color: '#64748b' },
  { name: 'negative', value: 5509, color: '#ef4444' },
];

// ─── Top Topics ──────────────────────────────────────
// Real complaint/praise categories from Google Play reviews, Twitter, news
export const topTopics: TopicData[] = [
  { topic: 'Mobile Banking / Wondr', positive: 4200, neutral: 1800, negative: 2400 },
  { topic: 'Customer Service', positive: 1800, neutral: 1200, negative: 2800 },
  { topic: 'Bunga & Suku Bunga', positive: 1400, neutral: 2100, negative: 1600 },
  { topic: 'Transfer & QRIS', positive: 3200, neutral: 1500, negative: 900 },
  { topic: 'Antrian Cabang', positive: 600, neutral: 800, negative: 2200 },
  { topic: 'KPR & Kredit', positive: 2100, neutral: 1400, negative: 800 },
  { topic: 'Keamanan / OTP', positive: 800, neutral: 600, negative: 1900 },
  { topic: 'Promo & Cashback', positive: 3500, neutral: 900, negative: 400 },
];

// ─── Word Cloud ──────────────────────────────────────
// Real keywords from BNI social media conversations
export const wordCloudItems: WordCloudItem[] = [
  { text: 'mobile banking', value: 98, sentiment: 'positive' },
  { text: 'Wondr', value: 92, sentiment: 'positive' },
  { text: 'QRIS', value: 85, sentiment: 'positive' },
  { text: 'antri', value: 80, sentiment: 'negative' },
  { text: 'transfer', value: 78, sentiment: 'positive' },
  { text: 'customer service', value: 75, sentiment: 'negative' },
  { text: 'OTP', value: 72, sentiment: 'negative' },
  { text: 'tapcash', value: 68, sentiment: 'positive' },
  { text: 'promo', value: 65, sentiment: 'positive' },
  { text: 'bunga', value: 63, sentiment: 'neutral' },
  { text: 'KPR', value: 60, sentiment: 'positive' },
  { text: 'error', value: 58, sentiment: 'negative' },
  { text: 'lambat', value: 55, sentiment: 'negative' },
  { text: 'tabungan', value: 52, sentiment: 'neutral' },
  { text: 'mudah', value: 50, sentiment: 'positive' },
  { text: 'cabang', value: 48, sentiment: 'neutral' },
  { text: 'ATM', value: 45, sentiment: 'neutral' },
  { text: 'agen46', value: 42, sentiment: 'positive' },
  { text: 'kredit macet', value: 40, sentiment: 'negative' },
  { text: 'face detection', value: 38, sentiment: 'negative' },
  { text: 'dividend', value: 35, sentiment: 'positive' },
  { text: 'BBNI', value: 33, sentiment: 'neutral' },
  { text: 'ESG', value: 30, sentiment: 'positive' },
  { text: 'green financing', value: 28, sentiment: 'positive' },
];

// ─── Mention Feed ────────────────────────────────────
// Real BNI complaint/praise patterns from Google Play, Twitter, news
const avatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bni1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bni2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bni3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bni4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bni5',
];

const platforms: Platform[] = ['Twitter', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Online News'];

export const mentions: Mention[] = [
  { id: '1', avatar: avatars[0], username: '@andi_finance', platform: 'Twitter', time: '3 menit lalu', sentiment: 'positive', content: 'Aplikasi Wondr by BNI makin smooth, transfer antar bank cuma 2 detik. Dulu sering error, sekarang udah stabil banget 👍', likes: 892, shares: 124, comments: 67 },
  { id: '2', avatar: avatars[1], username: '@sari_jakarta', platform: 'Instagram', time: '12 menit lalu', sentiment: 'negative', content: 'Sudah 25 kali coba face detection di BNI Mobile, selalu gagal. Mau buka rekening online aja ribet banget. Kapan diperbaiki sih? 😤', likes: 2340, shares: 456, comments: 312 },
  { id: '3', avatar: avatars[2], username: '@ojk_watch', platform: 'Twitter', time: '28 menit lalu', sentiment: 'neutral', content: 'BNI catat laba bersih Rp20,04 triliun di FY2025, turun 7,15% YoY. Kredit tumbuh 15,94% ke Rp899,5 triliun. NIM turun ke 3,80%.', likes: 1560, shares: 890, comments: 234 },
  { id: '4', avatar: avatars[3], username: '@review_bank_id', platform: 'YouTube', time: '1 jam lalu', sentiment: 'positive', content: 'Review lengkap Wondr by BNI 2026 — fitur investasi, QRIS, split bill semua ada. BNI Mobile Banking terbaik versi Google Play Store!', likes: 12400, shares: 1800, comments: 890 },
  { id: '5', avatar: avatars[4], username: '@budi_nasabah', platform: 'Twitter', time: '1 jam lalu', sentiment: 'negative', content: 'Antri di BNI cabang Sudirman 2 jam lebih. Cuma 1 teller yang buka. WhatsApp CS dijawab 4 jam kemudian. Pelayanan mengecewakan!', likes: 4200, shares: 1200, comments: 567 },
  { id: '6', avatar: avatars[0], username: '@ibu_menabung', platform: 'Facebook', time: '2 jam lalu', sentiment: 'positive', content: 'Alhamdulillah BNI Agen46 di desa kami sudah bisa terima setoran BPJS & PLN. Ga perlu ke kota lagi. Terima kasih BNI 🙏', likes: 3400, shares: 890, comments: 234 },
  { id: '7', avatar: avatars[1], username: '@bisnis_com', platform: 'Online News', time: '3 jam lalu', sentiment: 'neutral', content: 'BNI mencatat pertumbuhan aset tertinggi di antara bank BUMN sebesar 20,52% YoY pada 2025, total aset mencapai Rp1.269 triliun.', likes: 890, shares: 345, comments: 78 },
  { id: '8', avatar: avatars[2], username: '@expat_jakarta', platform: 'Twitter', time: '3 jam lalu', sentiment: 'negative', content: 'BNI Mobile suddenly device not compatible. Need to buy new phone because of their update? Then login impossible, need to visit branch. Amateurs!', likes: 5600, shares: 1800, comments: 923 },
  { id: '9', avatar: avatars[3], username: '@investor_saham', platform: 'Twitter', time: '4 jam lalu', sentiment: 'positive', content: 'BBNI dividend yield 8,56% — tertinggi di antara Big 4 bank. Goldman Sachs upgrade dari Neutral ke Buy. Siap akumulasi!', likes: 6700, shares: 2100, comments: 456 },
  { id: '10', avatar: avatars[4], username: '@fintech_daily', platform: 'TikTok', time: '4 jam lalu', sentiment: 'positive', content: 'BNI Open API udah connect ke 4.000+ mitra. QRIS BNI paling gampang buat UMKM. Tutorial lengkap di video ini! #BNI #QRIS', likes: 18900, shares: 4500, comments: 1230 },
  { id: '11', avatar: avatars[0], username: '@dewi_kredit', platform: 'Facebook', time: '5 jam lalu', sentiment: 'negative', content: 'Pengajuan KPR BNI sudah 3 bulan tapi tidak ada kabar. Ditelepon ke cabang selalu sibuk. Akhirnya pindah ke Mandiri, proses cuma 2 minggu.', likes: 2100, shares: 670, comments: 345 },
  { id: '12', avatar: avatars[1], username: '@katadata_id', platform: 'Online News', time: '6 jam lalu', sentiment: 'positive', content: 'BNI Sekuritas raih Best Investment Bank for Equity Capital Markets 2025. Rating ESG BNI naik ke "A" dari MSCI, tertinggi di antara bank Indonesia.', likes: 1200, shares: 456, comments: 123 },
];

// ─── Source Breakdown ────────────────────────────────
// Banking discussion dominated by Twitter (fintwit) and Facebook (mass market)
export const sourceBreakdown: SourceBreakdown[] = [
  { name: 'Twitter', value: 30, color: '#1d9bf0' },
  { name: 'Facebook', value: 22, color: '#1877f2' },
  { name: 'Online News', value: 18, color: '#f59e0b' },
  { name: 'Instagram', value: 15, color: '#e1306c' },
  { name: 'TikTok', value: 10, color: '#00f2ea' },
  { name: 'YouTube', value: 5, color: '#ff0000' },
];

// ─── Peak Time Heatmap ───────────────────────────────
// Banking conversations peak on weekdays during office hours
// and payday periods (25th-1st of month)
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const heatmapData: HeatmapCell[] = days.flatMap(day =>
  Array.from({ length: 24 }, (_, hour) => ({
    day,
    hour,
    value: Math.round(
      (day === 'Sat' || day === 'Sun' ? 0.6 : 1.2) *
      (hour >= 8 && hour <= 17 ? 50 + Math.random() * 55 : 5 + Math.random() * 15) *
      (hour >= 11 && hour <= 13 ? 1.6 : 1) *
      (hour >= 19 && hour <= 21 ? 1.4 : 1) *
      (day === 'Mon' ? 1.3 : 1) // Monday spike: weekend backlog complaints
    ),
  }))
);

// ─── Share of Voice ──────────────────────────────────
// Big 4 bank comparison based on Digivestasi FY2025 profit rankings
// and BankQuality Consumer Survey
export const shareOfVoice: ShareOfVoiceData[] = [
  { brand: 'BCA', positive: 5800, neutral: 3200, negative: 1200, total: 10200 },
  { brand: 'Bank Mandiri', positive: 4600, neutral: 2800, negative: 1800, total: 9200 },
  { brand: 'BRI', positive: 4200, neutral: 2400, negative: 2100, total: 8700 },
  { brand: 'BNI', positive: 3800, neutral: 1900, negative: 2100, total: 7800 },
];

// ─── Crisis Data ─────────────────────────────────────
// Based on real BNI complaint patterns from Google Play and Twitter
export const crisisAlerts: CrisisAlert[] = [
  { id: '1', title: 'Viral: Wondr App Login Gagal Massal', severity: 'high', time: '1 jam lalu', description: 'Ratusan nasabah melaporkan tidak bisa login ke Wondr by BNI setelah update ke v5.16. Thread viral di Twitter dengan 8.4K retweets. Sentimen negatif meningkat 420% dalam 4 jam terakhir.', active: true },
  { id: '2', title: 'Keluhan Face Detection Berulang', severity: 'medium', time: '6 jam lalu', description: 'Keluhan face detection di BNI Mobile terus meningkat. Topik "face detection BNI" trending di Google Indonesia. Rating Google Play turun dari 4.2 ke 4.0.', active: true },
  { id: '3', title: 'Isu Antrian Panjang Cabang', severity: 'low', time: '2 hari lalu', description: 'Beberapa cabang BNI di Jakarta dilaporkan hanya membuka 1 teller saat jam sibuk. Beredar di media sosial foto antrian panjang.', active: false },
];

export const crisisTimeline: CrisisTimelineStep[] = [
  { id: '1', status: 'resolved', title: 'Deteksi Anomali', time: '09:15 WIB', description: 'Sistem Lens mendeteksi lonjakan 420% mention negatif terkait "Wondr login error"' },
  { id: '2', status: 'resolved', title: 'Eskalasi ke Divisi IT & Humas', time: '09:30 WIB', description: 'Alert otomatis dikirim ke VP Digital Banking dan tim Corporate Communications' },
  { id: '3', status: 'resolved', title: 'Identifikasi Root Cause', time: '10:00 WIB', description: 'Tim IT mengidentifikasi bug pada update v5.16 terkait device compatibility check' },
  { id: '4', status: 'active', title: 'Rollback & Statement Publik', time: '10:45 WIB', description: 'Hotfix di-deploy, statement resmi di-post di akun @BNI Twitter dan Instagram' },
  { id: '5', status: 'pending', title: 'Monitoring Recovery', time: 'TBD', description: 'Pantau penurunan sentimen negatif dan recovery rating App Store selama 48 jam' },
  { id: '6', status: 'pending', title: 'Post-Mortem Report', time: 'TBD', description: 'Compile incident report lengkap untuk Board of Directors dan OJK' },
];

export const negativeAmplifiers: NegativeAmplifier[] = [
  { rank: 1, username: '@tech_in_asia', platform: 'Twitter', followers: 1_800_000, mentions: 2, reachEstimate: 4_200_000 },
  { rank: 2, username: '@kompas_bisnis', platform: 'Online News', followers: 3_200_000, mentions: 1, reachEstimate: 3_800_000 },
  { rank: 3, username: '@nasabah_curhat', platform: 'TikTok', followers: 920_000, mentions: 8, reachEstimate: 3_100_000 },
  { rank: 4, username: '@konsumen_indonesia', platform: 'Twitter', followers: 580_000, mentions: 12, reachEstimate: 2_600_000 },
  { rank: 5, username: '@review_bank_id', platform: 'YouTube', followers: 450_000, mentions: 3, reachEstimate: 1_800_000 },
];

export const alertRules: AlertRule[] = [
  { id: '1', name: 'Spike Keluhan Aplikasi', condition: 'negative_mentions_increase', threshold: 200, severity: 'high', enabled: true, channels: ['Email', 'Slack', 'WhatsApp'] },
  { id: '2', name: 'Viral Thread (>2K RT)', condition: 'retweet_count_exceeds', threshold: 2000, severity: 'high', enabled: true, channels: ['Email', 'Slack'] },
  { id: '3', name: 'Mention Media Nasional Negatif', condition: 'source_type_match', threshold: 1, severity: 'medium', enabled: true, channels: ['Email'] },
  { id: '4', name: 'Penurunan NSS > 5 poin', condition: 'nss_delta_below', threshold: -5, severity: 'critical', enabled: true, channels: ['Email', 'Slack', 'WhatsApp', 'SMS'] },
  { id: '5', name: 'Turun Rating Google Play', condition: 'app_rating_drop', threshold: -0.2, severity: 'medium', enabled: true, channels: ['Email', 'Slack'] },
  { id: '6', name: 'OJK / BI Mention', condition: 'regulator_mention', threshold: 1, severity: 'critical', enabled: true, channels: ['Email', 'Slack', 'WhatsApp'] },
];

// ─── Influencer Data ─────────────────────────────────
// Finance & banking influencers in Indonesian social media
export const influencers: Influencer[] = [
  { id: '1', avatar: avatars[0], username: '@felicia_putri', platform: 'YouTube', followers: 4_800_000, engagementRate: 7.8, aqsScore: 91, creatorScore: 'A+', category: 'Finance', region: 'DKI Jakarta' },
  { id: '2', avatar: avatars[1], username: '@raditya_dika', platform: 'YouTube', followers: 12_000_000, engagementRate: 5.2, aqsScore: 88, creatorScore: 'A+', category: 'Lifestyle', region: 'DKI Jakarta' },
  { id: '3', avatar: avatars[2], username: '@jouska_id', platform: 'Instagram', followers: 1_100_000, engagementRate: 6.4, aqsScore: 82, creatorScore: 'A', category: 'Finance', region: 'DKI Jakarta' },
  { id: '4', avatar: avatars[3], username: '@ngomongin_uang', platform: 'TikTok', followers: 2_600_000, engagementRate: 9.8, aqsScore: 86, creatorScore: 'A+', category: 'Finance', region: 'Jawa Barat' },
  { id: '5', avatar: avatars[4], username: '@zap_finance', platform: 'YouTube', followers: 1_900_000, engagementRate: 8.1, aqsScore: 84, creatorScore: 'A', category: 'Finance', region: 'DKI Jakarta' },
  { id: '6', avatar: avatars[0], username: '@prita_ghozie', platform: 'Instagram', followers: 890_000, engagementRate: 5.6, aqsScore: 79, creatorScore: 'B+', category: 'Finance', region: 'DKI Jakarta' },
  { id: '7', avatar: avatars[1], username: '@duitologi', platform: 'TikTok', followers: 1_400_000, engagementRate: 10.2, aqsScore: 81, creatorScore: 'A', category: 'Finance', region: 'Jawa Timur' },
  { id: '8', avatar: avatars[2], username: '@sahambagger', platform: 'Twitter', followers: 620_000, engagementRate: 4.8, aqsScore: 74, creatorScore: 'B+', category: 'Investasi', region: 'DKI Jakarta' },
];

export const campaignRows: CampaignRow[] = [
  { influencer: '@felicia_putri', posts: 3, reach: 9_800_000, sentimentPercent: 88, engagementRate: 7.8, roi: 4.5 },
  { influencer: '@ngomongin_uang', posts: 5, reach: 8_200_000, sentimentPercent: 91, engagementRate: 9.8, roi: 5.2 },
  { influencer: '@jouska_id', posts: 4, reach: 3_400_000, sentimentPercent: 82, engagementRate: 6.4, roi: 3.1 },
  { influencer: '@zap_finance', posts: 2, reach: 2_800_000, sentimentPercent: 86, engagementRate: 8.1, roi: 3.8 },
  { influencer: '@duitologi', posts: 6, reach: 5_600_000, sentimentPercent: 93, engagementRate: 10.2, roi: 5.8 },
];

// Based on BNI Wondr app reviews — Google Play: 4.2 stars, 1.09M reviews
export const marketplaceSentiment: MarketplaceSentiment = {
  product: 'Wondr by BNI (Mobile Banking)',
  rating: 4.2,
  totalReviews: 1_090_000,
  positive: 62,
  neutral: 18,
  negative: 20,
  topComplaints: [
    'Face detection gagal berulang kali saat registrasi',
    'OTP tidak terkirim di 50% kasus',
    'Device not compatible setelah update versi',
    'Antrian cabang berjam-jam, hanya 1 teller',
    'CS WhatsApp & chat lambat respons (3-4 jam)',
  ],
};

// ─── Reputation Data ─────────────────────────────────
// BNI: #2 Most Recommended Retail Bank (BankQuality Survey)
// ESG rating: "A" from MSCI (highest among ID banks)
// Stock: BBNI at Rp3,510 (7 Apr 2026), P/E 10, div yield 8.56%
export const reputationKPIs: ReputationKPI[] = [
  { label: 'Net Sentiment Score', abbr: 'NSS', value: 38.6, delta: -2.8, description: 'Selisih % sentimen positif dan negatif' },
  { label: 'Salience Index', abbr: 'SI', value: 68.4, delta: 1.2, description: 'Tingkat visibilitas brand dalam percakapan industri perbankan' },
  { label: 'Earned Media Sentiment', abbr: 'EMSS', value: 55.2, delta: 3.8, description: 'Sentimen media yang diperoleh organik (berita, blog, forum)' },
  { label: 'Share of Voice+', abbr: 'SOV+', value: 21.7, delta: -0.9, description: 'Persentase share of voice positif vs 4 bank besar' },
];

// Category Leaderboard: Indonesian Big 4 Banks + digital challengers
// Based on BankQuality Survey, TrustFinance 2025-2026 rankings
export const leaderboard: LeaderboardRow[] = [
  { rank: 1, brand: 'BCA', nss: 62.4, si: 92.1, emss: 78.5, mentions: 58_200 },
  { rank: 2, brand: 'Bank Mandiri', nss: 55.8, si: 88.6, emss: 71.3, mentions: 52_100 },
  { rank: 3, brand: 'BRI', nss: 48.2, si: 85.3, emss: 62.8, mentions: 47_800 },
  { rank: 4, brand: 'BNI', nss: 38.6, si: 68.4, emss: 55.2, mentions: 31_842, isOwn: true },
  { rank: 5, brand: 'BSI', nss: 44.1, si: 52.8, emss: 58.9, mentions: 22_400 },
  { rank: 6, brand: 'BTN', nss: 32.5, si: 41.6, emss: 38.4, mentions: 14_600 },
  { rank: 7, brand: 'CIMB Niaga', nss: 35.2, si: 38.9, emss: 42.1, mentions: 11_200 },
  { rank: 8, brand: 'Bank Jago', nss: 41.8, si: 45.2, emss: 52.6, mentions: 18_900 },
];

export const indexTrend: IndexTrendPoint[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(2026, 0, 8 + i);
  // Model a slight downward NSS trend (reflecting FY2025 profit decline news)
  // with a recovery in EMSS (positive ESG coverage)
  return {
    date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
    NSS: 42 - (i * 0.05) + Math.sin(i / 10) * 6 + Math.random() * 3,
    SI: 65 + Math.cos(i / 12) * 8 + Math.random() * 3,
    EMSS: 50 + (i * 0.06) + Math.sin(i / 8 + 1) * 5 + Math.random() * 4,
  };
});

// ─── Public Opinion Data ─────────────────────────────
// Banking access distribution mirrors BNI's 150K+ Agen46 network
// and branch concentration in Java
export const provinceData: ProvinceData[] = [
  { name: 'DKI Jakarta', sentiment: 0.52, mentions: 9840 },
  { name: 'Jawa Barat', sentiment: 0.38, mentions: 5420 },
  { name: 'Jawa Timur', sentiment: 0.31, mentions: 4180 },
  { name: 'Jawa Tengah', sentiment: 0.29, mentions: 3210 },
  { name: 'Banten', sentiment: 0.35, mentions: 2890 },
  { name: 'Bali', sentiment: 0.48, mentions: 1520 },
  { name: 'Sumatera Utara', sentiment: -0.08, mentions: 1680 },
  { name: 'Sulawesi Selatan', sentiment: -0.15, mentions: 940 },
  { name: 'Kalimantan Timur', sentiment: 0.22, mentions: 810 },
  { name: 'Sumatera Barat', sentiment: 0.12, mentions: 720 },
  { name: 'Yogyakarta', sentiment: 0.42, mentions: 1340 },
  { name: 'Riau', sentiment: 0.05, mentions: 630 },
  { name: 'Lampung', sentiment: 0.08, mentions: 480 },
  { name: 'Kalimantan Selatan', sentiment: -0.12, mentions: 410 },
  { name: 'Sumatera Selatan', sentiment: 0.02, mentions: 560 },
  { name: 'Nusa Tenggara Barat', sentiment: -0.18, mentions: 340 },
  { name: 'Nusa Tenggara Timur', sentiment: -0.28, mentions: 210 },
  { name: 'Papua', sentiment: -0.35, mentions: 120 },
  { name: 'Kalimantan Barat', sentiment: 0.10, mentions: 320 },
  { name: 'Sulawesi Utara', sentiment: 0.08, mentions: 280 },
  { name: 'Maluku', sentiment: -0.22, mentions: 150 },
  { name: 'Aceh', sentiment: -0.05, mentions: 390 },
  { name: 'Bengkulu', sentiment: 0.06, mentions: 170 },
  { name: 'Jambi', sentiment: 0.04, mentions: 230 },
  { name: 'Kepulauan Riau', sentiment: 0.18, mentions: 450 },
  { name: 'Bangka Belitung', sentiment: 0.10, mentions: 190 },
  { name: 'Gorontalo', sentiment: -0.14, mentions: 95 },
  { name: 'Sulawesi Tengah', sentiment: -0.08, mentions: 180 },
  { name: 'Sulawesi Tenggara', sentiment: 0.02, mentions: 140 },
  { name: 'Kalimantan Tengah', sentiment: -0.04, mentions: 210 },
  { name: 'Kalimantan Utara', sentiment: 0.06, mentions: 80 },
  { name: 'Maluku Utara', sentiment: -0.18, mentions: 65 },
  { name: 'Papua Barat', sentiment: -0.30, mentions: 55 },
  { name: 'Sulawesi Barat', sentiment: -0.10, mentions: 60 },
];

// ─── Policy Topic: Digitalisasi Perbankan BUMN 2026 ──
// Real policy context: OJK financial inclusion mandate, BUMN banking reform
export const stakeholders: Stakeholder[] = [
  { name: 'OJK (Otoritas Jasa Keuangan)', mentions: 520, positive: 42, neutral: 38, negative: 20, keyNarrative: 'Dorong digitalisasi perbankan dan perlindungan konsumen, target inklusi keuangan 90% di 2026' },
  { name: 'Kementerian BUMN', mentions: 438, positive: 55, neutral: 30, negative: 15, keyNarrative: 'Mendorong konsolidasi bank BUMN dan efisiensi operasional via transformasi digital' },
  { name: 'Bank Indonesia', mentions: 382, positive: 48, neutral: 40, negative: 12, keyNarrative: 'Ekspansi QRIS dan sistem pembayaran nasional, interoperabilitas lintas bank' },
  { name: 'DPR Komisi XI', mentions: 298, positive: 25, neutral: 35, negative: 40, keyNarrative: 'Pertanyakan penurunan laba BNI dan kualitas aset kredit korporasi BUMN' },
  { name: 'Himbara (Himpunan Bank BUMN)', mentions: 245, positive: 50, neutral: 38, negative: 12, keyNarrative: 'Koordinasi suku bunga deposito USD 4% dan program penyaluran kredit UMKM' },
  { name: 'Asosiasi Fintech Indonesia (AFTECH)', mentions: 189, positive: 58, neutral: 32, negative: 10, keyNarrative: 'Kolaborasi open banking API dan ekosistem pembayaran digital' },
];

export const issueTaxonomy: IssueTaxonomyNode[] = [
  {
    id: '1', label: 'Digitalisasi Perbankan BUMN 2026', sentiment: 'neutral', count: 12480,
    children: [
      {
        id: '1.1', label: 'Transformasi Mobile Banking', sentiment: 'positive', count: 4200,
        children: [
          { id: '1.1.1', label: 'Super App BNI Wondr — fitur all-in-one', sentiment: 'positive', count: 2100 },
          { id: '1.1.2', label: 'Keluhan device compatibility & face detection', sentiment: 'negative', count: 1200 },
          { id: '1.1.3', label: 'BRImo 33,5 juta pengguna — benchmark', sentiment: 'neutral', count: 900 },
        ]
      },
      {
        id: '1.2', label: 'Inklusi Keuangan & Agen Branchless', sentiment: 'positive', count: 3100,
        children: [
          { id: '1.2.1', label: 'BNI Agen46 — 150.000+ agen di seluruh Indonesia', sentiment: 'positive', count: 1800 },
          { id: '1.2.2', label: 'Target OJK inklusi keuangan 90%', sentiment: 'positive', count: 800 },
          { id: '1.2.3', label: 'Akses terbatas di Indonesia Timur', sentiment: 'negative', count: 500 },
        ]
      },
      {
        id: '1.3', label: 'Kualitas Kredit & Profitabilitas', sentiment: 'neutral', count: 2800,
        children: [
          { id: '1.3.1', label: 'Laba turun 7,15% YoY — tekanan NIM', sentiment: 'negative', count: 1400 },
          { id: '1.3.2', label: 'Kredit tumbuh 15,94% — tertinggi di Big 4', sentiment: 'positive', count: 900 },
          { id: '1.3.3', label: 'NPL gross 1,9% — terjaga stabil', sentiment: 'positive', count: 500 },
        ]
      },
      {
        id: '1.4', label: 'ESG & Green Banking', sentiment: 'positive', count: 2380,
        children: [
          { id: '1.4.1', label: 'Rating ESG "A" MSCI — tertinggi bank Indonesia', sentiment: 'positive', count: 1200 },
          { id: '1.4.2', label: 'Green financing portfolio Rp170+ triliun', sentiment: 'positive', count: 800 },
          { id: '1.4.3', label: 'Sertifikasi green building kantor BNI', sentiment: 'positive', count: 380 },
        ]
      },
    ]
  },
];

// ─── Nav Items ───────────────────────────────────────
export const navItems = [
  { label: 'Home', path: '/', icon: 'Home' },
  { label: 'Feed', path: '/feed', icon: 'Rss' },
  { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  { label: 'Alerts', path: '/alerts', icon: 'Bell' },
  { label: 'Influencers', path: '/influencers', icon: 'Users' },
  { label: 'Reputation', path: '/reputation', icon: 'Shield' },
  { label: 'Public Opinion', path: '/public-opinion', icon: 'Globe' },
  { label: 'Reports', path: '/reports', icon: 'FileText' },
];

// ─── Report Scheduler ────────────────────────────────
export const reportSchedules = [
  { id: '1', name: 'Weekly Social Listening Summary', frequency: 'Mingguan', nextRun: '14 Apr 2026', recipients: ['digital@bni.co.id'], format: 'PDF' },
  { id: '2', name: 'Daily Crisis & Reputation Alert', frequency: 'Harian', nextRun: '09 Apr 2026', recipients: ['corcomm@bni.co.id', 'dirut@bni.co.id'], format: 'Email' },
  { id: '3', name: 'Monthly Board Reputation Report', frequency: 'Bulanan', nextRun: '01 May 2026', recipients: ['bod@bni.co.id', 'investor.relations@bni.co.id'], format: 'PDF + PPTX' },
];
