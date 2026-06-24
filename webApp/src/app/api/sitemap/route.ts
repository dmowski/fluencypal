import { generateSitemapForHost } from './generateSitemap';

export async function GET(request: Request) {
  const host = request.headers.get('host');
  const textResponse = await generateSitemapForHost(host);

  return new Response(textResponse, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
