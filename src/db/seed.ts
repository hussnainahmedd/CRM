import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log('Seeding initial users...');
  
  await db.insert(schema.users).values([
    {
      username: 'reception',
      password_hash: '1122',
      role: 'receptionist'
    },
    {
      username: 'doctor',
      password_hash: '9988',
      role: 'doctor'
    }
  ]);
  
  console.log('Seeding complete!');
  process.exit(0);
}

main().catch(console.error);
