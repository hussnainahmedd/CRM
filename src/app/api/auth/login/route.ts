import { SignJWT } from 'jose';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-development');

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    
    // Verify PIN against DB
    const userResult = await db.select().from(users).where(eq(users.password_hash, pin)).limit(1);
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }

    const user = userResult[0];

    const token = await new SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
