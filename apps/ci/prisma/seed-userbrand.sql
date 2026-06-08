-- Assign admin user to all existing brands as 'owner'
-- First, temporarily set RLS context to admin so we can query
SELECT set_config('app.current_user_id', (SELECT id FROM "User" WHERE role = 'admin' LIMIT 1), false);
SELECT set_config('app.current_user_role', 'admin', false);

-- Create UserBrand entries for admin user → all brands
INSERT INTO "UserBrand" (id, "userId", "brandId", role, "createdAt")
SELECT
    gen_random_uuid()::text,
    u.id,
    b.id,
    'owner',
    NOW()
FROM "User" u
CROSS JOIN "Brand" b
WHERE u.role = 'admin'
ON CONFLICT ("userId", "brandId") DO NOTHING;
