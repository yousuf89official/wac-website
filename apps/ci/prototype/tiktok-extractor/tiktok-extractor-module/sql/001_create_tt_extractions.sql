-- =============================================================
-- Supabase Migration: TikTok Post ID Extractions
-- =============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- or add to your migrations folder.
-- =============================================================

-- Table: stores every TikTok extraction for history & analytics
CREATE TABLE IF NOT EXISTS tt_extractions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id    TEXT,                          -- numeric video ID (null for short URLs)
  short_code  TEXT,                          -- short URL code (null for full URLs)
  username    TEXT,                          -- @username if available
  post_type   TEXT        NOT NULL CHECK (post_type IN ('video', 'photo', 'embed', 'share', 'short', 'trending')),
  original_url TEXT       NOT NULL,
  raw_input   TEXT,                          -- the URL the user originally pasted
  is_short_url BOOLEAN   DEFAULT false,      -- true if input was a shortened URL
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()      NOT NULL
);

-- Index: fast lookups by video_id
CREATE INDEX IF NOT EXISTS idx_tt_extractions_video_id ON tt_extractions (video_id);

-- Index: fast lookups by username
CREATE INDEX IF NOT EXISTS idx_tt_extractions_username ON tt_extractions (username);

-- Index: filter by user
CREATE INDEX IF NOT EXISTS idx_tt_extractions_user_id ON tt_extractions (user_id);

-- Index: sort by newest first (history page)
CREATE INDEX IF NOT EXISTS idx_tt_extractions_created_at ON tt_extractions (created_at DESC);

-- RLS (Row Level Security) — enable if using Supabase Auth
-- Uncomment the lines below to restrict users to their own extractions.
--
-- ALTER TABLE tt_extractions ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view own TT extractions"
--   ON tt_extractions FOR SELECT
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can insert own TT extractions"
--   ON tt_extractions FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete own TT extractions"
--   ON tt_extractions FOR DELETE
--   USING (auth.uid() = user_id);
