import { db } from '@/db';
import { patients, users } from '@/db/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if users exist in THIS database (Vercel's Neon instance)
    const existingUsers = await db.select().from(users);
    let seeded = false;
    
    if (existingUsers.length === 0) {
      // Seed the users!
      await db.insert(users).values([
        { username: 'reception', password_hash: '1122', role: 'receptionist' },
        { username: 'doctor', password_hash: '9988', role: 'doctor' }
      ]);
      seeded = true;
    }
    
    const p = await db.select().from(patients).limit(1);
    return NextResponse.json({ 
      success: true, 
      status: 'connected', 
      rowCount: p.length,
      seededUsers: seeded
    });
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: e.message,
      loadedEnvKeys: Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATA') || k.includes('URL') || k.includes('JWT'))
    }, { status: 500 });
  }
}
