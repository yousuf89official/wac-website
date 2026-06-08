import { db } from '@/lib/db/client';
import { reputationSnapshots } from '@/lib/db/schema';
import {
  reputationKPIs,
  leaderboard,
  indexTrend,
} from '@/lib/mock/data';

export async function GET() {
  try {
    if (!db) {
      return Response.json({
        data: { reputationKPIs, leaderboard, indexTrend },
        source: 'mock',
      });
    }
    const data = await db.select().from(reputationSnapshots).limit(1);
    if (data.length === 0) {
      return Response.json({
        data: { reputationKPIs, leaderboard, indexTrend },
        source: 'mock',
      });
    }
    return Response.json({
      data: { reputationKPIs, leaderboard, indexTrend },
      source: 'neon',
    });
  } catch {
    return Response.json({
      data: { reputationKPIs, leaderboard, indexTrend },
      source: 'mock',
    });
  }
}
