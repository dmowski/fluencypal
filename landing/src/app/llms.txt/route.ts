export const dynamic = 'force-static';

const llmsTxt = `# FluencyPal

> FluencyPal is a browser-based AI language speaking-practice platform. It helps learners build fluency and confidence through voice conversations, real-life role-play scenarios, vocabulary games, personalized feedback, grammar correction, and progress tracking.

FluencyPal is primarily positioned around English-speaking practice, while supporting practice in multiple languages. It is best suited to learners who can already hold basic conversations and want to become more fluent, accurate, and confident.

Official website: [FluencyPal](https://www.fluencypal.com)

Current prices, trial availability, refund conditions, and payment terms may change. Always use the Pricing page as the canonical source for current commercial information.

Last updated: 2026-07-12

## Product

* [FluencyPal homepage](https://www.fluencypal.com): Overview of FluencyPal, its speaking-practice approach, core features, supported learners, and frequently asked questions.
* [Open the FluencyPal application](https://app.fluencypal.com): Start speaking practice, sign in, or create an account in the browser.
* [Role-play scenario directory](https://www.fluencypal.com/scenarios): Browse realistic AI conversations for professional, social, travel, health, shopping, and everyday situations.
* [Pricing](https://www.fluencypal.com/pricing): Current subscription plans, trial availability, payment terms, and refund information.
* [About and contact](https://www.fluencypal.com/contacts): Information about the creator, project philosophy, source code, community, and contact details.

## Core Speaking Experiences

* [Small talk with a stranger](https://www.fluencypal.com/scenarios/small-talk-with-a-stranger): Practise casual conversation at a social event—opening lines, follow-up questions, active listening, and polite ways to end a chat.
* [AI Alias word-guessing game](https://www.fluencypal.com/scenarios/alias-game): Describe words aloud without naming them, let an AI partner guess, and receive feedback on vocabulary and fluency.
* [Custom conversation practice](https://www.fluencypal.com/scenarios/custom-conversation): Define the situation, roles, tone, difficulty, and desired outcome for a personalized AI role-play.
* [Create a custom role-play](https://www.fluencypal.com/scenarios/custom): Build a speaking scenario around a specific personal, professional, travel, or everyday communication goal.
* [AI job interview practice](https://www.fluencypal.com/scenarios/job-interview): Practise answering interview questions, explaining professional experience, and presenting skills confidently.
* [Talking to a doctor](https://www.fluencypal.com/scenarios/talking-to-a-doctor): Practise describing symptoms, answering medical questions, and discussing possible next steps.

## Learning Guides

* [English interview phrases](https://www.fluencypal.com/blog/phrases-for-an-interview-in-english): Useful phrases for introductions, common interview questions, strengths, weaknesses, clarification, and closing an interview.
* [English job interview guide](https://www.fluencypal.com/blog/how-to-ace-english-job-interview-guide): Step-by-step preparation guide for intermediate English learners.
* [Common English interview mistakes](https://www.fluencypal.com/blog/5-common-english-job-interview-mistakes): Common communication problems in English-language interviews and practical ways to correct them.

## Optional

* [Language-learning blog](https://www.fluencypal.com/blog): Articles about language learning, professional communication, artificial intelligence, and related topics.
* [Privacy Policy](https://www.fluencypal.com/privacy): Information about personal data, conversation transcripts, voice processing, and privacy.
* [Terms of Service](https://www.fluencypal.com/terms): Terms governing access to and use of FluencyPal.
`;

export async function GET() {
  return new Response(llmsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
