import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE_NAME = 'tmail_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const LOGIN_WINDOW_SECONDS = 60 * 10;
const LOGIN_LOCK_SECONDS = 60 * 15;
const MAX_LOGIN_ATTEMPTS = 5;

export interface AdminSession {
  id: string;
  username: string;
  displayName: string;
  role: string;
  totpEnabled: boolean;
  exp: number;
}

export interface LoginThrottleState {
  allowed: boolean;
  retryAfterSeconds: number;
  remainingAttempts: number;
}

interface LoginAttemptState {
  failures: number[];
  lockedUntil: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __tmailLoginAttempts: Map<string, LoginAttemptState> | undefined;
}

const loginAttempts = globalThis.__tmailLoginAttempts ?? new Map<string, LoginAttemptState>();
if (!globalThis.__tmailLoginAttempts) {
  globalThis.__tmailLoginAttempts = loginAttempts;
}

function getSessionSecret() {
  return process.env.TMAIL_SESSION_SECRET?.trim() || process.env.TMAIL_ADMIN_PASSWORD?.trim() || '';
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(data: string, secret: string) {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

function normalizeLoginAttempts(identifier: string) {
  const now = Date.now();
  const state = loginAttempts.get(identifier) ?? { failures: [], lockedUntil: 0 };
  state.failures = state.failures.filter((timestamp) => timestamp > now - (LOGIN_WINDOW_SECONDS * 1000));
  if (state.lockedUntil <= now) {
    state.lockedUntil = 0;
  }

  if (!state.failures.length && !state.lockedUntil) {
    loginAttempts.delete(identifier);
    return { failures: [], lockedUntil: 0 };
  }

  loginAttempts.set(identifier, state);
  return state;
}

export function isSessionConfigured() {
  return Boolean(getSessionSecret());
}

export function createSessionToken(session: Omit<AdminSession, 'exp'>) {
  const secret = getSessionSecret();
  const payload: AdminSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) {
    return null;
  }

  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as AdminSession;
    if (!payload.id || !payload.username || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export function buildSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    priority: 'high' as const,
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
    priority: 'high' as const,
  };
}

export function getLoginThrottleState(identifier: string): LoginThrottleState {
  const state = normalizeLoginAttempts(identifier);
  if (state.lockedUntil > Date.now()) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((state.lockedUntil - Date.now()) / 1000)),
      remainingAttempts: 0,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - state.failures.length),
  };
}

export function recordFailedLogin(identifier: string): LoginThrottleState {
  const now = Date.now();
  const state = normalizeLoginAttempts(identifier);
  state.failures.push(now);
  state.failures = state.failures.filter((timestamp) => timestamp > now - (LOGIN_WINDOW_SECONDS * 1000));
  if (state.failures.length >= MAX_LOGIN_ATTEMPTS) {
    state.lockedUntil = now + (LOGIN_LOCK_SECONDS * 1000);
  }
  loginAttempts.set(identifier, state);
  return getLoginThrottleState(identifier);
}

export function clearLoginFailures(identifier: string) {
  loginAttempts.delete(identifier);
}
