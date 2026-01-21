// app/api/tts/route.ts
import OpenAI from 'openai';

export const runtime = 'nodejs'; // important: Buffer / node APIs are OK

type Body = {
  input: string;
  voice: string; // e.g. "alloy"
  instructions?: string;
  languageName?: string; // optional, e.g. "English", "Spanish"
};

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response('Missing OPENAI_API_KEY', { status: 500 });

  const { input, voice, instructions, languageName } = (await req.json()) as Body;

  const text = (input ?? '').trim();
  if (!text) return new Response('Missing input', { status: 400 });
  if (!voice) return new Response('Missing voice', { status: 400 });

  const client = new OpenAI({ apiKey });

  const combinedInstructions = [
    instructions?.trim() || 'Speak in a cheerful and positive tone.',
    languageName ? `Use ${languageName} language.` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const mp3 = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice,
    input: text,
    instructions: combinedInstructions,
  });

  // This waits for the full MP3 payload to be received
  const ab = await mp3.arrayBuffer();

  return new Response(ab, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      // Optional: allows caching in browser/CDN if you want
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
