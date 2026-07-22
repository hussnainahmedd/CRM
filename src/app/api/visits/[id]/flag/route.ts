import { db } from '@/db';
import { visits } from '@/db/schema';
import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-development');

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (auth.role !== 'doctor') {
    return NextResponse.json({ error: 'Forbidden: Doctors only' }, { status: 403 });
  }

  const resolvedParams = await params;
  const visitId = resolvedParams.id;

  try {
    const { flag_status, flag_reason } = await req.json();
    
    await db.update(visits)
      .set({ 
        flag_status, 
        flag_reason: flag_reason || null,
        last_synced_at: sql`now()`
      })
      .where(eq(visits.id, visitId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Flag error:', err);
    return NextResponse.json({ error: 'Failed to flag visit' }, { status: 500 });
  }
}
