import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchServerApi } from '@/lib/server-api';

async function proxy(request: NextRequest, params: Promise<{ path: string[] }>, method: string) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const search = request.nextUrl.search || '';
  const backendPath = `/${path.join('/')}${search}`;
  const init: RequestInit = {
    method,
    headers: {},
  };

  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type');
    const bodyText = await request.text();
    if (contentType) {
      (init.headers as Record<string, string>)['Content-Type'] = contentType;
    }
    init.body = bodyText;
  }

  try {
    const response = await fetchServerApi(backendPath, init);
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy request failed.' },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context.params, 'GET');
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context.params, 'POST');
}
