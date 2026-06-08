import { seedDatabase } from '@/lib/db/seed';

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: 'DATABASE_URL not configured. Set it in .env.local or Vercel environment variables.' },
        { status: 400 }
      );
    }
    const result = await seedDatabase();
    return Response.json({
      success: true,
      message: 'Database seeded successfully with BNI mock data',
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Seed failed: ${message}` }, { status: 500 });
  }
}
