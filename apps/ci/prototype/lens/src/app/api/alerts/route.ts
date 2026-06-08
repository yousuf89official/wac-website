import { db } from '@/lib/db/client';
import { alerts as alertsTable } from '@/lib/db/schema';
import {
  crisisAlerts,
  crisisTimeline,
  negativeAmplifiers,
  alertRules,
} from '@/lib/mock/data';

export async function GET() {
  try {
    if (!db) {
      return Response.json({
        data: { crisisAlerts, crisisTimeline, negativeAmplifiers, alertRules },
        source: 'mock',
      });
    }
    const data = await db.select().from(alertsTable).limit(50);
    if (data.length === 0) {
      return Response.json({
        data: { crisisAlerts, crisisTimeline, negativeAmplifiers, alertRules },
        source: 'mock',
      });
    }
    return Response.json({
      data: { crisisAlerts, crisisTimeline, negativeAmplifiers, alertRules },
      source: 'neon',
    });
  } catch {
    return Response.json({
      data: { crisisAlerts, crisisTimeline, negativeAmplifiers, alertRules },
      source: 'mock',
    });
  }
}
