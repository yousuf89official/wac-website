import { db } from './client';
import {
  tenants,
  users,
  projects,
  mentions as mentionsTable,
  alertRules as alertRulesTable,
  alerts as alertsTable,
  influencers as influencersTable,
  reputationSnapshots,
  policyTopics,
} from './schema';
import {
  mentions,
  alertRules,
  crisisAlerts,
  influencers,
  indexTrend,
  stakeholders,
} from '@/lib/mock/data';

export async function seedDatabase() {
  if (!db) {
    throw new Error('DATABASE_URL not configured');
  }

  // 1. Create tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      slug: 'bni',
      name: 'Bank Negara Indonesia',
      tier: 'enterprise',
      settings: { brand: 'BNI', industry: 'Banking' },
    })
    .returning();

  // 2. Create user
  await db.insert(users).values({
    tenantId: tenant.id,
    email: 'admin@bni.co.id',
    fullName: 'Admin BNI',
    role: 'admin',
  });

  // 3. Create project
  const [project] = await db
    .insert(projects)
    .values({
      tenantId: tenant.id,
      name: 'Bank Negara Indonesia (BNI)',
      description: 'Social media & reputation monitoring for BNI',
      keywords: ['BNI', 'Wondr', 'BBNI', 'bank negara indonesia'],
      channels: ['Twitter', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Online News'],
    })
    .returning();

  // 4. Seed mentions
  for (const m of mentions) {
    await db.insert(mentionsTable).values({
      projectId: project.id,
      tenantId: tenant.id,
      externalId: m.id,
      platform: m.platform,
      authorUsername: m.username,
      contentRaw: m.content,
      contentClean: m.content,
      sentiment: m.sentiment,
      sentimentScore: m.sentiment === 'positive' ? 0.8 : m.sentiment === 'negative' ? -0.8 : 0,
      likes: m.likes,
      shares: m.shares,
      comments: m.comments,
      engagementTotal: m.likes + m.shares + m.comments,
      publishedAt: new Date(),
    });
  }

  // 5. Seed alert rules
  for (const rule of alertRules) {
    await db.insert(alertRulesTable).values({
      projectId: project.id,
      name: rule.name,
      ruleType: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      channels: rule.channels,
      isActive: rule.enabled,
    });
  }

  // 6. Seed alerts from crisis data
  for (const alert of crisisAlerts) {
    await db.insert(alertsTable).values({
      projectId: project.id,
      severity: alert.severity,
      title: alert.title,
      body: alert.description,
      status: alert.active ? 'open' : 'resolved',
    });
  }

  // 7. Seed influencers
  for (const inf of influencers) {
    await db.insert(influencersTable).values({
      tenantId: tenant.id,
      platform: inf.platform,
      username: inf.username,
      displayName: inf.username,
      followerCount: inf.followers,
      engagementRate: inf.engagementRate,
      aqsScore: inf.aqsScore,
      categories: [inf.category],
      region: inf.region,
    });
  }

  // 8. Seed reputation snapshots (last 90 days)
  for (const point of indexTrend) {
    await db.insert(reputationSnapshots).values({
      projectId: project.id,
      snapshotDate: new Date().toISOString().split('T')[0],
      nss: point.NSS,
      si: point.SI,
      emss: point.EMSS,
      sovPositive: 21.7,
      peerRank: 4,
      category: 'Banking',
    });
  }

  // 9. Seed policy topics
  for (const s of stakeholders) {
    await db.insert(policyTopics).values({
      tenantId: tenant.id,
      name: s.name,
      keywords: [s.keyNarrative],
      stakeholders: [s.name],
    });
  }

  return {
    tenantId: tenant.id,
    projectId: project.id,
    mentionCount: mentions.length,
    alertRuleCount: alertRules.length,
    influencerCount: influencers.length,
  };
}
