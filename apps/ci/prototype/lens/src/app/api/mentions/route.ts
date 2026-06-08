import { db } from '@/lib/db/client';
import { mentions as mentionsTable } from '@/lib/db/schema';
import { mentions as mockMentions } from '@/lib/mock/data';

export async function GET() {
  try {
    if (!db) {
      return Response.json({ data: mockMentions, source: 'mock' });
    }
    const data = await db.select().from(mentionsTable).limit(50);
    if (data.length === 0) {
      return Response.json({ data: mockMentions, source: 'mock' });
    }
    return Response.json({ data, source: 'neon' });
  } catch {
    return Response.json({ data: mockMentions, source: 'mock' });
  }
}
