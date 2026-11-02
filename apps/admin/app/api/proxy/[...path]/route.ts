import { NextRequest } from 'next/server';

const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const;
type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl)
    return Response.json(
      { error: { message: 'Admin API is not configured on Vercel.' } },
      { status: 503 },
    );
  const { path } = await context.params;
  const upstreamUrl = `${apiUrl.replace(/\/$/, '')}/${path.join('/')}${request.nextUrl.search}`;
  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const contentType = request.headers.get('content-type');
  if (authorization) headers.set('authorization', authorization);
  if (contentType) headers.set('content-type', contentType);
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();
  try {
    const response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return Response.json(
      {
        error: {
          message: 'The API service could not be reached. Check the API deployment and API_URL.',
        },
      },
      { status: 502 },
    );
  }
}

export const GET = (request: NextRequest, context: RouteContext) => proxy(request, context);
export const POST = (request: NextRequest, context: RouteContext) => proxy(request, context);
export const PATCH = (request: NextRequest, context: RouteContext) => proxy(request, context);
export const PUT = (request: NextRequest, context: RouteContext) => proxy(request, context);
export const DELETE = (request: NextRequest, context: RouteContext) => proxy(request, context);
