/**
 * Express Route: POST /api/ig-extract
 * ------------------------------------
 * Parses an Instagram URL, decodes the media ID, and saves to Supabase.
 *
 * Request body:  { url: string }
 * Response:      { success: true, data: { ...extraction } }
 *            or  { success: false, error: string }
 *
 * Integration:
 *   const igExtractRouter = require('./ig-extractor-module/api/ig-extract');
 *   app.use('/api', igExtractRouter);
 */

const express = require('express');
const { parseInstagramUrl } = require('../lib/instagram');

const router = express.Router();

/**
 * Middleware: get Supabase client from app.locals or req context.
 * Adjust this to match how your app initializes Supabase.
 */
function getSupabase(req) {
  // Option 1: If you attach supabase to app.locals (common pattern)
  if (req.app.locals.supabase) return req.app.locals.supabase;

  // Option 2: If you attach it to req (e.g., via middleware)
  if (req.supabase) return req.supabase;

  // Option 3: Direct import — uncomment and adjust path
  // const { supabase } = require('../../lib/supabaseClient');
  // return supabase;

  return null;
}

// -------------------------------------------------------------------
// POST /api/ig-extract — Parse URL + save to database
// -------------------------------------------------------------------
router.post('/ig-extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "url" in request body.',
      });
    }

    const result = parseInstagramUrl(url);

    if (!result) {
      return res.status(422).json({
        success: false,
        error: 'Invalid Instagram URL. Supported formats: /p/, /reel/, /tv/, /stories/.',
      });
    }

    // Build extraction record
    const record = {
      shortcode:    result.shortcode,
      media_id:     result.mediaId,
      post_type:    result.postType,
      original_url: result.originalUrl,
      raw_input:    url.trim(),
    };

    // Attach user_id if authenticated (optional — depends on your auth setup)
    if (req.user?.id) {
      record.user_id = req.user.id;
    }

    // Save to Supabase
    const supabase = getSupabase(req);
    let savedRecord = null;

    if (supabase) {
      const { data, error } = await supabase
        .from('ig_extractions')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('[ig-extract] Supabase insert error:', error.message);
        // Still return the extraction — just flag that saving failed
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
    console.error('[ig-extract] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
});

// -------------------------------------------------------------------
// GET /api/ig-extract/history — Fetch extraction history
// -------------------------------------------------------------------
router.get('/ig-extract/history', async (req, res) => {
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
      .from('ig_extractions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if authenticated
    if (req.user?.id) {
      query = query.eq('user_id', req.user.id);
    }

    // Filter by post_type if provided
    if (req.query.post_type) {
      query = query.eq('post_type', req.query.post_type);
    }

    // Search by shortcode if provided
    if (req.query.search) {
      query = query.or(
        `shortcode.ilike.%${req.query.search}%,media_id.ilike.%${req.query.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[ig-extract] Supabase query error:', error.message);
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
    console.error('[ig-extract] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
});

// -------------------------------------------------------------------
// DELETE /api/ig-extract/:id — Delete a single extraction record
// -------------------------------------------------------------------
router.delete('/ig-extract/:id', async (req, res) => {
  try {
    const supabase = getSupabase(req);

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not available.' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('ig_extractions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[ig-extract] Supabase delete error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[ig-extract] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;
