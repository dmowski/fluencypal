import { generateSitemap } from './generateSitemap';

export async function GET(request: Request) {
  const textResponse = await generateSitemap();

  return new Response(textResponse, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
