/**
 * Express Route: POST /api/tt-extract
 * ------------------------------------
 * Parses a TikTok URL, extracts the video ID & username, and saves to Supabase.
 *
 * Request body:  { url: string }
 * Response:      { success: true, data: { ...extraction } }
 *            or  { success: false, error: string }
 *
 * Integration:
 *   const ttExtractRouter = require('./tiktok-extractor-module/api/tt-extract');
 *   app.use('/api', ttExtractRouter);
 */

const express = require('express');
const { parseTikTokUrl } = require('../lib/tiktok');

const router = express.Router();

/**
 * Middleware: get Supabase client from app.locals or req context.
 * Adjust this to match how your app initializes Supabase.
 */
function getSupabase(req) {
  if (req.app.locals.supabase) return req.app.locals.supabase;
  if (req.supabase) return req.supabase;
  return null;
}

// -------------------------------------------------------------------
// POST /api/tt-extract — Parse URL + save to database
// -------------------------------------------------------------------
router.post('/tt-extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "url" in request body.',
      });
    }

    const result = parseTikTokUrl(url);

    if (!result) {
      return res.status(422).json({
        success: false,
        error: 'Invalid TikTok URL. Supported: @user/video/, @user/photo/, vm.tiktok.com/, embed/, and more.',
      });
    }

    // Build extraction record
    const record = {
      video_id:     result.videoId || null,
      short_code:   result.shortCode || null,
      username:     result.username || null,
      post_type:    result.postType,
      original_url: result.originalUrl,
      raw_input:    url.trim(),
      is_short_url: result.isShortUrl,
    };

    // Attach user_id if authenticated
    if (req.user?.id) {
      record.user_id = req.user.id;
    }

    // Save to Supabase
    const supabase = getSupabase(req);
    let savedRecord = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('tt_extractions')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('[tt-extract] Supabase insert error:', error.message);
        return res.json({
          success: true,
          data: { ...result, raw_input: url.trim() },
          saved: false,
          saveError: error.message,
        });
      }

      savedRecord = data;
    }

    return res.json({
      success: true,
      data: savedRecord || { ...result, raw_input: url.trim() },
      saved: !!supabase,
    });
  } catch (err) {
    console.error('[tt-extract] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
});

// -------------------------------------------------------------------
// GET /api/tt-extract/history — Fetch extraction history
// -------------------------------------------------------------------
router.get('/tt-extract/history', async (req, res) => {
  try {
    const supabase = getSupabase(req);

    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not available.',
      });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = parseInt(req.query.offset, 10) || 0;

    let query = supabase
      .from('tt_extractions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if authenticated
    if (req.user?.id) {
      query = query.eq('user_id', req.user.id);
    }

    // Filter by post_type
    if (req.query.post_type) {
      query = query.eq('post_type', req.query.post_type);
    }

    // Search by video_id or username
    if (req.query.search) {
      query = query.or(
        `video_id.ilike.%${req.query.search}%,username.ilike.%${req.query.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[tt-extract] Supabase query error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count,
      },
    });
  } catch (err) {
    console.error('[tt-extract] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
});

// -------------------------------------------------------------------
// DELETE /api/tt-extract/:id — Delete a single extraction record
// -------------------------------------------------------------------
router.delete('/tt-extract/:id', async (req, res) => {
  try {
    const supabase = getSupabase(req);

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not available.' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('tt_extractions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[tt-extract] Supabase delete error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[tt-extract] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;
