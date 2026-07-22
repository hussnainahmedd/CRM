import { db } from '@/db';
import { patients, visits } from '@/db/schema';
import { NextResponse } from 'next/server';
import { gt, sql } from 'drizzle-orm';
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

export async function POST(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { patients: syncPatients, visits: syncVisits } = await req.json();
    
    if (syncPatients && syncPatients.length > 0) {
      for (const p of syncPatients) {
        // Prepare tags array (default to empty if undefined)
        const tagsArray = p.tags || [];
        
        await db.insert(patients).values({
          id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          phone: p.phone || null,
          notes: p.notes || null,
          tags: tagsArray,
          total_visits: p.total_visits,
          total_fees: p.total_fees,
          created_at: new Date(p.created_at),
          last_synced_at: new Date()
        }).onConflictDoUpdate({
          target: patients.id,
          set: {
            name: sql`EXCLUDED.name`,
            age: sql`EXCLUDED.age`,
            gender: sql`EXCLUDED.gender`,
            phone: sql`EXCLUDED.phone`,
            notes: sql`EXCLUDED.notes`,
            tags: sql`EXCLUDED.tags`,
            total_visits: sql`EXCLUDED.total_visits`,
            total_fees: sql`EXCLUDED.total_fees`,
            last_synced_at: sql`EXCLUDED.last_synced_at`
          }
        });
      }
    }

    if (syncVisits && syncVisits.length > 0) {
      for (const v of syncVisits) {
        await db.insert(visits).values({
          id: v.id,
          patient_id: v.patient_id,
          services: v.services || [],
          fee_charged: v.fee_charged,
          payment_method: v.payment_method,
          timestamp: new Date(v.timestamp),
          flag_status: v.flag_status,
          flag_reason: v.flag_reason || null,
          last_synced_at: new Date()
        }).onConflictDoUpdate({
          target: visits.id,
          set: {
            services: sql`EXCLUDED.services`,
            fee_charged: sql`EXCLUDED.fee_charged`,
            payment_method: sql`EXCLUDED.payment_method`,
            flag_status: sql`EXCLUDED.flag_status`,
            flag_reason: sql`EXCLUDED.flag_reason`,
            last_synced_at: sql`EXCLUDED.last_synced_at`
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Sync POST error:', err);
    return NextResponse.json({ error: 'Sync failed: ' + err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const auth = await verifyAuth();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const sinceStr = url.searchParams.get('since');
  // TEMPORARY: Force pull everything to guarantee sync is fixed
  let since = new Date(0);

  try {
    const updatedPatients = await db.select().from(patients).where(gt(patients.last_synced_at, since));
    const updatedVisits = await db.select().from(visits).where(gt(visits.last_synced_at, since));
    return NextResponse.json({ patients: updatedPatients, visits: updatedVisits });
  } catch (err) {
    console.error('Sync GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}
