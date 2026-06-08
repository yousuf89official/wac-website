-- =============================================================
-- Supabase Migration: Instagram Post ID Extractions
-- =============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- or add to your migrations folder.
-- =============================================================

-- Table: stores every extraction for history & analytics
CREATE TABLE IF NOT EXISTS ig_extractions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shortcode   TEXT        NOT NULL,
  media_id    TEXT        NOT NULL,
  post_type   TEXT        NOT NULL CHECK (post_type IN ('post', 'reel', 'tv', 'story')),
  original_url TEXT       NOT NULL,
  raw_input   TEXT,                          -- the URL the user originally pasted
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable: ties to Supabase Auth if you use it
  created_at  TIMESTAMPTZ DEFAULT now()      NOT NULL
);

-- Index: fast lookups by shortcode
CREATE INDEX IF NOT EXISTS idx_ig_extractions_shortcode ON ig_extractions (shortcode);

-- Index: fast lookups by media_id
CREATE INDEX IF NOT EXISTS idx_ig_extractions_media_id ON ig_extractions (media_id);

-- Index: filter by user
CREATE INDEX IF NOT EXISTS idx_ig_extractions_user_id ON ig_extractions (user_id);

-- Index: sort by newest first (history page)
CREATE INDEX IF NOT EXISTS idx_ig_extractions_created_at ON ig_extractions (created_at DESC);

-- RLS (Row Level Security) — enable if using Supabase Auth
-- Uncomment the lines below to restrict users to their own extractions.
--
-- ALTER TABLE ig_extractions ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Users can view own extractions"
--   ON ig_extractions FOR SELECT
--   USING (auth.uid() = user_id);
--
-- CREATE POLICY "Users can insert own extractions"
--   ON ig_extractions FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete own extractions"
--   ON ig_extractions FOR DELETE
--   USING (auth.uid() = user_id);
