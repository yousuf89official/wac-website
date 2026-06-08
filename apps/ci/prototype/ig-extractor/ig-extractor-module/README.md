# IG Post ID Extractor — Module

Drop-in Instagram Post ID extraction for your Node.js + Next.js + Supabase dashboard.

---

## 📁 Folder Structure

```
ig-extractor-module/
├── api/
│   └── ig-extract.js          # Express routes (POST extract, GET history, DELETE)
├── components/
│   ├── IgExtractor.jsx         # React component
│   └── IgExtractor.module.css  # Scoped CSS module
├── lib/
│   └── instagram.js            # Core parsing logic (zero dependencies)
├── sql/
│   └── 001_create_ig_extractions.sql  # Supabase migration
└── README.md
```

---

## Integration Steps

### Step 1: Copy the module into your project

Copy the `ig-extractor-module/` folder into your project root (or wherever you keep shared modules):

```
your-project/
├── ig-extractor-module/    ← paste here
├── pages/
├── components/
├── lib/
├── ...
```

### Step 2: Run the database migration

Open your **Supabase Dashboard → SQL Editor** and paste the contents of:

```
ig-extractor-module/sql/001_create_ig_extractions.sql
```

Click **Run**. This creates the `ig_extractions` table with indexes.

> **Row Level Security (RLS):** The migration includes commented-out RLS policies.
> Uncomment them if you use Supabase Auth and want users to only see their own extractions.

### Step 3: Register the API routes

In your Express server file (e.g., `server.js` or `app.js`), add:

```js
const igExtractRouter = require('./ig-extractor-module/api/ig-extract');

// Make Supabase available to the routes
app.locals.supabase = supabase; // your initialized Supabase client

// Mount the routes
app.use('/api', igExtractRouter);
```

This gives you three endpoints:
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ig-extract` | Extract & save. Body: `{ "url": "..." }` |
| `GET` | `/api/ig-extract/history` | List extractions. Query: `?limit=20&offset=0&post_type=reel&search=abc` |
| `DELETE` | `/api/ig-extract/:id` | Delete one record |

### Step 4: Add the React component

In any page or dashboard panel:

```jsx
import IgExtractor from '../ig-extractor-module/components/IgExtractor';

export default function ToolsPage() {
  return (
    <div>
      <h1>Marketing Tools</h1>
      <IgExtractor apiBase="/api" showHistory={true} />
    </div>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiBase` | `string` | `'/api'` | Base URL for API routes |
| `showHistory` | `boolean` | `true` | Show/hide the extraction history table |

### Step 5 (Optional): Match your dashboard theme

The CSS module uses CSS custom properties with fallbacks. If your dashboard already defines these variables, the component will inherit them automatically:

```css
--font-body       /* Body font family */
--font-mono       /* Monospace font family */
--color-text      /* Primary text color */
--color-text-muted /* Secondary text color */
--color-text-faint /* Tertiary text color */
--color-surface   /* Card/input background */
--color-border    /* Border color */
--color-divider   /* Subtle dividers */
--color-primary   /* Accent color */
```

If you don't define these, sensible defaults are used (light theme, system fonts).

---

## API Reference

### `POST /api/ig-extract`

**Request:**
```json
{ "url": "https://www.instagram.com/reel/DAhK2L_ySzJ/?igsh=abc" }
```

**Response:**
```json
{
  "success": true,
  "saved": true,
  "data": {
    "id": "uuid-here",
    "shortcode": "DAhK2L_ySzJ",
    "media_id": "3456789012345678901",
    "post_type": "reel",
    "original_url": "https://www.instagram.com/reel/DAhK2L_ySzJ/",
    "raw_input": "https://www.instagram.com/reel/DAhK2L_ySzJ/?igsh=abc",
    "created_at": "2026-03-09T12:00:00.000Z"
  }
}
```

### Using the library directly (without API)

```js
const { parseInstagramUrl, shortcodeToMediaId, isInstagramUrl } = require('./ig-extractor-module/lib/instagram');

// Full parse
const result = parseInstagramUrl('https://www.instagram.com/p/C8W9X7ys1aR/');
// => { shortcode: 'C8W9X7ys1aR', mediaId: '3139578221879824577', postType: 'post', postTypeLabel: 'Post', originalUrl: 'https://www.instagram.com/p/C8W9X7ys1aR/' }

// Just decode a shortcode
const id = shortcodeToMediaId('C8W9X7ys1aR');
// => '3139578221879824577'

// Validate
isInstagramUrl('https://instagram.com/reel/ABC123/');
// => true
```

---

## Supported URL Formats

| Format | Example |
|--------|---------|
| Post | `https://www.instagram.com/p/C8W9X7ys1aR/` |
| Reel | `https://www.instagram.com/reel/DAhK2L_ySzJ/` |
| IGTV | `https://www.instagram.com/tv/CWtB3xYJhFm/` |
| Story | `https://www.instagram.com/stories/username/1234567890/` |
| Short URL | `https://instagr.am/p/C8W9X7ys1aR/` |
| With params | `https://www.instagram.com/p/C8W9X7ys1aR/?igsh=abc&utm_source=ig` |

---

## Supabase Table Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key (auto-generated) |
| `shortcode` | `text` | Extracted shortcode |
| `media_id` | `text` | Decoded numeric media ID |
| `post_type` | `text` | `post`, `reel`, `tv`, or `story` |
| `original_url` | `text` | Normalized clean URL |
| `raw_input` | `text` | Original user input |
| `user_id` | `uuid` | FK to `auth.users` (nullable) |
| `created_at` | `timestamptz` | Auto-set timestamp |
