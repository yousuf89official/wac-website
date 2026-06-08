import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export const db = getDb();
export type DbClient = NonNullable<ReturnType<typeof getDb>>;
