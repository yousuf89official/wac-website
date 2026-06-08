/**
 * Instagram URL Parser & Media ID Decoder
 * ----------------------------------------
 * Pure utility — no dependencies. Works in both Node.js and browser.
 *
 * Usage:
 *   const { parseInstagramUrl } = require('./instagram');
 *   // or: import { parseInstagramUrl } from './instagram';
 *
 *   const result = parseInstagramUrl('https://www.instagram.com/p/C8W9X7ys1aR/');
 *   // => { shortcode, mediaId, postType, originalUrl }
 */

const IG_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const PATTERNS = {
  post:  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/p\/([A-Za-z0-9_-]+)\/?/,
  reel:  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/reel\/([A-Za-z0-9_-]+)\/?/,
  tv:    /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/tv\/([A-Za-z0-9_-]+)\/?/,
  story: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/stories\/([A-Za-z0-9._-]+)\/(\d+)\/?/,
};

const POST_TYPE_LABELS = {
  post:  'Post',
  reel:  'Reel',
  tv:    'IGTV',
  story: 'Story',
};

/**
 * Decode an Instagram shortcode to its numeric media ID.
 * Uses BigInt for precision (media IDs exceed Number.MAX_SAFE_INTEGER).
 *
 * @param {string} shortcode
 * @returns {string|null} Decimal media ID string, or null if invalid
 */
function shortcodeToMediaId(shortcode) {
  let id = BigInt(0);
  for (let i = 0; i < shortcode.length; i++) {
    const charIndex = IG_ALPHABET.indexOf(shortcode[i]);
    if (charIndex === -1) return null;
    id = id * BigInt(64) + BigInt(charIndex);
  }
  return id.toString();
}

/**
 * Build a normalized, clean Instagram URL.
 */
function buildCleanUrl(type, shortcode, username, storyId) {
  const base = 'https://www.instagram.com';
  if (type === 'story') return `${base}/stories/${username}/${storyId}/`;
  if (type === 'reel')  return `${base}/reel/${shortcode}/`;
  if (type === 'tv')    return `${base}/tv/${shortcode}/`;
  return `${base}/p/${shortcode}/`;
}

/**
 * Parse an Instagram URL and extract post metadata.
 *
 * @param {string} url — Any Instagram post/reel/tv/story URL
 * @returns {{ shortcode: string, mediaId: string, postType: string, postTypeLabel: string, originalUrl: string } | null}
 */
function parseInstagramUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const cleanUrl = url.trim().split('?')[0].split('#')[0];

  for (const [type, pattern] of Object.entries(PATTERNS)) {
    const match = cleanUrl.match(pattern);
    if (!match) continue;

    if (type === 'story') {
      return {
        shortcode:     match[2],
        mediaId:       match[2], // Story IDs are already numeric
        postType:      type,
        postTypeLabel: POST_TYPE_LABELS[type],
        originalUrl:   buildCleanUrl(type, null, match[1], match[2]),
      };
    }

    const shortcode = match[1];
    const mediaId = shortcodeToMediaId(shortcode);

    return {
      shortcode,
      mediaId:       mediaId || null,
      postType:      type,
      postTypeLabel: POST_TYPE_LABELS[type],
      originalUrl:   buildCleanUrl(type, shortcode, null, null),
    };
  }

  return null;
}

/**
 * Validate whether a string looks like an Instagram URL.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isInstagramUrl(url) {
  return parseInstagramUrl(url) !== null;
}

module.exports = {
  parseInstagramUrl,
  shortcodeToMediaId,
  isInstagramUrl,
  POST_TYPE_LABELS,
};
