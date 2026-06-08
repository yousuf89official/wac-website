# TikTok Post ID Extractor — Module

Drop-in TikTok Video ID extraction for your Node.js + Next.js + Supabase dashboard.
Mirrors the same architecture as the IG Post ID Extractor for consistency.

---

## Folder Structure

```
tiktok-extractor-module/
├── api/
│   └── tt-extract.js              # Express routes (POST extract, GET history, DELETE)
├── components/
│   ├── TtExtractor.jsx            # React component
│   └── TtExtractor.module.css     # Scoped CSS module
├── lib/
│   └── tiktok.js                  # Core parsing logic (zero dependencies)
├── sql/
│   └── 001_create_tt_extractions.sql  # Supabase migration
└── README.md
```

---

## Integration Steps

### Step 1: Copy the module into your project

```
your-project/
├── ig-extractor-module/       ← already integrated
├── tiktok-extractor-module/   ← paste here
├── pages/
├── components/
├── ...
```

### Step 2: Run the database migration

Open **Supabase Dashboard → SQL Editor** and paste the contents of:

```
tiktok-extractor-module/sql/001_create_tt_extractions.sql
```

Click **Run**. This creates the `tt_extractions` table with indexes.

### Step 3: Register the API routes

In your Express server file, add alongside your IG routes:

```js
const igExtractRouter = require('./ig-extractor-module/api/ig-extract');
const ttExtractRouter = require('./tiktok-extractor-module/api/tt-extract');

app.locals.supabase = supabase;

app.use('/api', igExtractRouter);
app.use('/api', ttExtractRouter);   // ← add this line
```

This gives you three endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tt-extract` | Extract & save. Body: `{ "url": "..." }` |
| `GET` | `/api/tt-extract/history` | List extractions. Query: `?limit=20&offset=0&post_type=video&search=username` |
| `DELETE` | `/api/tt-extract/:id` | Delete one record |

### Step 4: Add the React component

```jsx
import IgExtractor from '../ig-extractor-module/components/IgExtractor';
import TtExtractor from '../tiktok-extractor-module/components/TtExtractor';

export default function ToolsPage() {
  return (
    <div>
      <h1>Marketing Tools</h1>

      {/* Instagram Extractor */}
      <IgExtractor apiBase="/api" showHistory={true} />

      {/* TikTok Extractor */}
      <TtExtractor apiBase="/api" showHistory={true} />
    </div>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiBase` | `string` | `'/api'` | Base URL for API routes |
| `showHistory` | `boolean` | `true` | Show/hide the extraction history table |

### Step 5 (Optional): Theme integration

Same CSS custom properties as the IG module. If your dashboard defines them, both components inherit automatically.

---

## API Reference

### `POST /api/tt-extract`

**Request:**
```json
{ "url": "https://www.tiktok.com/@charlidamelio/video/7067695578729221378?is_copy_url=1" }
```

**Response:**
```json
{
  "success": true,
  "saved": true,
  "data": {
    "id": "uuid-here",
    "video_id": "7067695578729221378",
    "short_code": null,
    "username": "charlidamelio",
    "post_type": "video",
    "original_url": "https://www.tiktok.com/@charlidamelio/video/7067695578729221378",
    "raw_input": "https://www.tiktok.com/@charlidamelio/video/7067695578729221378?is_copy_url=1",
    "is_short_url": false,
    "created_at": "2026-03-09T12:00:00.000Z"
  }
}
```

### Using the library directly

```js
const { parseTikTokUrl, isTikTokUrl } = require('./tiktok-extractor-module/lib/tiktok');

// Full parse
const result = parseTikTokUrl('https://www.tiktok.com/@user/video/7067695578729221378');
// => { videoId: '7067695578729221378', username: 'user', postType: 'video', ... }

// Short URL (can't resolve video ID client-side)
const short = parseTikTokUrl('https://vm.tiktok.com/ZMF6rgvXY/');
// => { videoId: null, shortCode: 'ZMF6rgvXY', isShortUrl: true, ... }

// Validate
isTikTokUrl('https://www.tiktok.com/@user/video/123');
// => true
```

---

## Supported URL Formats

| Format | Example | Video ID |
|--------|---------|----------|
| Standard video | `tiktok.com/@user/video/1234567890` | Extracted directly |
| Photo/slideshow | `tiktok.com/@user/photo/1234567890` | Extracted directly |
| Mobile | `m.tiktok.com/v/1234567890.html` | Extracted directly |
| Embed | `tiktok.com/embed/1234567890` | Extracted directly |
| item_id param | `tiktok.com/...?item_id=1234567890` | Extracted from param |
| Trending | `tiktok.com/trending?shareId=1234567890` | Extracted from param |
| Short (vm.) | `vm.tiktok.com/ZMF6rgvXY/` | Short code only* |
| Short (/t/) | `tiktok.com/t/ZMF6rgvXY/` | Short code only* |
| With params | `...?is_copy_url=1&is_from_webapp=v1` | Params stripped |

\* Short URLs require a server-side HTTP redirect follow to resolve the full video ID. The component flags these with a warning message.

---

## Supabase Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key (auto-generated) |
| `video_id` | `text` | Numeric video ID (null for short URLs) |
| `short_code` | `text` | Short URL code (null for full URLs) |
| `username` | `text` | @username if available |
| `post_type` | `text` | `video`, `photo`, `embed`, `share`, `short`, `trending` |
| `original_url` | `text` | Normalized clean URL |
| `raw_input` | `text` | Original user input |
| `is_short_url` | `boolean` | True if input was a shortened URL |
| `user_id` | `uuid` | FK to `auth.users` (nullable) |
| `created_at` | `timestamptz` | Auto-set timestamp |

---

## Key Difference from IG Module

TikTok video IDs are already numeric in the URL — no decoding is needed (unlike Instagram shortcodes which require base64 conversion). The main challenge is the variety of URL formats TikTok uses, which this parser handles comprehensively.
