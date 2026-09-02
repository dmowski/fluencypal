import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const openings = [
  {
    id: 'alias-game',
    voice: 'shimmer',
    text: "Hello, I'm your AI partner for the Alias game. I'm ready to guess your word. Please describe it to me.",
  },
  {
    id: 'hotel-check-in',
    voice: 'verse',
    text: 'Good afternoon. Welcome to the Grand Skyline Hotel. My name is Onyx. Are you checking in today? May I have the name on your reservation, please?',
  },
  {
    id: 'small-talk-with-a-stranger',
    voice: 'marin',
    text: "Hey there, I'm Fable. This is my first time at an event like this. How about you? Enjoying yourself so far?",
  },
  {
    id: 'meeting-dog-owners-in-the-park',
    voice: 'shimmer',
    text: "Hi there! I'm Jade, and this little guy is Milo. He's always excited to meet new friends at the park. Your pup looks so energetic—do you two come here often?",
  },
  {
    id: 'in-the-restaurant',
    voice: 'ash',
    text: "Hello, I'm Ash, your server for today. Welcome to our restaurant! Is there anything in particular you're craving, or would you like me to suggest some popular dishes?",
  },
  {
    id: 'assistant-chat',
    voice: 'ash',
    text: 'Hi there, how can I help you today?',
  },
  {
    id: 'calling-technical-support',
    voice: 'shimmer',
    text: "Hello, you've reached TechEase Support. I'm Shimmer, and I'm here to help. Could you describe the issue you're experiencing so I can guide you through some possible solutions?",
  },
  {
    id: 'buying-a-train-ticket',
    voice: 'ash',
    text: "Hi there, I'm Echo at Central Station. How can I help you with your travel plans today? Are you headed somewhere local or out of town?",
  },
  {
    id: 'at-the-grocery-store',
    voice: 'verse',
    text: "Hi, I'm Nova here at FreshMart. Is there anything specific you're looking for today, or would you like some help finding the best deals?",
  },
  {
    id: 'making-a-doctors-appointment',
    voice: 'ash',
    text: "Hello, you've reached Dr. Avery's office. This is Ash speaking. May I have your name, and what's the reason for your appointment? Also, let me know if you have any date preferences.",
  },
  {
    id: 'talking-to-a-doctor',
    voice: 'ash',
    text: "Good day, I'm Dr. Ash. Please make yourself comfortable. I understand you've come in with some concerns—could you describe your symptoms for me?",
  },
  {
    id: 'returning-an-item-in-a-store',
    voice: 'shimmer',
    text: "Hi, I'm Sage at the Customer Service desk. I'm sorry to hear you need to return something. Could you tell me what went wrong with the item?",
  },
  {
    id: 'meeting-with-psychologist',
    voice: 'shimmer',
    text: "Hello, I'm Sage, your psychologist today. I'm here to listen and support you. Could you tell me what's on your mind?",
  },
  {
    id: 'job-interview',
    voice: 'marin',
    text: "Hello, I'm Marin, a recruiter at Northstar. Thank you for joining me today. To begin, could you give me a brief introduction to your professional background and explain what interested you in this position?",
  },
  {
    id: 'supportive-friend',
    voice: 'marin',
    text: "I'm here. Take your time — what's been on your mind?",
  },
  {
    id: 'cynical-friend',
    voice: 'shimmer',
    text: "what's wrong with this world, I don't understand humans",
  },
  {
    id: 'custom-conversation',
    voice: 'shimmer',
    text: 'Hello, I understand you wanted to discuss an issue with your recent order. Could you tell me what happened?',
  },
  {
    id: 'workplace-discrimination-check',
    voice: 'marin',
    text: "Hi. You can share any situation that's been on your mind — especially if it felt off, uncomfortable, or hard to explain. Take your time. We'll look at it calmly and try to understand it together.",
  },
  {
    id: 'stupid-interview',
    voice: 'verse',
    text: "Hi, my name is Verse, I'll be your interviewer today. I've looked through your profile, and I think we can get started. So… quick question: if you were a spreadsheet function, which one would you be — and why?",
  },
];

const onlyId = process.argv[2];
const toGenerate = onlyId ? openings.filter((opening) => opening.id === onlyId) : openings;

if (onlyId && toGenerate.length === 0) {
  console.error(`Unknown scenario id: ${onlyId}`);
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const webAppRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(webAppRoot, 'public', 'audio', 'role-openings');
fs.mkdirSync(outDir, { recursive: true });

const client = new OpenAI({ apiKey });

for (const opening of toGenerate) {
  const filePath = path.join(outDir, `${opening.id}.mp3`);
  const mp3 = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: opening.voice,
    input: opening.text,
    instructions: 'Speak clearly and naturally.',
  });
  fs.writeFileSync(filePath, Buffer.from(await mp3.arrayBuffer()));
  console.log(`Wrote ${path.relative(webAppRoot, filePath)}`);
}
