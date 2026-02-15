// app/api/ttsStream/route.ts
import { getHash } from '@/libs/hash';
import OpenAI from 'openai';
import { getBucket } from '../config/firebase';
import { SpeechCreateParams } from 'openai/resources/audio/speech.mjs';
export const runtime = 'nodejs';

const saveAudioToStorage = async (audioId: string, audioData: Buffer<ArrayBufferLike>) => {
  const bucket = getBucket();
  const filePath = `ttsAudio/${audioId}.mp3`;
  const file = bucket.file(filePath);
  await file.save(audioData);
};

const getAudioFromStorage = async (audioId: string): Promise<ArrayBufferLike | null> => {
  const bucket = getBucket();
  const filePath = `ttsAudio/${audioId}.mp3`;
  const file = bucket.file(filePath);

  const [exists] = await file.exists();
  if (exists) {
    const [contents] = await file.download();
    return contents.buffer;
  }

  return null; // Return null if not found
};

const apiKey = process.env.OPENAI_API_KEY!;
const client = new OpenAI({ apiKey });

export async function GET(req: Request) {
  const u = new URL(req.url);

  const input = (u.searchParams.get('input') ?? '').trim();
  const voice = (u.searchParams.get('voice') ?? '').trim();
  const instructions = (u.searchParams.get('instructions') ?? '').trim();
  const isUseCache = u.searchParams.get('cache') === 'true';
  const isRegenerate = u.searchParams.get('regenerateCache') === 'true';

  const audioId = [input, voice, instructions]
    .filter(Boolean)
    .map((s) => getHash(s))
    .join('-');

  if (isRegenerate) {
    console.log('REGENERATING ⚠️');
  }

  if (isUseCache && !isRegenerate) {
    const cachedAudio = await getAudioFromStorage(audioId);
    if (cachedAudio) {
      console.log('From cache', input);
      return new Response(cachedAudio as any, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-store',
          //'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  }

  const voiceInstruction = instructions || undefined;

  const props: SpeechCreateParams = {
    model: 'gpt-4o-mini-tts',
    voice: voice || 'alloy',
    input,
  };

  if (instructions) {
    props.instructions = voiceInstruction;
  }

  const resp = await client.audio.speech.create(props);

  if (!isUseCache) {
    return new Response(resp.body as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  }

  const audioBuffer = Buffer.from(await resp.arrayBuffer());

  await saveAudioToStorage(audioId, audioBuffer);

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      //'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
