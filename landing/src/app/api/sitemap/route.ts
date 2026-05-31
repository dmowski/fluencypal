import { generateSitemap } from './generateSitemap';

export const dynamic = 'force-dynamic';

export async function GET() {
  const textResponse = await generateSitemap();

  return new Response(textResponse, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store',
    },
  });
}
