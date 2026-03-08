import { NextRequest, NextResponse } from 'next/server';
import {
  buildSessionCookie,
  clearLoginFailures,
  createSessionToken,
  getLoginThrottleState,
  isSessionConfigured,
  recordFailedLogin,
} from '@/lib/auth';
import { fetchServerApi, isServerApiConfigured } from '@/lib/server-api';

function resolveClientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  if (!isSessionConfigured() || !isServerApiConfigured()) {
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

  const payload = (await request.json().catch(() => null)) as { username?: string; password?: string; totpCode?: string } | null;
  const username = payload?.username?.trim() || '';
  const password = payload?.password || '';
  const totpCode = payload?.totpCode?.trim() || '';

  try {
    const response = await fetchServerApi('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, totp_code: totpCode || undefined }),
    });
    const authPayload = (await response.json().catch(() => null)) as
      | { error?: string; operator?: { id: string; username: string; display_name?: string; role?: string; totp_enabled?: boolean } }
      | null;
    if (!response.ok || !authPayload?.operator) {
      throw new Error(authPayload?.error ?? 'Invalid credentials.');
    }

    clearLoginFailures(clientId);
    const responsePayload = NextResponse.json({
      ok: true,
      username: authPayload.operator.username,
      totpEnabled: Boolean(authPayload.operator.totp_enabled),
    });
    responsePayload.cookies.set(
      buildSessionCookie(
        createSessionToken({
          id: authPayload.operator.id,
          username: authPayload.operator.username,
          displayName: authPayload.operator.display_name || authPayload.operator.username,
          role: authPayload.operator.role || 'admin',
          totpEnabled: Boolean(authPayload.operator.totp_enabled),
        }),
      ),
    );
    responsePayload.headers.set('Cache-Control', 'no-store');
    return responsePayload;
  } catch (error) {
    const failedState = recordFailedLogin(clientId);
    const status = failedState.allowed ? 401 : 429;
    return NextResponse.json(
      {
        error: failedState.allowed
          ? `${error instanceof Error ? error.message : 'Invalid credentials.'} ${failedState.remainingAttempts} attempts remaining before cooldown.`
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
}
