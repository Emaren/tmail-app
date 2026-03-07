const serverApiBase = process.env.TMAIL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';
const internalToken = process.env.TMAIL_INTERNAL_API_TOKEN ?? '';

function buildUrl(path: string) {
  return `${serverApiBase}${path}`;
}

export function isServerApiConfigured() {
  return Boolean(serverApiBase && internalToken);
}

export async function fetchServerApi(path: string, init: RequestInit = {}) {
  if (!serverApiBase) {
    throw new Error('TMAIL_API_URL or NEXT_PUBLIC_API_URL is not configured.');
  }
  if (!internalToken) {
    throw new Error('TMAIL_INTERNAL_API_TOKEN is not configured.');
  }

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${internalToken}`);

  return fetch(buildUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });
}

export async function fetchServerJson<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetchServerApi(path, init);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
