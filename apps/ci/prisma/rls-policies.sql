-- Row Level Security (RLS) Policies for Collaborative Intelligence
-- Uses session variable 'app.current_user_id' set by the application layer
-- and 'app.current_user_role' for role-based access

-- Helper function to get current user ID from session variable
CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_user_id', true), '');
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_app_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(current_setting('app.current_user_role', true), '') = 'admin';
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================
-- 1. USER TABLE - Users can only see their own record; admins see all
-- ============================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON "User" FOR SELECT
  USING (is_app_admin() OR id = current_app_user_id());

CREATE POLICY "users_update" ON "User" FOR UPDATE
  USING (is_app_admin() OR id = current_app_user_id());

CREATE POLICY "users_insert" ON "User" FOR INSERT
  WITH CHECK (is_app_admin());

CREATE POLICY "users_delete" ON "User" FOR DELETE
  USING (is_app_admin());


-- ============================================================
-- 2. BRAND TABLE - Users see brands they belong to; admins see all
-- ============================================================
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_select" ON "Brand" FOR SELECT
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Brand".id
      AND "UserBrand"."userId" = current_app_user_id()
    )
  );

CREATE POLICY "brands_insert" ON "Brand" FOR INSERT
  WITH CHECK (is_app_admin());

CREATE POLICY "brands_update" ON "Brand" FOR UPDATE
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Brand".id
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin')
    )
  );

CREATE POLICY "brands_delete" ON "Brand" FOR DELETE
  USING (is_app_admin());


-- ============================================================
-- 3. USERBRAND TABLE - Users see their own memberships; admins see all
-- ============================================================
ALTER TABLE "UserBrand" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "userbrand_select" ON "UserBrand" FOR SELECT
  USING (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "userbrand_insert" ON "UserBrand" FOR INSERT
  WITH CHECK (is_app_admin());

CREATE POLICY "userbrand_update" ON "UserBrand" FOR UPDATE
  USING (is_app_admin());

CREATE POLICY "userbrand_delete" ON "UserBrand" FOR DELETE
  USING (is_app_admin());


-- ============================================================
-- 4. CAMPAIGN TABLE - Inherit brand access
-- ============================================================
ALTER TABLE "Campaign" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select" ON "Campaign" FOR SELECT
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Campaign"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
    )
  );

CREATE POLICY "campaigns_insert" ON "Campaign" FOR INSERT
  WITH CHECK (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Campaign"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "campaigns_update" ON "Campaign" FOR UPDATE
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Campaign"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "campaigns_delete" ON "Campaign" FOR DELETE
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Campaign"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin')
    )
  );


-- ============================================================
-- 5. SUBCAMPAIGN TABLE - Inherit campaign/brand access
-- ============================================================
ALTER TABLE "SubCampaign" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subcampaigns_select" ON "SubCampaign" FOR SELECT
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "Campaign" c
      JOIN "UserBrand" ub ON ub."brandId" = c."brandId"
      WHERE c.id = "SubCampaign"."campaignId"
      AND ub."userId" = current_app_user_id()
    )
  );

CREATE POLICY "subcampaigns_modify" ON "SubCampaign" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "Campaign" c
      JOIN "UserBrand" ub ON ub."brandId" = c."brandId"
      WHERE c.id = "SubCampaign"."campaignId"
      AND ub."userId" = current_app_user_id()
      AND ub."role" IN ('owner', 'admin', 'member')
    )
  );


-- ============================================================
-- 6. INTEGRATION TABLE - Inherit brand access (sensitive!)
-- ============================================================
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select" ON "Integration" FOR SELECT
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Integration"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin')
    )
  );

CREATE POLICY "integrations_modify" ON "Integration" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Integration"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin')
    )
  );


-- ============================================================
-- 7. METRIC TABLE - Inherit brand access
-- ============================================================
ALTER TABLE "Metric" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metrics_select" ON "Metric" FOR SELECT
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Metric"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
    )
  );

CREATE POLICY "metrics_modify" ON "Metric" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "Metric"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin', 'member')
    )
  );


-- ============================================================
-- 8. SHARELINK TABLE - Inherit brand access
-- ============================================================
ALTER TABLE "ShareLink" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sharelinks_select" ON "ShareLink" FOR SELECT
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "ShareLink"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
    )
  );

CREATE POLICY "sharelinks_modify" ON "ShareLink" FOR ALL
  USING (
    is_app_admin()
    OR EXISTS (
      SELECT 1 FROM "UserBrand"
      WHERE "UserBrand"."brandId" = "ShareLink"."brandId"
      AND "UserBrand"."userId" = current_app_user_id()
      AND "UserBrand"."role" IN ('owner', 'admin')
    )
  );


-- ============================================================
-- 9. INVOICE TABLE - Users see their own invoices
-- ============================================================
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select" ON "Invoice" FOR SELECT
  USING (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "invoices_insert" ON "Invoice" FOR INSERT
  WITH CHECK (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "invoices_update" ON "Invoice" FOR UPDATE
  USING (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "invoices_delete" ON "Invoice" FOR DELETE
  USING (is_app_admin() OR "userId" = current_app_user_id());


-- ============================================================
-- 10. IGEXTRACTION TABLE - Users see their own extractions
-- ============================================================
ALTER TABLE "IgExtraction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ig_select" ON "IgExtraction" FOR SELECT
  USING (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "ig_insert" ON "IgExtraction" FOR INSERT
  WITH CHECK (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "ig_delete" ON "IgExtraction" FOR DELETE
  USING (is_app_admin() OR "userId" = current_app_user_id());


-- ============================================================
-- 11. TTEXTRACTION TABLE - Users see their own extractions
-- ============================================================
ALTER TABLE "TtExtraction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tt_select" ON "TtExtraction" FOR SELECT
  USING (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "tt_insert" ON "TtExtraction" FOR INSERT
  WITH CHECK (is_app_admin() OR "userId" = current_app_user_id());

CREATE POLICY "tt_delete" ON "TtExtraction" FOR DELETE
  USING (is_app_admin() OR "userId" = current_app_user_id());


-- ============================================================
-- 12. REFERENCE TABLES - Read for all authenticated, write for admins
-- ============================================================

-- Industry
ALTER TABLE "Industry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "industry_select" ON "Industry" FOR SELECT USING (current_app_user_id() != '');
CREATE POLICY "industry_modify" ON "Industry" FOR ALL USING (is_app_admin());

-- IndustrySubType
ALTER TABLE "IndustrySubType" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "industrysubtype_select" ON "IndustrySubType" FOR SELECT USING (current_app_user_id() != '');
CREATE POLICY "industrysubtype_modify" ON "IndustrySubType" FOR ALL USING (is_app_admin());

-- Platform
ALTER TABLE "Platform" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_select" ON "Platform" FOR SELECT USING (current_app_user_id() != '');
CREATE POLICY "platform_modify" ON "Platform" FOR ALL USING (is_app_admin());

-- Channel
ALTER TABLE "Channel" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "channel_select" ON "Channel" FOR SELECT USING (current_app_user_id() != '');
CREATE POLICY "channel_modify" ON "Channel" FOR ALL USING (is_app_admin());

-- CampaignChannel
ALTER TABLE "CampaignChannel" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaignchannel_select" ON "CampaignChannel" FOR SELECT USING (current_app_user_id() != '');
CREATE POLICY "campaignchannel_modify" ON "CampaignChannel" FOR ALL USING (is_app_admin());

-- SubCampaignChannel
ALTER TABLE "SubCampaignChannel" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subcampaignchannel_select" ON "SubCampaignChannel" FOR SELECT USING (current_app_user_id() != '');
CREATE POLICY "subcampaignchannel_modify" ON "SubCampaignChannel" FOR ALL USING (is_app_admin());

-- AppConfig
ALTER TABLE "AppConfig" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appconfig_select" ON "AppConfig" FOR SELECT USING (true); -- Public read (theme, CMS)
CREATE POLICY "appconfig_modify" ON "AppConfig" FOR ALL USING (is_app_admin());
