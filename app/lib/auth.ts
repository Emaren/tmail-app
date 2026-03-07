import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE_NAME = 'tmail_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export interface AdminSession {
  username: string;
  exp: number;
}

function getAuthConfig() {
  return {
    username: process.env.TMAIL_ADMIN_USERNAME?.trim() || 'tony',
    password: process.env.TMAIL_ADMIN_PASSWORD?.trim() || '',
    secret: process.env.TMAIL_SESSION_SECRET?.trim() || process.env.TMAIL_ADMIN_PASSWORD?.trim() || '',
  };
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

export function isAuthConfigured() {
  const config = getAuthConfig();
  return Boolean(config.password && config.secret);
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getAuthConfig();
  return isAuthConfigured() && username === config.username && password === config.password;
}

export function createSessionToken(username: string) {
  const config = getAuthConfig();
  const payload: AdminSession = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded, config.secret);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) {
    return null;
  }

  const config = getAuthConfig();
  if (!config.secret) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded, config.secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as AdminSession;
    if (!payload.username || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
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
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}
