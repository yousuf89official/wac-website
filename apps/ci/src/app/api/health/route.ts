import { NextResponse } from 'next/server';

// Liveness probe — confirms a deploy is serving and surfaces env/commit.
//   curl https://intelligence.wearecollaborative.net/api/health
export const dynamic = 'force-dynamic';

export function GET() {
    return NextResponse.json({
        ok: true,
        env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
        ts: new Date().toISOString(),
    });
}
