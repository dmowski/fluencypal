// app/api/ttsStream/route.ts
import OpenAI from 'openai';
export const runtime = 'nodejs';

const apiKey = process.env.OPENAI_API_KEY!;
const client = new OpenAI({ apiKey });

export async function GET(req: Request) {
  const u = new URL(req.url);

  const input = (u.searchParams.get('input') ?? '').trim();
  const voice = (u.searchParams.get('voice') ?? '').trim();
  const instructions = (u.searchParams.get('instructions') ?? '').trim();

  const resp = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: voice as any,
    input,
    instructions: instructions || 'Speak in a cheerful and positive tone.',
  });

  return new Response(resp.body as any, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
