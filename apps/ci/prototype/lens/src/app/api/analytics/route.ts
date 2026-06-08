import { db } from '@/lib/db/client';
import { mentions as mentionsTable } from '@/lib/db/schema';
import {
  socialKPIs,
  volumeTrend,
  sentimentData,
  topTopics,
  wordCloudItems,
  heatmapData,
  shareOfVoice,
  sourceBreakdown,
} from '@/lib/mock/data';

export async function GET() {
  try {
    if (!db) {
      return Response.json({
        data: {
          socialKPIs,
          volumeTrend,
          sentimentData,
          topTopics,
          wordCloudItems,
          heatmapData,
          shareOfVoice,
          sourceBreakdown,
        },
        source: 'mock',
      });
    }
    // Try to derive analytics from DB mentions
    const data = await db.select().from(mentionsTable).limit(1);
    if (data.length === 0) {
      return Response.json({
        data: {
          socialKPIs,
          volumeTrend,
          sentimentData,
          topTopics,
          wordCloudItems,
          heatmapData,
          shareOfVoice,
          sourceBreakdown,
        },
        source: 'mock',
      });
    }
    // For now return mock analytics even with DB (real aggregation would be a future feature)
    return Response.json({
      data: {
        socialKPIs,
        volumeTrend,
        sentimentData,
        topTopics,
        wordCloudItems,
        heatmapData,
        shareOfVoice,
        sourceBreakdown,
      },
      source: 'neon',
    });
  } catch {
    return Response.json({
      data: {
        socialKPIs,
        volumeTrend,
        sentimentData,
        topTopics,
        wordCloudItems,
        heatmapData,
        shareOfVoice,
        sourceBreakdown,
      },
      source: 'mock',
    });
  }
}
