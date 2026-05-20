import { existsSync } from 'fs';
import { join } from 'path';
import { isValidGutenbergEbookId } from '@/features/Reader/server/gutenberg';

export const runtime = 'nodejs';

function badRequest(message: string): Response {
  return new Response(message, { status: 400 });
}

const findLocalEpubPublicPath = (ebookId: string): string | null => {
  const filename = `pg${ebookId}.epub`;
  if (existsSync(join(process.cwd(), 'public', 'Reader', filename))) {
    return `/Reader/${filename}`;
  }
  return null;
};

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const ebookId = searchParams.get('ebookId');

  if (!ebookId) {
    return badRequest('Missing "ebookId" query parameter');
  }

  if (!isValidGutenbergEbookId(ebookId)) {
    return badRequest('Invalid "ebookId" query parameter');
  }

  const localPath = findLocalEpubPublicPath(ebookId);
  if (localPath) {
    return Response.redirect(new URL(localPath, request.url), 302);
  }

  return new Response(`EPUB for ebook ${ebookId} is not available.`, { status: 404 });
}
