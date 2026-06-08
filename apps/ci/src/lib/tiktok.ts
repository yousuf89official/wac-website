const PATTERNS = {
  standardVideo: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)\/video\/(\d+)\/?/,
  standardPhoto: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)\/photo\/(\d+)\/?/,
  mobileVideo:   /(?:https?:\/\/)?m\.tiktok\.com\/v\/(\d+)(?:\.html)?\/?/,
  embed:         /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/embed\/(\d+)\/?/,
  shortVm:       /(?:https?:\/\/)?vm\.tiktok\.com\/([A-Za-z0-9_-]+)\/?/,
  shortT:        /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/t\/([A-Za-z0-9_-]+)\/?/,
  shareUser:     /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/share\/user\/(\d+)\/?/,
  trending:      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/trending\?.*shareId=(\d+)/,
  itemIdParam:   /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/.*[?&]item_id=(\d+)/,
};

export const POST_TYPE_LABELS: Record<string, string> = {
  video:    'Video',
  photo:    'Photo',
  embed:    'Embed',
  share:    'Share',
  short:    'Short URL',
  trending: 'Trending',
};

export interface TtParseResult {
  videoId: string | null;
  shortCode?: string;
  username: string | null;
  postType: string;
  postTypeLabel: string;
  originalUrl: string;
  isShortUrl: boolean;
}

function buildCleanUrl(type: string, videoId: string | null, username: string | null): string {
  const base = 'https://www.tiktok.com';
  if (username && (type === 'video' || type === 'photo')) {
    return `${base}/@${username}/${type}/${videoId}`;
  }
  if (type === 'embed') return `${base}/embed/${videoId}`;
  return `${base}/@_/video/${videoId}`;
}

export function parseTikTokUrl(url: string): TtParseResult | null {
  if (!url || typeof url !== 'string') return null;

  const cleanUrl = url.trim().split('#')[0];

  let match = cleanUrl.match(PATTERNS.standardVideo);
  if (match) {
    return {
      videoId: match[2], username: match[1], postType: 'video',
      postTypeLabel: POST_TYPE_LABELS.video,
      originalUrl: buildCleanUrl('video', match[2], match[1]), isShortUrl: false,
    };
  }

  match = cleanUrl.match(PATTERNS.standardPhoto);
  if (match) {
    return {
      videoId: match[2], username: match[1], postType: 'photo',
      postTypeLabel: POST_TYPE_LABELS.photo,
      originalUrl: buildCleanUrl('photo', match[2], match[1]), isShortUrl: false,
    };
  }

  match = cleanUrl.match(PATTERNS.mobileVideo);
  if (match) {
    return {
      videoId: match[1], username: null, postType: 'video',
      postTypeLabel: POST_TYPE_LABELS.video,
      originalUrl: buildCleanUrl('video', match[1], null), isShortUrl: false,
    };
  }

  match = cleanUrl.match(PATTERNS.embed);
  if (match) {
    return {
      videoId: match[1], username: null, postType: 'embed',
      postTypeLabel: POST_TYPE_LABELS.embed,
      originalUrl: buildCleanUrl('embed', match[1], null), isShortUrl: false,
    };
  }

  match = cleanUrl.match(PATTERNS.itemIdParam);
  if (match) {
    const userMatch = cleanUrl.match(/@([A-Za-z0-9_.]+)/);
    return {
      videoId: match[1], username: userMatch ? userMatch[1] : null, postType: 'video',
      postTypeLabel: POST_TYPE_LABELS.video,
      originalUrl: buildCleanUrl('video', match[1], userMatch ? userMatch[1] : null), isShortUrl: false,
    };
  }

  match = cleanUrl.match(PATTERNS.trending);
  if (match) {
    return {
      videoId: match[1], username: null, postType: 'trending',
      postTypeLabel: POST_TYPE_LABELS.trending,
      originalUrl: `https://www.tiktok.com/trending?shareId=${match[1]}`, isShortUrl: false,
    };
  }

  match = cleanUrl.match(PATTERNS.shareUser);
  if (match) {
    return {
      videoId: match[1], username: null, postType: 'share',
      postTypeLabel: POST_TYPE_LABELS.share,
      originalUrl: `https://www.tiktok.com/share/user/${match[1]}`, isShortUrl: false,
    };
  }

  match = cleanUrl.match(PATTERNS.shortVm);
  if (match) {
    return {
      videoId: null, shortCode: match[1], username: null, postType: 'short',
      postTypeLabel: POST_TYPE_LABELS.short,
      originalUrl: `https://vm.tiktok.com/${match[1]}/`, isShortUrl: true,
    };
  }

  match = cleanUrl.match(PATTERNS.shortT);
  if (match) {
    return {
      videoId: null, shortCode: match[1], username: null, postType: 'short',
      postTypeLabel: POST_TYPE_LABELS.short,
      originalUrl: `https://www.tiktok.com/t/${match[1]}/`, isShortUrl: true,
    };
  }

  return null;
}

export function isTikTokUrl(url: string): boolean {
  return parseTikTokUrl(url) !== null;
}
