import { z } from 'zod';

export const PLATFORMS = ['meta', 'tiktok'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const OBJECTIVES = [
  'AWARENESS',
  'TRAFFIC',
  'ENGAGEMENT',
  'LEADS',
  'SALES',
  'APP_PROMOTION',
] as const;

const BudgetSchema = z.object({
  type: z.enum(['daily', 'lifetime']),
  amount: z.number().positive(),
  currency: z.string().length(3),
});

const AudienceSchema = z
  .object({
    geos: z.array(z.string()).min(1),
    ageMin: z.number().int().min(13).max(65),
    ageMax: z.number().int().min(13).max(65),
    genders: z.array(z.enum(['all', 'male', 'female'])).min(1),
    interests: z.array(z.string()).default([]),
  })
  .refine((a) => a.ageMax >= a.ageMin, {
    message: 'ageMax must be >= ageMin',
    path: ['ageMax'],
  });

export const CampaignSpecSchema = z
  .object({
    objective: z.enum(OBJECTIVES),
    platforms: z.array(z.enum(PLATFORMS)).min(1),
    budget: BudgetSchema,
    schedule: z.object({
      start: z.string().datetime(),
      end: z.string().datetime().optional(),
    }),
    audience: AudienceSchema,
    placements: z.array(z.string()).min(1),
    creatives: z.object({
      meta: z.array(z.string()).default([]),
      tiktok: z.array(z.string()).default([]),
    }),
  })
  .superRefine((spec, ctx) => {
    for (const p of spec.platforms) {
      if ((spec.creatives[p] ?? []).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `at least one creative required for platform "${p}"`,
          path: ['creatives', p],
        });
      }
    }
  });

export type CampaignSpec = z.infer<typeof CampaignSpecSchema>;
