import { db } from '@/lib/db/client';
import { policyTopics } from '@/lib/db/schema';
import {
  provinceData,
  stakeholders,
  issueTaxonomy,
} from '@/lib/mock/data';

export async function GET() {
  try {
    if (!db) {
      return Response.json({
        data: { provinceData, stakeholders, issueTaxonomy },
        source: 'mock',
      });
    }
    const data = await db.select().from(policyTopics).limit(1);
    if (data.length === 0) {
      return Response.json({
        data: { provinceData, stakeholders, issueTaxonomy },
        source: 'mock',
      });
    }
    return Response.json({
      data: { provinceData, stakeholders, issueTaxonomy },
      source: 'neon',
    });
  } catch {
    return Response.json({
      data: { provinceData, stakeholders, issueTaxonomy },
      source: 'mock',
    });
  }
}
