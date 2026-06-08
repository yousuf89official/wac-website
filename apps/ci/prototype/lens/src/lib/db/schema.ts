import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
  real,
  date,
} from 'drizzle-orm/pg-core';

// ─── Tenants ─────────────────────────────────────────
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  tier: varchar('tier', { length: 50 }).notNull().default('starter'),
  settings: jsonb('settings').default({}),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('viewer'),
  passwordHash: text('password_hash'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Projects ────────────────────────────────────────
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  keywords: text('keywords').array(),
  channels: text('channels').array(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Mentions ────────────────────────────────────────
export const mentions = pgTable('mentions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  externalId: varchar('external_id', { length: 255 }),
  platform: varchar('platform', { length: 50 }).notNull(),
  sourceUrl: text('source_url'),
  authorUsername: varchar('author_username', { length: 255 }),
  authorFollowers: integer('author_followers').default(0),
  contentRaw: text('content_raw'),
  contentClean: text('content_clean'),
  sentiment: varchar('sentiment', { length: 20 }),
  sentimentScore: real('sentiment_score'),
  topics: text('topics').array(),
  engagementTotal: integer('engagement_total').default(0),
  likes: integer('likes').default(0),
  shares: integer('shares').default(0),
  comments: integer('comments').default(0),
  views: integer('views').default(0),
  reachEstimate: integer('reach_estimate').default(0),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Alert Rules ─────────────────────────────────────
export const alertRules = pgTable('alert_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id),
  name: varchar('name', { length: 255 }).notNull(),
  ruleType: varchar('rule_type', { length: 100 }).notNull(),
  threshold: real('threshold'),
  severity: varchar('severity', { length: 20 }).notNull().default('medium'),
  channels: text('channels').array(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Alerts ──────────────────────────────────────────
export const alerts = pgTable('alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  ruleId: uuid('rule_id').references(() => alertRules.id),
  projectId: uuid('project_id').references(() => projects.id),
  severity: varchar('severity', { length: 20 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  body: text('body'),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
});

// ─── Influencers ─────────────────────────────────────
export const influencers = pgTable('influencers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  platform: varchar('platform', { length: 50 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  followerCount: integer('follower_count').default(0),
  engagementRate: real('engagement_rate'),
  aqsScore: real('aqs_score'),
  categories: text('categories').array(),
  region: varchar('region', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Reputation Snapshots ────────────────────────────
export const reputationSnapshots = pgTable('reputation_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id),
  snapshotDate: date('snapshot_date').notNull(),
  nss: real('nss'),
  si: real('si'),
  emss: real('emss'),
  sovPositive: real('sov_positive'),
  peerRank: integer('peer_rank'),
  category: varchar('category', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Policy Topics ───────────────────────────────────
export const policyTopics = pgTable('policy_topics', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  keywords: text('keywords').array(),
  stakeholders: text('stakeholders').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
