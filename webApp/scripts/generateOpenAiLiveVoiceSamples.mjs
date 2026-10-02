import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const voices = [
  ['marin', 'Marin'],
  ['gleam', 'Gleam'],
  ['meridian', 'Meridian'],
  ['vesper', 'Vesper'],
  ['willow', 'Willow'],
  ['stone', 'Stone'],
  ['quartz', 'Quartz'],
  ['ripple', 'Ripple'],
  ['delta', 'Delta'],
  ['cinder', 'Cinder'],
  ['beacon', 'Beacon'],
  ['bossa', 'Bossa'],
  ['tempo', 'Tempo'],
];

const webAppRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = fs.readFileSync(path.join(webAppRoot, '.env'), 'utf8');
const apiKey = envFile.match(/^OPENAI_API_KEY=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const outDir = path.join(webAppRoot, 'public', 'audio', 'open-ai-live');
fs.mkdirSync(outDir, { recursive: true });

const only = process.argv.slice(2);
const selected = only.length > 0 ? voices.filter(([id]) => only.includes(id)) : voices;
if (only.length > 0 && selected.length !== only.length) {
  console.error(`Unknown voice in: ${only.join(', ')}`);
  process.exit(1);
}

const writeWav = (pcm, filePath) => {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(24000 * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(filePath, Buffer.concat([header, pcm]));
};

const TAIL_SECONDS = 3;
const BYTES_PER_SECOND = 24000 * 2;
const SPEECH_PEAK = 2000;

const saidLine = (transcript, name) => {
  const text = transcript.toLowerCase();
  return text.includes(name.toLowerCase()) && text.includes('speaking');
};

const endingPeak = (pcm) => {
  let end = pcm.length - 2;
  while (end > 0 && Math.abs(pcm.readInt16LE(end)) < 300) end -= 2;
  const from = Math.max(0, end - 3840);
  let peak = 0;
  for (let i = from; i <= end; i += 2) peak = Math.max(peak, Math.abs(pcm.readInt16LE(i)));
  return peak;
};

const sampleLine = (name) => {
  const extra = process.env.SPEAK_AFTER ? ` ${process.env.SPEAK_AFTER}` : '';
  return `Hi, I'm ${name}. Let's practice speaking.${extra}`;
};

const finishedCleanly = (pcm, transcript, name) =>
  saidLine(transcript, name) && endingPeak(pcm) < Number(process.env.ENDING_PEAK || 900);

const recordVoice = (voiceId, name) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://api.openai.com/v1/live/sessions', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const chunks = [];
    const types = new Set();
    let transcript = '';
    let settled = false;
    let speechDoneTimer;
    let tailTimer;
    let total = 0;
    let lastLoudEnd = 0;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(hardStop);
      clearTimeout(speechDoneTimer);
      clearTimeout(tailTimer);
      if (!error && lastLoudEnd > 0) {
        const tailBytes = total - lastLoudEnd;
        const needed = TAIL_SECONDS * BYTES_PER_SECOND;
        if (tailBytes < needed) chunks.push(Buffer.alloc(needed - tailBytes));
      }
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'session.close', event_id: 'close' }));
        }
      } catch {
        // already closed
      }
      setTimeout(() => {
        try {
          ws.close();
        } catch {
          // already closed
        }
      }, 200);
      if (error) reject(error);
      else resolve({ pcm: Buffer.concat(chunks), types: [...types], transcript });
    };
    const beginTail = () => {
      if (tailTimer || !saidLine(transcript, name)) return;
      tailTimer = setTimeout(() => finish(), TAIL_SECONDS * 1000);
    };
    const scheduleQuietCheck = () => {
      clearTimeout(speechDoneTimer);
      if (tailTimer) return;
      speechDoneTimer = setTimeout(beginTail, 800);
    };
    const hardStop = setTimeout(() => finish(), 28_000);

    ws.addEventListener('error', () => finish(new Error(`${voiceId}: websocket failed`)));
    ws.addEventListener('open', () => {
      ws.send(
        JSON.stringify({
          type: 'session.start',
          event_id: 'start',
          session: {
            model: 'gpt-live-1',
            instructions: `Your name is ${name}. Immediately say exactly this sentence, then stop: ${sampleLine(name)}`,
            audio: {
              format: { type: 'audio/pcm', rate: 24000 },
              output: { voice: voiceId },
            },
            delegation: { type: 'client' },
          },
        }),
      );
    });
    ws.addEventListener('message', (event) => {
      const raw = typeof event.data === 'string' ? event.data : String(event.data);
      let message;
      try {
        message = JSON.parse(raw);
      } catch {
        return;
      }
      const type = typeof message.type === 'string' ? message.type : '';
      types.add(type);
      if (type === 'session.started') {
        setTimeout(() => {
          if (settled || ws.readyState !== WebSocket.OPEN) return;
          ws.send(
            JSON.stringify({
              type: 'session.commentary.append',
              event_id: 'sample',
              delegation_id: null,
              content: sampleLine(name),
            }),
          );
          const noise = Buffer.alloc(12_000);
          for (let i = 0; i < noise.length; i += 2) {
            noise.writeInt16LE((Math.sin(i / 8) * 800) | 0, i);
          }
          ws.send(
            JSON.stringify({
              type: 'session.input_audio.append',
              event_id: 'cue',
              audio: noise.toString('base64'),
            }),
          );
        }, 200);
      }
      if (type === 'session.output_transcript.delta' && typeof message.delta === 'string') {
        transcript += message.delta;
        if (saidLine(transcript, name) && !tailTimer && !speechDoneTimer) beginTail();
      }
      if (type === 'session.output_audio.delta' && typeof message.delta === 'string') {
        const pcm = Buffer.from(message.delta, 'base64');
        chunks.push(pcm);
        total += pcm.length;
        let peak = 0;
        for (let i = 0; i < pcm.length; i += 2) {
          const sample = Math.abs(pcm.readInt16LE(i));
          if (sample > peak) peak = sample;
        }
        if (peak > SPEECH_PEAK) {
          lastLoudEnd = total;
          clearTimeout(tailTimer);
          tailTimer = null;
          scheduleQuietCheck();
        }
      }
    });
    ws.addEventListener('close', () => finish());
  });

for (const [voiceId, name] of selected) {
  const mp3Path = path.join(outDir, `${voiceId}.mp3`);
  if (fs.existsSync(mp3Path) && process.env.REGENERATE !== '1') {
    console.log(`Keeping ${path.relative(webAppRoot, mp3Path)}`);
    continue;
  }
  console.log(`Recording ${voiceId}...`);
  let pcm = Buffer.alloc(0);
  let transcript = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const recorded = await recordVoice(voiceId, name);
    pcm = recorded.pcm;
    transcript = recorded.transcript;
    console.log(`  events: ${recorded.types.join(', ')}`);
    if (transcript) console.log(`  said: ${transcript}`);
    if (saidLine(transcript, name) && finishedCleanly(pcm, transcript, name)) break;
    console.error(
      `  attempt ${attempt} missed a clean ending (${transcript || 'no transcript'}, ending peak ${endingPeak(pcm)})`,
    );
  }
  if (!finishedCleanly(pcm, transcript, name)) {
    console.error(`  ${voiceId} ended while the voice was still going`);
    continue;
  }
  const wavPath = path.join(outDir, `${voiceId}.wav`);
  writeWav(pcm, wavPath);
  const encoded = spawnSync(
    'ffmpeg',
    ['-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-qscale:a', '5', mp3Path],
    { stdio: 'ignore' },
  );
  fs.unlinkSync(wavPath);
  if (encoded.status !== 0) {
    console.error(`  ffmpeg failed for ${voiceId}`);
    continue;
  }
  console.log(`  wrote ${path.relative(webAppRoot, mp3Path)} (${pcm.length} bytes pcm)`);
}
