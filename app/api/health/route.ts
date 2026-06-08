import { NextResponse } from 'next/server';

// Lightweight liveness probe. Used to confirm a deploy is serving and to tell
// production vs. staging apart at a glance:
//   curl https://wearecollaborative.net/api/health
//   curl https://staging.wearecollaborative.net/api/health
export const dynamic = 'force-dynamic';

export function GET() {
    return NextResponse.json({
        ok: true,
        env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
        ts: new Date().toISOString(),
    });
}
