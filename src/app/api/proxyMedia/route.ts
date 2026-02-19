export const runtime = 'nodejs';

const ALLOWED_MEDIA_HOSTS = new Set(['storage.googleapis.com', 'firebasestorage.googleapis.com']);

function badRequest(message: string): Response {
  return new Response(message, { status: 400 });
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const rawTargetUrl = searchParams.get('url');

  if (!rawTargetUrl) {
    return badRequest('Missing "url" query parameter');
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawTargetUrl);
  } catch {
    return badRequest('Invalid target URL');
  }

  if (targetUrl.protocol !== 'https:') {
    return badRequest('Only https URLs are allowed');
  }

  if (!ALLOWED_MEDIA_HOSTS.has(targetUrl.hostname)) {
    return badRequest('Host is not allowed');
  }

  const upstream = await fetch(targetUrl.toString(), {
    method: 'GET',
    headers: {
      Accept: '*/*',
    },
  });

  if (!upstream.body) {
    return new Response('Failed to read upstream response body', { status: 502 });
  }

  const headers = new Headers();
  const passthroughHeaders = [
    'content-type',
    'content-length',
    'cache-control',
    'accept-ranges',
    'content-range',
    'etag',
    'last-modified',
  ];

  for (const header of passthroughHeaders) {
    const value = upstream.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
