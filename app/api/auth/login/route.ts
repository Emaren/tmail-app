import { NextRequest, NextResponse } from 'next/server';
import {
  buildSessionCookie,
  clearLoginFailures,
  createSessionToken,
  getLoginThrottleState,
  isAuthConfigured,
  recordFailedLogin,
  validateAdminCredentials,
} from '@/lib/auth';

function resolveClientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: 'TMail admin auth is not configured.' }, { status: 503 });
  }

  const clientId = resolveClientIdentifier(request);
  const throttle = getLoginThrottleState(clientId);
  if (!throttle.allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${throttle.retryAfterSeconds} seconds.`, retryAfterSeconds: throttle.retryAfterSeconds },
      {
        status: 429,
        headers: {
          'Retry-After': String(throttle.retryAfterSeconds),
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  const payload = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  const username = payload?.username?.trim() || '';
  const password = payload?.password || '';

  if (!validateAdminCredentials(username, password)) {
    const failedState = recordFailedLogin(clientId);
    const status = failedState.allowed ? 401 : 429;
    return NextResponse.json(
      {
        error: failedState.allowed
          ? `Invalid credentials. ${failedState.remainingAttempts} attempts remaining before cooldown.`
          : `Too many login attempts. Try again in ${failedState.retryAfterSeconds} seconds.`,
        retryAfterSeconds: failedState.retryAfterSeconds,
        remainingAttempts: failedState.remainingAttempts,
      },
      {
        status,
        headers: {
          'Cache-Control': 'no-store',
          ...(failedState.allowed ? {} : { 'Retry-After': String(failedState.retryAfterSeconds) }),
        },
      },
    );
  }

  clearLoginFailures(clientId);
  const response = NextResponse.json({ ok: true, username });
  response.cookies.set(buildSessionCookie(createSessionToken(username)));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
