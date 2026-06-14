import { describe, it, expect } from 'vitest';
import { CampaignSpecSchema } from '../spec';

const valid = {
  objective: 'TRAFFIC',
  platforms: ['meta', 'tiktok'],
  budget: { type: 'daily', amount: 50, currency: 'USD' },
  schedule: { start: '2026-07-01T00:00:00.000Z', end: '2026-07-31T00:00:00.000Z' },
  audience: { geos: ['US'], ageMin: 18, ageMax: 65, genders: ['all'], interests: [] },
  placements: ['feed'],
  creatives: { meta: ['1234567890'], tiktok: ['v-9876'] },
};

describe('CampaignSpecSchema', () => {
  it('accepts a valid spec', () => {
    const parsed = CampaignSpecSchema.parse(valid);
    expect(parsed.platforms).toEqual(['meta', 'tiktok']);
    expect(parsed.budget.amount).toBe(50);
  });

  it('rejects an unknown platform', () => {
    const bad = { ...valid, platforms: ['myspace'] };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });

  it('rejects a non-positive budget amount', () => {
    const bad = { ...valid, budget: { ...valid.budget, amount: 0 } };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });

  it('rejects ageMax below ageMin', () => {
    const bad = { ...valid, audience: { ...valid.audience, ageMin: 50, ageMax: 30 } };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });

  it('requires at least one creative for each selected platform', () => {
    const bad = { ...valid, creatives: { meta: [], tiktok: ['v-9876'] } };
    expect(() => CampaignSpecSchema.parse(bad)).toThrow();
  });
});
