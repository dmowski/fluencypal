/**
 * Generates the looping Marin talk clip for the landing webcam preview.
 * Run: OPENAI_API_KEY=... node scripts/generateMarinTalkAudio.mjs
 *
 * About two minutes of honest FluencyPal teacher speech: hard, daily, rewarding.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const text = `Hi, I’m Marin, from FluencyPal.

I want to be honest with you. Getting good at speaking is hard. You can understand English. You can read it. And then a real conversation starts, and the words just… don’t come. That freeze? That’s not you failing. That’s how this actually feels for most people.

Apps like to pretend it’s easy. It isn’t. Your mouth has to catch up with your mind. You have to be a little uncomfortable, on purpose, again and again.

What matters is coming back. Not a perfect hour on Sunday. A little practice, every day. Ten minutes. Five, if that’s all you’ve got. Speaking out loud, even when you don’t feel ready. That’s how fluency is built. Quietly. Daily.

Some days you’ll sound worse than yesterday. You’ll forget a simple word. You’ll start a sentence and stop. That’s still practice. That’s still the work.

And then, one day, it pays you back. You answer without translating first. You tell a colleague something and it just comes out. You hang up and think — wait. I just did that. That feeling is the reward. It’s small, and it’s real, and it only shows up if you keep showing up.

I’m here for that. Not for perfect grammar. For you, speaking a little every day, until it stops feeling so hard.

Whenever you’re ready, we can start.`;

const instructions = `Your voice is soft and gentle, with a calming presence that puts others at ease. Speak like a real FluencyPal teacher on a live call: honest, warm, and human. Use natural pauses, as if you are thinking with the person, not reading a script. Do not sound like an advertisement.`;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const landingRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const filePath = path.join(landingRoot, 'public', 'call', 'marin', 'talk.mp3');

const client = new OpenAI({ apiKey });
const mp3 = await client.audio.speech.create({
  model: 'gpt-4o-mini-tts',
  voice: 'marin',
  input: text,
  instructions,
});

fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, Buffer.from(await mp3.arrayBuffer()));
console.log(`Wrote ${path.relative(landingRoot, filePath)}`);
