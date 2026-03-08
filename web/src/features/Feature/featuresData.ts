import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { FeatureData, FeaturesInfo } from './types';

export const getFeaturesData = (lang: SupportedLanguage): FeaturesInfo => {
  const i18n = getI18nInstance(lang);

  const features: FeatureData[] = [
    {
      id: 'learning-plan',
      title: i18n._('Personalized Learning Plan for English Practice'),
      subTitle: i18n._('Start with a smart survey and keep refining your plan over time.'),
      metaTitle: i18n._('Personalized Learning Plan for English Practice | FluencyPal'),
      metaDescription: i18n._(
        'Build a personalized English learning plan with AI. FluencyPal creates lessons and practice based on your goals, strengths, and weak areas.',
      ),
      keywords: [
        i18n._('personalized learning plan'),
        i18n._('AI English learning plan'),
        i18n._('English practice goals'),
      ],
      content: i18n._(
        `When you begin using FluencyPal, you complete a guided survey that acts as a real learning tool. The most important step is describing your goal honestly: what you want to achieve, where you feel weak, and where you already feel confident.

Based on your input, the AI asks follow-up questions to build a plan that matches your level and purpose. The plan is not fixed. As you practice, FluencyPal updates it to reflect your progress and new weak points.

This keeps your lessons practical and focused on what matters most for your real conversations.`,
      ),
    },
    {
      id: 'ai-speaking-practice',
      title: i18n._('AI Speaking Practice for English Learners'),
      subTitle: i18n._('Practice with live calls, voice messages, and chat.'),
      metaTitle: i18n._('AI Speaking Practice for English Learners | FluencyPal'),
      metaDescription: i18n._(
        'Practice speaking English with AI through live calls, voice messages, and chat. Improve fluency, confidence, and communication skills.',
      ),
      keywords: [
        i18n._('AI speaking practice'),
        i18n._('English speaking with AI'),
        i18n._('voice English practice'),
      ],
      content: i18n._(
        `FluencyPal gives you multiple speaking modes so practice fits your day and your confidence level.

In Call Mode, you talk naturally with an AI avatar and can follow a transcript while speaking. In Voice Message Mode, you record a response, review AI suggestions, and re-record before sending. In Chat Mode, you type your reply when speaking out loud is not convenient.

You can also adjust AI speaking speed to match your listening level. While you practice, FluencyPal keeps track of mistakes and turns them into targeted improvement tasks.`,
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
      keywords: [
        i18n._('personalized grammar'),
        i18n._('English grammar with AI'),
        i18n._('grammar quiz practice'),
      ],
      content: i18n._(
        `After conversations, FluencyPal creates a personalized grammar list from your actual errors.

Each rule includes a simple explanation, examples, and a short quiz so you can reinforce the structure quickly. Then you can practice the same rule in live conversation with an AI teacher.

This creates a three-step loop: understand the rule, practice it in a quiz, and apply it in real speaking.`,
      ),
    },
    {
      id: 'vocabulary-practice',
      title: i18n._('AI Vocabulary Practice for Real Conversations'),
      subTitle: i18n._('Learn words that match your goals and use them in context.'),
      metaTitle: i18n._('AI Vocabulary Practice for Real Conversations | FluencyPal'),
      metaDescription: i18n._(
        'Learn useful English words based on your goals. Practice vocabulary in context with AI lessons and guided conversation.',
      ),
      keywords: [
        i18n._('AI vocabulary practice'),
        i18n._('context vocabulary learning'),
        i18n._('English words for speaking'),
      ],
      content: i18n._(
        `Based on your learning goal, FluencyPal builds vocabulary lessons around words that are useful for your real situations.

At the start of each lesson, the system selects words that fit your level and objective. You do not only memorize them. You practice them through guided AI conversation so they become usable in speech.

Grammar guidance continues in parallel, so your vocabulary and sentence accuracy improve together.`,
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
      keywords: [
        i18n._('English role play'),
        i18n._('job interview role play'),
        i18n._('real-life speaking scenarios'),
      ],
      content: i18n._(
        `FluencyPal creates role plays from your personal goals. If your goal is to get a job in English, your scenarios can include recruiter screening, technical interviews, and salary discussions.

In addition to goal-based scenarios, you also get ready-made role plays for everyday communication, such as support calls, shop conversations, and practical speaking tasks.

This makes speaking practice realistic and directly tied to what you need outside the app.`,
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
      keywords: [
        i18n._('custom role play'),
        i18n._('custom English scenarios'),
        i18n._('personalized speaking practice'),
      ],
      content: i18n._(
        `Need a specific scenario that is not in the default list? Custom Role Play lets you define your own context and conditions.

You can tailor the situation to your job, travel plans, meetings, or any personal communication challenge. This gives you full control over what you practice.

The result is targeted speaking training that matches your exact real-world context.`,
      ),
    },
    {
      id: 'goal-based-grammar-practice',
      title: i18n._('Goal-Based English Grammar Practice'),
      subTitle: i18n._('Practice rules that matter for your goals.'),
      metaTitle: i18n._('Goal-Based English Grammar Practice | FluencyPal'),
      metaDescription: i18n._(
        'Practice grammar that matches your learning goals. FluencyPal focuses on the English rules most useful for your real conversations.',
      ),
      keywords: [
        i18n._('goal-based grammar'),
        i18n._('practical grammar practice'),
        i18n._('grammar for conversation goals'),
      ],
      content: i18n._(
        `FluencyPal prioritizes grammar patterns that are most relevant to your goals.

If you need formal speaking for interviews, travel communication, or everyday conversation, the system highlights the most useful rules for those contexts.

This keeps grammar practical, focused, and easier to apply in real life.`,
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
        i18n._('interactive stories'),
        i18n._('story-based English learning'),
        i18n._('reading and listening practice'),
      ],
      content: i18n._(
        `With Stories, you listen to content while seeing original text and translation side by side.

After listening, you complete quizzes where you rebuild text word by word. This helps you absorb sentence structure and improve comprehension.

It is a practical alternative to passive content consumption and works well for practice during commutes or short breaks.`,
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
      keywords: [
        i18n._('daily speaking questions'),
        i18n._('daily English prompts'),
        i18n._('express ideas in English'),
      ],
      content: i18n._(
        `Daily Questions gives you a fresh speaking prompt every day.

You practice expressing opinions, organizing thoughts, and responding to interesting topics under light pressure.

You can also see answers from other users, which helps you compare ideas and expand your response style.`,
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
      keywords: [
        i18n._('English debates'),
        i18n._('structured speaking practice'),
        i18n._('argument speaking skills'),
      ],
      content: i18n._(
        `Debates let you challenge other learners in a clear, guided format.

Both participants receive questions, record answers, and submit responses. After completion, the system picks a winner, explains the reasoning, and awards points.

This makes speaking with others less stressful while still developing clarity, structure, and confidence.`,
      ),
    },
    {
      id: 'language-games',
      title: i18n._('English Learning Games for Vocabulary and Speaking'),
      subTitle: i18n._('Use game mechanics to practice words, sentences, and reading.'),
      metaTitle: i18n._('English Learning Games for Vocabulary and Speaking | FluencyPal'),
      metaDescription: i18n._(
        'Improve English through interactive games for vocabulary, sentence building, reading, and speaking while earning points.',
      ),
      keywords: [
        i18n._('English learning games'),
        i18n._('gamified language practice'),
        i18n._('vocabulary games'),
      ],
      content: i18n._(
        `Game mode includes interactive activities like translating words, building sentences, reading tasks, and speaking discussions.

You earn points for correct answers, which adds motivation and regular engagement.

Gamified practice helps build consistency while still targeting useful communication skills.`,
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
      keywords: [
        i18n._('English learning community'),
        i18n._('language learning support'),
        i18n._('progress sharing'),
      ],
      content: i18n._(
        `FluencyPal includes community chats where learners can ask questions, discuss challenges, and support each other.

This social layer keeps motivation high and gives you extra opportunities to use English in meaningful interactions.

Some community functions may require age verification depending on feature type.`,
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
      keywords: [
        i18n._('English leaderboard'),
        i18n._('language learning rewards'),
        i18n._('practice points'),
      ],
      content: i18n._(
        `FluencyPal tracks activity across features and awards points for regular practice.

Points come from game mode, stories quizzes, daily questions, community activity, and AI conversations. Top users on the leaderboard unlock rewards while they remain at the top.

This creates a clear motivation loop for consistent long-term progress.`,
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
