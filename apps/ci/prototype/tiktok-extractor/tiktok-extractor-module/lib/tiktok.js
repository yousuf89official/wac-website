/**
 * TikTok URL Parser & Video ID Extractor
 * ----------------------------------------
 * Pure utility — no dependencies. Works in both Node.js and browser.
 *
 * Usage:
 *   const { parseTikTokUrl } = require('./tiktok');
 *   // or: import { parseTikTokUrl } from './tiktok';
 *
 *   const result = parseTikTokUrl('https://www.tiktok.com/@username/video/7067695578729221378');
 *   // => { videoId, username, postType, originalUrl, isShortUrl }
 */

// All known TikTok URL patterns
const PATTERNS = {
  // Standard video: tiktok.com/@user/video/1234567890
  standardVideo: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)\/video\/(\d+)\/?/,

  // Photo/slideshow: tiktok.com/@user/photo/1234567890
  standardPhoto: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)\/photo\/(\d+)\/?/,

  // Mobile: m.tiktok.com/v/1234567890.html
  mobileVideo: /(?:https?:\/\/)?m\.tiktok\.com\/v\/(\d+)(?:\.html)?\/?/,

  // Embed: tiktok.com/embed/1234567890
  embed: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/embed\/(\d+)\/?/,

  // Short URL: vm.tiktok.com/XXXXX/ (cannot resolve — flag for user)
  shortVm: /(?:https?:\/\/)?vm\.tiktok\.com\/([A-Za-z0-9_-]+)\/?/,

  // Short URL alternate: tiktok.com/t/XXXXX/
  shortT: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/t\/([A-Za-z0-9_-]+)\/?/,

  // Share user: tiktok.com/share/user/1234567890
  shareUser: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/share\/user\/(\d+)\/?/,

  // Trending shareId: tiktok.com/trending?shareId=1234567890
  trending: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/trending\?.*shareId=(\d+)/,

  // item_id param: ...&item_id=1234567890
  itemIdParam: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/.*[?&]item_id=(\d+)/,
};

const POST_TYPE_LABELS = {
  video:   'Video',
  photo:   'Photo',
  embed:   'Embed',
  share:   'Share',
  short:   'Short URL',
  trending: 'Trending',
};

/**
 * Build a normalized, clean TikTok URL.
 */
function buildCleanUrl(type, videoId, username) {
  const base = 'https://www.tiktok.com';
  if (username && (type === 'video' || type === 'photo')) {
    return `${base}/@${username}/${type}/${videoId}`;
  }
  if (type === 'embed') return `${base}/embed/${videoId}`;
  // For short URLs, return as-is (we can't resolve them client-side)
  return `${base}/@_/video/${videoId}`;
}

/**
 * Parse a TikTok URL and extract post metadata.
 *
 * @param {string} url — Any TikTok video/photo/share URL
 * @returns {{ videoId: string, username: string|null, postType: string, postTypeLabel: string, originalUrl: string, isShortUrl: boolean } | null}
 */
function parseTikTokUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  // Strip query params and hash for pattern matching (but keep for some patterns)
  const cleanUrl = trimmed.split('#')[0];

  // --- Standard video ---
  let match = cleanUrl.match(PATTERNS.standardVideo);
  if (match) {
    return {
      videoId:       match[2],
      username:      match[1],
      postType:      'video',
      postTypeLabel: POST_TYPE_LABELS.video,
      originalUrl:   buildCleanUrl('video', match[2], match[1]),
      isShortUrl:    false,
    };
  }

  // --- Standard photo/slideshow ---
  match = cleanUrl.match(PATTERNS.standardPhoto);
  if (match) {
    return {
      videoId:       match[2],
      username:      match[1],
      postType:      'photo',
      postTypeLabel: POST_TYPE_LABELS.photo,
      originalUrl:   buildCleanUrl('photo', match[2], match[1]),
      isShortUrl:    false,
    };
  }

  // --- Mobile video ---
  match = cleanUrl.match(PATTERNS.mobileVideo);
  if (match) {
    return {
      videoId:       match[1],
      username:      null,
      postType:      'video',
      postTypeLabel: POST_TYPE_LABELS.video,
      originalUrl:   buildCleanUrl('video', match[1], null),
      isShortUrl:    false,
    };
  }

  // --- Embed ---
  match = cleanUrl.match(PATTERNS.embed);
  if (match) {
    return {
      videoId:       match[1],
      username:      null,
      postType:      'embed',
      postTypeLabel: POST_TYPE_LABELS.embed,
      originalUrl:   buildCleanUrl('embed', match[1], null),
      isShortUrl:    false,
    };
  }

  // --- item_id param (check before short URLs since it has a numeric ID) ---
  match = cleanUrl.match(PATTERNS.itemIdParam);
  if (match) {
    // Also try to get username from the URL
    const userMatch = cleanUrl.match(/@([A-Za-z0-9_.]+)/);
    return {
      videoId:       match[1],
      username:      userMatch ? userMatch[1] : null,
      postType:      'video',
      postTypeLabel: POST_TYPE_LABELS.video,
      originalUrl:   buildCleanUrl('video', match[1], userMatch ? userMatch[1] : null),
      isShortUrl:    false,
    };
  }

  // --- Trending shareId ---
  match = cleanUrl.match(PATTERNS.trending);
  if (match) {
    return {
      videoId:       match[1],
      username:      null,
      postType:      'trending',
      postTypeLabel: POST_TYPE_LABELS.trending,
      originalUrl:   `https://www.tiktok.com/trending?shareId=${match[1]}`,
      isShortUrl:    false,
    };
  }

  // --- Share user ---
  match = cleanUrl.match(PATTERNS.shareUser);
  if (match) {
    return {
      videoId:       match[1],
      username:      null,
      postType:      'share',
      postTypeLabel: POST_TYPE_LABELS.share,
      originalUrl:   `https://www.tiktok.com/share/user/${match[1]}`,
      isShortUrl:    false,
    };
  }

  // --- Short URL: vm.tiktok.com ---
  match = cleanUrl.match(PATTERNS.shortVm);
  if (match) {
    return {
      videoId:       null,
      shortCode:     match[1],
      username:      null,
      postType:      'short',
      postTypeLabel: POST_TYPE_LABELS.short,
      originalUrl:   `https://vm.tiktok.com/${match[1]}/`,
      isShortUrl:    true,
    };
  }

  // --- Short URL: tiktok.com/t/ ---
  match = cleanUrl.match(PATTERNS.shortT);
  if (match) {
    return {
      videoId:       null,
      shortCode:     match[1],
      username:      null,
      postType:      'short',
      postTypeLabel: POST_TYPE_LABELS.short,
      originalUrl:   `https://www.tiktok.com/t/${match[1]}/`,
      isShortUrl:    true,
    };
  }

  return null;
}

/**
 * Validate whether a string looks like a TikTok URL.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isTikTokUrl(url) {
  return parseTikTokUrl(url) !== null;
}

module.exports = {
  parseTikTokUrl,
  isTikTokUrl,
  POST_TYPE_LABELS,
};
