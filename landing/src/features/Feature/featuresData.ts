import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { FeatureData, FeaturesInfo } from './types';

const BOOK_LANDING_URL = 'https://book.fluencypal.com/landing';

export const getFeaturesData = (lang: SupportedLanguage): FeaturesInfo => {
  const i18n = getI18nInstance(lang);

  const features: FeatureData[] = [
    {
      id: 'learning-plan',
      title: i18n._('Personalized Learning Plan for English Practice'),
      subTitle: i18n._('Set goals with a guided survey and keep your plan updated as you improve.'),
      metaTitle: i18n._('Personalized Learning Plan for English Practice | FluencyPal'),
      metaDescription: i18n._(
        'Build a personalized English learning plan with AI. FluencyPal creates lessons and practice based on your goals, strengths, and weak areas.',
      ),
      keywords: [
        'personalized learning plan',
        'AI English learning plan',
        'English practice goals',
      ],
      content: i18n._(
        `## What it does

FluencyPal starts with a guided survey that helps create your personalized English learning plan. This is not a marketing form. It is a practical step that helps the AI understand your goal, your current level, and the areas where you need the most support.

## How it works

You describe:
- what you want to achieve
- where you feel confident
- where you struggle
- what kind of English practice you need most

Based on your answers, the AI asks follow-up questions and builds a plan around your real goal.

## Why it helps

Your plan is not static. As you keep practicing, FluencyPal updates it to reflect your progress, new weak points, and changing priorities.

This makes your English conversation practice more focused, more practical, and easier to apply in real conversations.`,
      ),
    },
    {
      id: 'ai-speaking-practice',
      title: i18n._('AI Speaking Practice for English Learners'),
      subTitle: i18n._(
        'Practice spoken English with AI calls, voice messages, and chat in one flow.',
      ),
      metaTitle: i18n._('AI Speaking Practice for English Learners | FluencyPal'),
      metaDescription: i18n._(
        'Practice speaking English with AI through live calls, voice messages, and chat. Improve fluency, confidence, and communication skills.',
      ),
      keywords: ['AI speaking practice', 'English speaking with AI', 'voice English practice'],
      content: i18n._(
        `## Practice spoken English in different ways

FluencyPal gives you several ways to practice speaking English with AI, so you can choose the format that fits your day, your confidence level, and your learning style.

## Available speaking modes

### Call Mode
Talk naturally with an AI English tutor and follow the transcript during the conversation.

### Voice Message Mode
Record your answer, review AI suggestions, improve your response, and send it when ready.

### Chat Mode
Type your reply when speaking out loud is not convenient.

## Extra support during conversation

You can:
- adjust AI speaking speed
- use transcripts to follow the conversation
- get help when you do not know what to say next

## Why it helps

While you practice, FluencyPal tracks mistakes and turns them into targeted improvement tasks. This helps you improve English speaking confidence, fluency, and speaking accuracy over time.`,
      ),
    },
    {
      id: 'personalized-grammar-rules',
      title: i18n._('Personalized English Grammar Practice with AI'),
      subTitle: i18n._(
        'Get grammar practice based on your real mistakes and your communication goals.',
      ),
      metaTitle: i18n._('Personalized English Grammar Practice with AI | FluencyPal'),
      metaDescription: i18n._(
        'Get personalized grammar rules based on your mistakes. Practice English grammar with explanations, quizzes, and AI conversation.',
      ),
      keywords: ['personalized grammar', 'English grammar with AI', 'grammar quiz practice'],
      content: i18n._(
        `## Grammar practice based on your real mistakes

After conversations, FluencyPal creates a personalized grammar list based on the errors you actually make while speaking or writing.

## What each rule includes

Each grammar item includes:
- a simple explanation
- clear examples
- a short quiz
- AI conversation practice for the same rule

## Goal-aligned preparation

FluencyPal can also prioritize grammar patterns based on the kind of English you need to use, such as:
- job interviews
- travel communication
- everyday conversations
- formal speaking

## How the learning loop works

You improve grammar in three steps:
1. understand the rule
2. practice it in a quiz
3. apply it in real conversation

## Why it helps

This approach makes grammar practice more personal and more practical. Instead of reviewing random rules, you focus on the patterns that are slowing down your real English communication and the rules you are most likely to need next.`,
      ),
    },
    {
      id: 'interactive-lesson',
      title: i18n._('Daily Interactive English Lessons You Speak Out Loud'),
      subTitle: i18n._(
        'Learn one grammar form a day: read it, say it, get feedback, then talk for two minutes.',
      ),
      metaTitle: i18n._('Daily Interactive English Speaking Lessons | FluencyPal'),
      metaDescription: i18n._(
        'Practice one English grammar form a day by speaking. FluencyPal teaches the rule, you read it aloud, record answers, and get instant AI feedback.',
      ),
      keywords: [
        'interactive English lessons',
        'daily English speaking lesson',
        'grammar speaking practice',
        'AI English lessons',
        'present perfect vs past simple practice',
      ],
      content: i18n._(
        `## What it does

Interactive Lessons are a daily speaking lesson on your FluencyPal dashboard. Each lesson trains **one checkable English form** — articles, a tense contrast, a verb pattern, a chunk — not vague advice like “speak more clearly.”

You read a short how-to, read a text that uses the form aloud, answer by voice, get feedback, then finish with a two-to-three-minute open talk. Tomorrow’s lesson is generated from what you actually said.

## How it works

1. Open today’s lesson (from the dashboard card or your daily tasks).
2. Read a 4–5 paragraph how-to: when to use the form, when not to, with bolded examples.
3. **Read a short text aloud** that uses the form several times. You can listen first.
4. Record spoken answers to short prompts. FluencyPal checks whether you used the form.
5. Finish with an open talk on a concrete topic. This long sample is what the next lesson is built from.
6. After you finish, you get spoken results. The next lesson is prepared in the background.

You can skip a lesson if the form is not useful today. The replacement teaches a different category instead of repeating a close variant.

## What you practice

Lessons stay on one form so you can hear yourself get it right. Typical contrasts include:

- [present perfect vs past simple](/blog/present-perfect-vs-past-simple) — *I have sent* vs *I sent yesterday*
- [a, an, and the](/blog/english-articles-a-an-the) — *a demo video* vs *the landing page*
- [gerund vs infinitive](/blog/gerund-vs-infinitive) — *stop doing* vs *stop to do*
- [second vs third conditional](/blog/second-vs-third-conditional) — *if I were* vs *if I had known*

The first lesson uses your recent conversations or your goal. Later lessons use your open talks, so the grammar stays connected to how you actually speak.

## Why it helps

Grammar quizzes test recognition. Speaking tests retrieval. Interactive Lessons close that gap: you learn the rule, you say it, you get feedback on that form, and the next day you get a new form instead of looping the same *-ing* lesson.

It is built for a daily habit. One finished lesson marks the day done. Open it again tomorrow and the next form is waiting.`,
      ),
    },
    {
      id: 'vocabulary-practice',
      title: i18n._('AI Vocabulary Practice for Real Conversations'),
      subTitle: i18n._(
        'Learn goal-based vocabulary and use it in guided English conversation practice.',
      ),
      metaTitle: i18n._('AI Vocabulary Practice for Real Conversations | FluencyPal'),
      metaDescription: i18n._(
        'Learn useful English words based on your goals. Practice vocabulary in context with AI lessons and guided conversation.',
      ),
      keywords: [
        'AI vocabulary practice',
        'context vocabulary learning',
        'English words for speaking',
      ],
      content: i18n._(
        `## Learn vocabulary that matches your goals

FluencyPal builds vocabulary lessons around the words that are most useful for your personal goal and current level.

## How it works

At the start of each lesson, the system selects words that match:
- your learning objective
- your current vocabulary level
- the situations you want to handle in English

Then the AI teacher explains the words and helps you use them in guided conversation.

## Why it helps

You do not just memorize isolated vocabulary. You practice words in context, which makes them easier to remember and easier to use in real speech.

At the same time, FluencyPal continues improving your grammar guidance in parallel.`,
      ),
    },
    {
      id: 'role-play',
      title: i18n._('English Role Play Practice with AI'),
      subTitle: i18n._('Practice realistic scenarios connected to your goals.'),
      metaTitle: i18n._('English Role Play Practice with AI | FluencyPal'),
      metaDescription: i18n._(
        'Practice real-life English conversations with AI role plays. Prepare for job interviews, daily situations, and goal-based speaking tasks.',
      ),
      keywords: ['English role play', 'job interview role play', 'real-life speaking scenarios'],
      content: i18n._(
        `## Practice real-life English scenarios

FluencyPal uses AI role plays to help you practice conversations that match your real needs.

## Goal-based role plays

If your goal is related to work, your role plays may include:
- recruiter screening
- job interviews
- technical interviews
- salary discussions

## Everyday speaking scenarios

You also get ready-made role plays for practical communication, such as:
- shop conversations
- support calls
- everyday speaking situations

## Why it helps

Role play practice helps you prepare for real conversations before they happen. It makes English speaking practice more realistic, more useful, and easier to transfer into everyday life.`,
      ),
    },
    {
      id: 'custom-role-play',
      title: i18n._('Create Custom English Role Plays with AI'),
      subTitle: i18n._('Build your own speaking scenario for specific needs.'),
      metaTitle: i18n._('Create Custom English Role Plays with AI | FluencyPal'),
      metaDescription: i18n._(
        'Build your own English role play scenario with AI. Practice speaking in situations that match your personal or professional needs.',
      ),
      keywords: ['custom role play', 'custom English scenarios', 'personalized speaking practice'],
      content: i18n._(
        `## Create your own speaking scenario

Custom Role Play lets you build a conversation around your own situation instead of choosing only from predefined options.

## What you can customize

You can create role plays for:
- work meetings
- travel situations
- customer communication
- personal speaking challenges
- any specific English scenario you want to practice

## Why it helps

This gives you more control over your learning and makes speaking practice highly relevant to your real life.

The result is personalized AI conversation practice that matches your exact context.`,
      ),
    },
    {
      id: 'interactive-stories',
      title: i18n._('Interactive English Stories with Quiz Practice'),
      subTitle: i18n._('Improve reading, listening, and sentence structure.'),
      metaTitle: i18n._('Interactive English Stories with Quiz Practice | FluencyPal'),
      metaDescription: i18n._(
        'Improve reading, listening, and sentence structure with interactive English stories, translations, and word-by-word quizzes.',
      ),
      keywords: [
        'interactive stories',
        'story-based English learning',
        'reading and listening practice',
      ],
      content: i18n._(
        `## Improve English through interactive stories

With Stories, you listen to English content while reading the original text and translation side by side.

## How the quiz works

After listening, you complete a quiz where you rebuild parts of the text word by word. This helps you notice:
- sentence structure
- word order
- common language patterns

## Why it helps

Stories combine reading, listening, and active reconstruction. This makes them a practical alternative to passive content consumption and a useful way to practice during commutes or short breaks.`,
      ),
    },
    {
      id: 'books-reader',
      title: i18n._('FluencyPal Books — Read and Learn English'),
      subTitle: i18n._(
        'Upload EPUBs, translate words while you read, highlight passages, and listen with text-to-speech.',
      ),
      metaTitle: i18n._('FluencyPal Books — Read and Learn English | FluencyPal'),
      metaDescription: i18n._(
        'Read books in English with instant word translation, highlights, text-to-speech, and a synced library. Upload EPUBs or browse free classics.',
      ),
      keywords: [
        'English reading practice',
        'read books to learn English',
        'EPUB reader for language learners',
        'FluencyPal Books',
      ],
      content: i18n._(
        `## Read real books while you learn English

FluencyPal Books is a focused reading app for language learners. It is separate from the main practice dashboard so you can stay in the book while you study vocabulary, grammar in context, and listening skills.

Learn more on the [FluencyPal Books landing page](https://book.fluencypal.com/landing).

## What you can do

- upload your own EPUB files, or convert PDF and DOCX
- click any word for an instant translation, or enable hover translation
- highlight passages and jump back to them later
- listen with browser text-to-speech while you read
- browse free public-domain classics from the Gutenberg library
- sync your library, highlights, and reading progress across devices

## Why it helps

Reading long-form English connects vocabulary and grammar to real stories and ideas. FluencyPal Books keeps that experience calm and book-first, with learning tools one tap away instead of breaking your flow.

Open the [Books landing page](https://book.fluencypal.com/landing) to try a live demo of the reader and start reading.`,
      ),
    },
    {
      id: 'daily-questions',
      title: i18n._('Daily English Speaking Questions'),
      subTitle: i18n._('Answer one new prompt every day and build confidence.'),
      metaTitle: i18n._('Daily English Speaking Questions | FluencyPal'),
      metaDescription: i18n._(
        'Practice answering a new English question every day. Build confidence, express ideas, and improve speaking with daily prompts.',
      ),
      keywords: ['daily speaking questions', 'daily English prompts', 'express ideas in English'],
      content: i18n._(
        `## Practice speaking every day

Daily Questions gives you one new English speaking prompt each day.

## What you practice

This feature helps you practice:
- expressing opinions
- organizing thoughts
- answering unexpected questions
- speaking with more confidence

## Extra value

You can also see answers from other learners, compare ideas, and discover new ways to respond.

This makes daily practice simple, consistent, and useful for real spoken English.`,
      ),
    },
    {
      id: 'news-discussion',
      removed: true,
      title: i18n._('English Practice with Today\u2019s News'),
      subTitle: i18n._('Read AI-rewritten news at your level and discuss the story with the AI.'),
      metaTitle: i18n._('English Practice with Today\u2019s News | FluencyPal'),
      metaDescription: i18n._(
        'Practice English with today\u2019s news. FluencyPal rewrites real headlines at your level and lets you discuss the story with an AI tutor.',
      ),
      keywords: [
        'English news practice',
        'learn English with news',
        'AI news discussion',
        'current events English',
      ],
      content: i18n._(
        `## Practice English with real current events

The News feature turns today\u2019s real headlines into English practice material. Stories are pulled from gNews for your country, translated into the language you are learning, and rewritten by AI at a complexity level that matches your skill.

## How it works

Each day FluencyPal:
- fetches current news for your country (or any supported country you choose)
- rewrites the article at three complexity levels so it stays readable for you
- shows the story on your dashboard with the original image and a short headline

You can switch the news country and complexity level at any time from the news settings.

## Discuss the story with AI

From the news card you can open the full article and start a voice or text discussion about it with the AI tutor. The AI uses the article as the topic, so you practice:
- expressing opinions about real events
- summarizing what you read
- asking and answering questions about the story
- using vocabulary that appears in everyday news

## Why it helps

Real news gives you something fresh to talk about every day, which keeps practice interesting and connected to the world you live in. Because the text is rewritten at your level, you stay challenged without getting stuck on unfamiliar wording, and the AI discussion turns a passive reading session into active English speaking practice.

Completing a news discussion also counts toward your daily tasks, so the habit fits naturally into the rest of your learning routine.`,
      ),
    },
    {
      id: 'debates',
      removed: true,
      title: i18n._('English Debate Practice with Other Learners'),
      subTitle: i18n._('Practice structured speaking with real opponents.'),
      metaTitle: i18n._('English Debate Practice with Other Learners | FluencyPal'),
      metaDescription: i18n._(
        'Practice spoken English through structured debates. Record answers, compare arguments, and improve speaking in a guided format.',
      ),
      keywords: ['English debates', 'structured speaking practice', 'argument speaking skills'],
      content: i18n._(
        `## Structured debate practice with other learners

Debates let you challenge other learners and practice spoken English in a guided format.

## How it works

Both participants:
- receive the same questions
- record their answers
- submit responses to the system

After that, FluencyPal selects a winner, explains the reasoning, and awards points.

## Why it helps

This format makes speaking with other people less stressful while still helping you improve:
- clarity
- structure
- argumentation
- confidence in spoken English`,
      ),
    },
    {
      id: 'language-games',
      title: i18n._('English Learning Games for Vocabulary and Speaking'),
      subTitle: i18n._(
        'Use gamified tasks to practice vocabulary, sentence building, and spoken English.',
      ),
      metaTitle: i18n._('English Learning Games for Vocabulary and Speaking | FluencyPal'),
      metaDescription: i18n._(
        'Improve English through interactive games for vocabulary, sentence building, reading, and speaking while earning points.',
      ),
      keywords: ['English learning games', 'gamified language practice', 'vocabulary games'],
      content: i18n._(
        `## Gamified English practice

Game mode turns language learning into a set of interactive challenges that reward regular practice.

## Types of activities

You can practice through tasks such as:
- translating words
- building sentences
- reading short texts
- answering speaking questions

## Why it helps

You earn points for correct answers, which adds motivation and makes it easier to stay consistent.

Gamified learning helps improve vocabulary, reading, sentence building, and speaking in a more engaging format.`,
      ),
    },
    {
      id: 'progress-chart',
      title: i18n._('English Progress Chart and Skill Tracking'),
      subTitle: i18n._(
        'See how your grammar, vocabulary, fluency, and confidence improve over time.',
      ),
      metaTitle: i18n._('English Progress Chart and Skill Tracking | FluencyPal'),
      metaDescription: i18n._(
        'Track your English improvement with FluencyPal progress charts. See trends in grammar, vocabulary, fluency, and confidence after every practice session.',
      ),
      keywords: [
        'English progress tracking',
        'language learning chart',
        'fluency improvement stats',
      ],
      content:
        '![Progress Chart](/landing/progressChart.webp)\n\n' +
        i18n._(
          `\n## See your English improvement over time

FluencyPal automatically tracks your performance after every conversation, role play, and daily question answer. The Progress Chart turns that data into a clear visual timeline so you can see where you started and how far you have come.

## What is measured

After each practice session, the AI evaluates your response across four metrics:

- **Grammar** — accuracy of sentence structure and grammar rules
- **Vocabulary** — range and appropriateness of the words you use
- **Fluency** — how naturally and smoothly you express yourself
- **Confidence** — how assertive and clear your communication sounds

Each metric is scored independently, so you get a detailed picture of your strengths and the areas that still need work.

## How the chart works

The chart shows your scores on a daily timeline. You can:
- switch between metrics to focus on one skill at a time
- view different time periods: last 30 days, last 3 months, last 6 months, or all time
- see a smoothed trend line that filters out day-to-day variation and highlights your real direction of improvement

## What the data shows

FluencyPal users who practice daily see an average increase of **5% per month across all metrics**. That includes grammar accuracy, vocabulary range, fluency, and speaking confidence.

The chart makes that growth visible. Even small improvements become easy to recognize when you can see the trend over weeks and months.

## Why it helps

Progress tracking does more than record what happened. It shows you what is working, keeps you motivated during slow periods, and helps you decide where to focus next. When your chart shows momentum, it becomes easier to keep the habit going.`,
        ),
    },
    {
      id: 'community',
      title: i18n._('English Learning Community and Progress Sharing'),
      subTitle: i18n._('Ask questions, share progress, and stay motivated together.'),
      metaTitle: i18n._('English Learning Community and Progress Sharing | FluencyPal'),
      metaDescription: i18n._(
        'Join the FluencyPal community to ask questions, share progress, discuss learning challenges, and stay motivated.',
      ),
      keywords: ['English learning community', 'language learning support', 'progress sharing'],
      content: i18n._(
        `## Learn with other people

FluencyPal includes community chats where learners can interact beyond one-on-one AI practice.

## What you can do

In the community, you can:
- ask questions
- share progress
- discuss learning challenges
- stay motivated with other learners

## Why it helps

This adds a social layer to language learning and gives you more opportunities to use English in meaningful ways.

Some community functions may require age verification depending on the feature.`,
      ),
    },
    {
      id: 'leaderboard',
      title: i18n._('English Learning Leaderboard and Rewards'),
      subTitle: i18n._('Earn points across the platform and unlock rewards.'),
      metaTitle: i18n._('English Learning Leaderboard and Rewards | FluencyPal'),
      metaDescription: i18n._(
        'Earn points for practice and climb the FluencyPal leaderboard. Top users unlock rewards through active English learning.',
      ),
      keywords: ['English leaderboard', 'language learning rewards', 'practice points'],
      content: i18n._(
        `## Earn points and stay motivated

FluencyPal tracks your activity across the platform and rewards regular practice with points.

## How points are earned

You can earn points through:
- AI conversations
- stories quizzes
- daily questions
- community activity
- game mode

## Why it helps

The leaderboard creates a clear motivation loop for long-term consistency. Top users can unlock rewards while they remain at the top.

This makes progress more visible and practice more engaging.`,
      ),
    },
  ];

  return {
    features,
  };
};

export const getFeatureById = (lang: SupportedLanguage, featureId: string) => {
  const { features } = getFeaturesData(lang);
  return features.find((feature) => feature.id === featureId);
};
