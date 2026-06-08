import { db } from '@/lib/db/client';
import { influencers as influencersTable } from '@/lib/db/schema';
import {
  influencers,
  campaignRows,
  marketplaceSentiment,
} from '@/lib/mock/data';

export async function GET() {
  try {
    if (!db) {
      return Response.json({
        data: { influencers, campaignRows, marketplaceSentiment },
        source: 'mock',
      });
    }
    const data = await db.select().from(influencersTable).limit(50);
    if (data.length === 0) {
      return Response.json({
        data: { influencers, campaignRows, marketplaceSentiment },
        source: 'mock',
      });
    }
    return Response.json({
      data: { influencers, campaignRows, marketplaceSentiment },
      source: 'neon',
    });
  } catch {
    return Response.json({
      data: { influencers, campaignRows, marketplaceSentiment },
      source: 'mock',
    });
  }
}
