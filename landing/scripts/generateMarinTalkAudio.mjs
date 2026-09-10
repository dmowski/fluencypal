/**
 * Generates the looping Marin talk clip for the landing webcam preview.
 * Run: OPENAI_API_KEY=... node scripts/generateMarinTalkAudio.mjs
 *
 * About two minutes of gentle free-conversation speech after warm-up.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const text = `Hi, I’m Marin. Don’t worry about mistakes — I’ll guide you gently.

That warm-up is done, so now we can just talk. Nothing to perform. Nothing to get perfect. I’m here, and we can take this as slowly as you need.

Let’s start with something easy. Tell me about your day. Not the whole day — just one small piece of it. Maybe you had coffee this morning. Maybe you were tired. Maybe something small made you smile, or maybe it was an ordinary day and nothing special happened. That’s still worth talking about.

If a full sentence feels like too much, start with a few words. “I worked.” “I stayed home.” “I’m a little tired today.” We can grow it from there, together.

You don’t have to sound impressive. You don’t even have to sound fluent. Clear is enough. Honest is enough. I’m not grading you.

I’ll give you an example, so it feels less abstract. My day was quiet. I made tea. I looked out the window for a minute. Then I sat down to talk with you. See? Simple. That’s the kind of English people actually use.

We can stay with your day, or we can move somewhere else. Work is a good one, if you have it. What did you do? Was it busy, or slow? Did you talk to anyone? Even “I answered emails” is a real sentence. We can make it longer if you want: “I answered emails, and then I had a short meeting.” That’s it. That’s conversation.

Or tell me about the evening. Some people cook. Some people watch something. Some people just rest and don’t want to talk about it, and that’s fine too. You could say, “I usually cook at home.” Or, “I like to walk after work.” Small details like that are how fluency grows — not big speeches.

If you want, we can talk about a place you’d like to visit when you have time. You don’t need the perfect words for it. “I want to see the sea.” “I want to visit a city with old streets.” I’ll understand. And if the word isn’t there, describe it. “It’s a place with a lot of trees.” That’s good English. Really.

There’s no rush here. If you need a second to think, take it. If you want to start a sentence again, start again. People do that in real conversations all the time.

And if you get stuck, that’s okay too. You can say, “I don’t know the word.” You can describe it. You can even switch to a simpler idea. I’ll wait. I’ll help you find the words.

Whenever you’re ready, tell me one thing about your day. Just one. I’m listening.`;

const instructions = `Your voice is soft and gentle, with a calming presence that puts others at ease. Speak as a patient English teacher in a live one-on-one conversation. Speak slowly — slower than normal audiobook pace — with a short pause after each sentence. Sound warm and natural, not scripted, not like an advertisement. Do not rush.`;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const landingRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const filePath = path.join(landingRoot, 'public', 'call', 'marin', 'talk.mp3');

const client = new OpenAI({ apiKey });
const mp3 = await client.audio.speech.create({
  model: 'gpt-audio-1.5',
  voice: 'marin',
  input: text,
  instructions,
});

fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, Buffer.from(await mp3.arrayBuffer()));
console.log(`Wrote ${path.relative(landingRoot, filePath)}`);
