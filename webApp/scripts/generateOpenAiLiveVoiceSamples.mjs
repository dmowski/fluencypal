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

const recordVoice = (voiceId, name) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://api.openai.com/v1/live/sessions', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const chunks = [];
    const types = new Set();
    let transcript = '';
    let settled = false;
    let idle;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(hardStop);
      clearTimeout(idle);
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
    const hardStop = setTimeout(() => finish(), 16_000);
    const armIdle = () => {
      if (!transcript.toLowerCase().includes(name.toLowerCase())) return;
      clearTimeout(idle);
      idle = setTimeout(() => finish(), 1000);
    };

    ws.addEventListener('error', () => finish(new Error(`${voiceId}: websocket failed`)));
    ws.addEventListener('open', () => {
      ws.send(
        JSON.stringify({
          type: 'session.start',
          event_id: 'start',
          session: {
            model: 'gpt-live-1',
            instructions: `Your name is ${name}. Immediately say exactly this sentence, then stop: Hi, I'm ${name}. Let's practice speaking.`,
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
              content: `Hi, I'm ${name}. Let's practice speaking.`,
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
        armIdle();
      }
      if (type === 'session.output_audio.delta' && typeof message.delta === 'string') {
        chunks.push(Buffer.from(message.delta, 'base64'));
        armIdle();
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
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const recorded = await recordVoice(voiceId, name);
    pcm = recorded.pcm;
    transcript = recorded.transcript;
    console.log(`  events: ${recorded.types.join(', ')}`);
    if (transcript) console.log(`  said: ${transcript}`);
    if (transcript.includes(name)) break;
    let peak = 0;
    for (let i = 0; i < pcm.length; i += 2) {
      const sample = Math.abs(pcm.readInt16LE(i));
      if (sample > peak) peak = sample;
    }
    console.error(`  attempt ${attempt} missed the sample line (${pcm.length} bytes, peak ${peak})`);
  }
  if (!transcript.includes(name)) {
    console.error(`  ${voiceId} did not say the sample`);
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
