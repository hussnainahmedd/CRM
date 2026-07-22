import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use Vercel's native POSTGRES_URL or DATABASE_URL, with a dummy string for build phase
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgres://fallback:fallback@fallback.neon.tech/neondb';
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
