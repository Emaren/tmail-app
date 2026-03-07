import { NextRequest, NextResponse } from 'next/server';
import { buildSessionCookie, createSessionToken, isAuthConfigured, validateAdminCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: 'TMail admin auth is not configured.' }, { status: 503 });
  }

  const payload = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = payload?.username?.trim() || '';
  const password = payload?.password || '';

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, username });
  response.cookies.set(buildSessionCookie(createSessionToken(username)));
  return response;
}
