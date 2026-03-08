import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { FeatureData, FeaturesInfo } from './types';

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
      subTitle: i18n._('Get grammar rules based on your real mistakes.'),
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

## How the learning loop works

You improve grammar in three steps:
1. understand the rule
2. practice it in a quiz
3. apply it in real conversation

## Why it helps

This approach makes grammar practice more personal and more practical. Instead of reviewing random rules, you focus on the patterns that are slowing down your real English communication.`,
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
      id: 'goal-based-grammar-practice',
      title: i18n._('Goal-Based English Grammar Practice'),
      subTitle: i18n._(
        'Practice grammar your goals require, even before recurring mistakes appear.',
      ),
      metaTitle: i18n._('Goal-Based English Grammar Practice | FluencyPal'),
      metaDescription: i18n._(
        'Practice grammar that matches your learning goals. FluencyPal focuses on the English rules most useful for your real conversations.',
      ),
      keywords: [
        'goal-based grammar',
        'practical grammar practice',
        'grammar for conversation goals',
      ],
      content: i18n._(
        `## Grammar practice aligned with your goal

FluencyPal does not only react to your mistakes. It also prepares grammar practice based on the kind of English you want to use.

## How it works

If your goal involves:
- job interviews
- travel communication
- everyday conversations
- formal speaking

the system can highlight grammar patterns that are especially useful for those situations.

## Why it helps

This makes grammar practice more strategic. You work on the rules that are likely to matter in your future conversations, not only the mistakes you already made.

That helps you prepare for important situations before they happen.`,
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
      id: 'debates',
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
