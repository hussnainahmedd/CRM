import { db } from '@/db';
import { patients } from '@/db/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const p = await db.select().from(patients).limit(1);
    return NextResponse.json({ 
      success: true, 
      status: 'connected', 
      rowCount: p.length 
    });
  } catch (e: any) {
    return NextResponse.json({ 
      success: false, 
      error: e.message,
      // Only returning the KEYS of the environment variables to safely debug which ones Vercel actually loaded
      loadedEnvKeys: Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATA') || k.includes('URL') || k.includes('JWT'))
    }, { status: 500 });
  }
}
