const IG_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const PATTERNS: Record<string, RegExp> = {
  post:  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/p\/([A-Za-z0-9_-]+)\/?/,
  reel:  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/reel\/([A-Za-z0-9_-]+)\/?/,
  tv:    /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/tv\/([A-Za-z0-9_-]+)\/?/,
  story: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/stories\/([A-Za-z0-9._-]+)\/(\d+)\/?/,
};

export const POST_TYPE_LABELS: Record<string, string> = {
  post:  'Post',
  reel:  'Reel',
  tv:    'IGTV',
  story: 'Story',
};

export interface IgParseResult {
  shortcode: string;
  mediaId: string | null;
  postType: string;
  postTypeLabel: string;
  originalUrl: string;
}

export function shortcodeToMediaId(shortcode: string): string | null {
  let id = BigInt(0);
  for (let i = 0; i < shortcode.length; i++) {
    const charIndex = IG_ALPHABET.indexOf(shortcode[i]);
    if (charIndex === -1) return null;
    id = id * BigInt(64) + BigInt(charIndex);
  }
  return id.toString();
}

function buildCleanUrl(type: string, shortcode: string | null, username: string | null, storyId: string | null): string {
  const base = 'https://www.instagram.com';
  if (type === 'story') return `${base}/stories/${username}/${storyId}/`;
  if (type === 'reel')  return `${base}/reel/${shortcode}/`;
  if (type === 'tv')    return `${base}/tv/${shortcode}/`;
  return `${base}/p/${shortcode}/`;
}

export function parseInstagramUrl(url: string): IgParseResult | null {
  if (!url || typeof url !== 'string') return null;

  const cleanUrl = url.trim().split('?')[0].split('#')[0];

  for (const [type, pattern] of Object.entries(PATTERNS)) {
    const match = cleanUrl.match(pattern);
    if (!match) continue;

    if (type === 'story') {
      return {
        shortcode:     match[2],
        mediaId:       match[2],
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

export function isInstagramUrl(url: string): boolean {
  return parseInstagramUrl(url) !== null;
}
