import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use a dummy connection string during Vercel build time if the env var isn't loaded yet
const connectionString = process.env.DATABASE_URL || 'postgres://fallback:fallback@fallback.neon.tech/neondb';
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
