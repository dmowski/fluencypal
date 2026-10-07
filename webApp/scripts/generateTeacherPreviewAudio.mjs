import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { teacherPreviewClips } from './teacherPreviewClips.mjs';

const onlyVoice = process.argv[2];
const toGenerate = onlyVoice
  ? teacherPreviewClips.filter((clip) => clip.voice === onlyVoice)
  : teacherPreviewClips;

if (onlyVoice && toGenerate.length === 0) {
  console.error(`Unknown voice: ${onlyVoice}`);
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const webAppRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(webAppRoot, 'public', 'audio', 'teachers');
fs.mkdirSync(outDir, { recursive: true });

const client = new OpenAI({ apiKey });

for (const clip of toGenerate) {
  const filePath = path.join(outDir, `${clip.voice}.mp3`);
  const mp3 = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: clip.voice,
    input: clip.text,
    instructions: clip.instructions,
  });
  fs.writeFileSync(filePath, Buffer.from(await mp3.arrayBuffer()));
  console.log(`Wrote ${path.relative(webAppRoot, filePath)}`);
}
