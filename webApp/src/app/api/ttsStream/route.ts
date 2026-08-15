// app/api/ttsStream/route.ts
import OpenAI from 'openai';
import { getBucket } from '../config/firebase';
import { SpeechCreateParams } from 'openai/resources/audio/speech.mjs';
import { getAudioHash } from '@/features/Audio/audioHash';
export const runtime = 'nodejs';

const saveAudioToStorage = async (audioId: string, audioData: Buffer<ArrayBufferLike>) => {
  const bucket = getBucket();
  const filePath = `ttsAudio/${audioId}.mp3`;
  const file = bucket.file(filePath);
  await file.save(audioData);
};

const getAudioFromStorage = async (audioId: string): Promise<Buffer | null> => {
  const bucket = getBucket();
  const filePath = `ttsAudio/${audioId}.mp3`;
  const file = bucket.file(filePath);

  const [exists] = await file.exists();
  if (exists) {
    const [contents] = await file.download();
    // Use the Buffer itself — `contents.buffer` is the backing ArrayBuffer and can
    // include unrelated bytes outside the Buffer window (corrupt MP3 in the browser).
    return contents;
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

  const audioId = getAudioHash(input, instructions, voice);

  if (isRegenerate) {
    console.log('REGENERATING ⚠️');
  }

  if (!isRegenerate) {
    const cachedAudio = await getAudioFromStorage(audioId);
    if (cachedAudio && cachedAudio.byteLength > 0) {
      console.log('From cache', input);
      return new Response(new Uint8Array(cachedAudio), {
        headers: {
          'Content-Type': 'audio/mpeg',
          //'Cache-Control': 'no-store',
          'Cache-Control': 'public, max-age=31536000, immutable',
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
    console.log('Stream response');
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
      //'Cache-Control': 'no-store',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
