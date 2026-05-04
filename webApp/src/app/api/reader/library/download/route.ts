import {
  isValidGutenbergEbookId,
  resolveGutenbergEpubDownload,
} from '@/features/Reader/server/gutenberg';

export const runtime = 'nodejs';

function badRequest(message: string): Response {
  return new Response(message, { status: 400 });
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const ebookId = searchParams.get('ebookId');

  if (!ebookId) {
    return badRequest('Missing "ebookId" query parameter');
  }

  if (!isValidGutenbergEbookId(ebookId)) {
    return badRequest('Invalid "ebookId" query parameter');
  }

  try {
    const { downloadUrl, fileName } = await resolveGutenbergEpubDownload(ebookId);
    const upstream = await fetch(downloadUrl, {
      headers: {
        Accept: 'application/epub+zip,application/octet-stream;q=0.9,*/*;q=0.8',
      },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response('Failed to download EPUB from Gutenberg', { status: 502 });
    }

    const headers = new Headers();
    headers.set('content-type', upstream.headers.get('content-type') || 'application/epub+zip');
    headers.set('content-disposition', `attachment; filename="${fileName}"`);

    const passthroughHeaders = ['content-length', 'cache-control', 'etag', 'last-modified'];
    for (const header of passthroughHeaders) {
      const value = upstream.headers.get(header);
      if (value) {
        headers.set(header, value);
      }
    }

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('GET /api/reader/library/download failed', error);
    return new Response('Failed to download library book.', { status: 502 });
  }
}
