import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { FeatureData, FeaturesInfo } from './types';

const BOOK_LANDING_URL = 'https://book.fluencypal.com/landing';

export const getFeaturesData = (lang: SupportedLanguage): FeaturesInfo => {
  const i18n = getI18nInstance(lang);

  const features: FeatureData[] = [
    {
      id: 'learning-plan',
      title: i18n._('Personalized English Learning Plan with AI'),
      subTitle: i18n._(
        'Build an English study plan around your level, goals, and the conversations you want to have.',
      ),
      metaTitle: i18n._('Personalized English Learning Plan | FluencyPal'),
      metaDescription: i18n._(
        'Create a personalized English study plan with AI. Focus your speaking practice on your goals, current level, and the skills you need to improve.',
      ),
      keywords: [
        'personalized English learning plan',
        'English study plan',
        'AI English learning plan',
      ],
      content: i18n._(
        `## Build an English study plan for your goals

Want to improve your English but unsure what to practice next? FluencyPal creates a personalized English learning plan based on your current level, strengths, and the situations you want to handle. A guided survey helps the AI understand what matters to you before it builds your plan.

## How your personalized learning plan works

1. Describe your goal, such as preparing for a job interview or feeling more comfortable in everyday conversations.
2. Share what feels easy and where you struggle with English.
3. Answer follow-up questions so the AI can focus your practice.
4. Use your plan to guide your English learning routine.

For example, someone preparing for interviews needs different speaking practice from someone learning English for travel. Your answers help shape that focus.

## A study plan that changes as you practice

FluencyPal updates your plan as you improve, reveal new areas to work on, or change your priorities. This keeps your practice connected to your current needs.

### Can I use a learning plan if I already know some English?

Yes. The survey considers both your strengths and your difficulties, so your plan can focus on the gaps between what you know and what you can comfortably say.

Start with your learning goal to give your next English practice session a clear direction.`,
      ),
    },
    {
      id: 'ai-speaking-practice',
      title: i18n._('Practice Speaking English with AI'),
      subTitle: i18n._(
        'Talk to an AI English tutor, send voice messages, or switch to text when you need to.',
      ),
      metaTitle: i18n._('Practice Speaking English with AI | FluencyPal'),
      metaDescription: i18n._(
        'Practice speaking English with an AI tutor through live calls and voice messages. Follow transcripts, adjust speaking speed, and learn from your mistakes.',
      ),
      keywords: [
        'practice speaking English with AI',
        'AI English conversation practice',
        'AI English speaking partner',
      ],
      content: i18n._(
        `## English conversation practice with an AI tutor

Practice speaking English with AI when you want a conversation partner for your own learning routine. FluencyPal lets you talk through live AI calls, record voice messages, or type your responses in chat. You can choose the format that fits your surroundings and how ready you feel to speak.

## Choose how you practice English

### Live AI calls

Talk naturally with an AI English tutor and follow the conversation transcript. Use this mode to practice responding as the conversation unfolds.

### Voice messages

Record an answer, review AI suggestions, and improve your response before sending it. This gives you time to think about your wording and try again.

### Text chat

Continue the conversation by typing when speaking out loud is inconvenient. Text chat keeps you practicing how to express your ideas, although it does not replace speaking aloud.

## Get support when you get stuck

Adjust the AI speaking speed, follow transcripts, and ask for help when you do not know what to say next. As you practice, FluencyPal tracks mistakes and turns them into focused improvement tasks.

### How can I practice English speaking without a partner?

Use an AI call for a back-and-forth conversation, or start with voice messages if you want more preparation time. Both let you practice saying your own ideas aloud without arranging a session with another person.

Choose a speaking mode and start your next English conversation.`,
      ),
    },
    {
      id: 'personalized-grammar-rules',
      title: i18n._('English Grammar Practice Based on Your Mistakes'),
      subTitle: i18n._(
        'Understand the grammar you struggle with, test it in a quiz, and use it in conversation.',
      ),
      metaTitle: i18n._('Personalized English Grammar Practice | FluencyPal'),
      metaDescription: i18n._(
        'Practice English grammar based on your speaking and writing mistakes. Learn with clear explanations, examples, short quizzes, and AI conversations.',
      ),
      keywords: [
        'English grammar practice',
        'personalized grammar exercises',
        'English grammar quizzes',
      ],
      content: i18n._(
        `## Turn your English mistakes into grammar practice

FluencyPal creates personalized English grammar practice from the mistakes you make while speaking or writing. After conversations, you get a grammar list that helps you understand what went wrong and practice the rules you need.

## Learn a rule, test it, and use it aloud

Each grammar item includes:

- A simple explanation of the rule.
- Examples that show how it works in a sentence.
- A short grammar quiz to check your understanding.
- AI conversation practice where you can apply the same rule.

This connects grammar study to the task of forming your own sentences in conversation.

## Focus on grammar that supports your goals

Your practice can prioritize patterns relevant to job interviews, travel, everyday conversations, or formal speaking. You work on both recurring mistakes and the grammar you are likely to need next.

### How can I stop making the same grammar mistakes?

Start by noticing a recurring error, reviewing the rule, and practicing it in your own sentences. FluencyPal supports that process with explanations, quizzes, and conversations based on your actual mistakes.

Review your personalized grammar list to choose a rule for your next practice session.`,
      ),
    },
    {
      id: 'interactive-lesson',
      title: i18n._('Daily English Speaking Lessons with AI Feedback'),
      subTitle: i18n._(
        'Learn one grammar pattern, read aloud, and practice using it in your own spoken answers.',
      ),
      metaTitle: i18n._('Daily English Speaking Lessons | FluencyPal'),
      metaDescription: i18n._(
        'Build a daily English speaking habit with interactive lessons. Read aloud, answer voice prompts, and get AI feedback on one grammar pattern at a time.',
      ),
      keywords: [
        'daily English speaking lessons',
        'interactive English lessons',
        'English grammar speaking practice',
      ],
      content: i18n._(
        `## Practice English speaking with a daily lesson

FluencyPal Interactive Lessons help you use English grammar in speech. Each daily lesson focuses on one specific pattern, such as articles, a tense contrast, or a verb pattern. You learn how it works, read it aloud, and use it in spoken answers with AI feedback.

The first lesson draws on your recent conversations or learning goal. Later lessons use your open-talk responses to keep the practice connected to how you actually speak.

## What happens in an interactive English lesson?

1. Open the lesson from your dashboard or daily tasks.
2. Read a short explanation with examples of when to use the pattern.
3. Read a short text aloud. You can listen to it first.
4. Record answers to prompts and get feedback on your use of the pattern.
5. Finish with a two-to-three-minute open talk on a specific topic.
6. Listen to your results while the next lesson is prepared.

You can skip a lesson if its focus is not useful today. The replacement covers a different category.

## English grammar you can practice aloud

Lesson topics include:

- [Present perfect vs past simple](/blog/present-perfect-vs-past-simple): choosing between “I have sent it” and “I sent it yesterday.”
- [English articles: a, an, and the](/blog/english-articles-a-an-the): introducing something and referring to something already known.
- [Gerund vs infinitive](/blog/gerund-vs-infinitive): understanding the difference between “stop doing” and “stop to do.”
- [Second vs third conditional](/blog/second-vs-third-conditional): talking about imagined situations and different past outcomes.

### How is this different from a grammar quiz?

A quiz checks whether you can recognize or select an answer. These lessons also ask you to produce the pattern aloud, first with prompts and then in a longer response.

Open your daily lesson to practice one pattern from explanation to conversation.`,
      ),
    },
    {
      id: 'vocabulary-practice',
      title: i18n._('English Vocabulary Practice for Speaking'),
      subTitle: i18n._(
        'Learn useful English words for your goals and practice using them in AI conversations.',
      ),
      metaTitle: i18n._('English Vocabulary Practice with AI | FluencyPal'),
      metaDescription: i18n._(
        'Build English vocabulary for real conversations. Learn words matched to your level and goals, then use them in guided speaking practice with an AI tutor.',
      ),
      keywords: [
        'English vocabulary practice',
        'learn English words in context',
        'English vocabulary for speaking',
      ],
      content: i18n._(
        `## Learn English vocabulary you can use in conversation

FluencyPal helps you build English vocabulary around your learning goals and current level. Each lesson introduces relevant words and gives you guided conversation practice, so you can work on using new vocabulary in your own sentences.

## How AI vocabulary practice works

1. The lesson selects words based on your objective, vocabulary level, and the situations you want to handle.
2. The AI teacher explains the words.
3. You practice using them in a guided conversation.

If your goal involves work or travel, that context helps shape the vocabulary you study. Your grammar guidance continues to develop alongside your vocabulary practice.

## Move from recognizing words to using them

Knowing the meaning of a word is one step. Finding it when you are speaking is another. Practicing vocabulary in context gives you opportunities to choose words, form sentences, and connect them to ideas you want to express.

### How can I improve my English vocabulary for speaking?

Focus on words relevant to your life, learn how they work in a sentence, and use them in conversation. FluencyPal brings those steps together in a guided vocabulary lesson.

Start a vocabulary lesson to put useful English words into practice.`,
      ),
    },
    {
      id: 'role-play',
      title: i18n._('English Role Play: Practice Real-Life Conversations'),
      subTitle: i18n._(
        'Rehearse job interviews, shopping conversations, and support calls with an AI speaking partner.',
      ),
      metaTitle: i18n._('English Role Play Practice with AI | FluencyPal'),
      metaDescription: i18n._(
        'Practice real-life English conversations with AI role play. Rehearse job interviews, recruiter calls, shopping situations, and customer support conversations.',
      ),
      keywords: [
        'English role play',
        'English conversation scenarios',
        'English job interview practice',
      ],
      content: i18n._(
        `## Practice real-life English conversations before they happen

FluencyPal offers English role play with AI so you can rehearse situations you expect to face. Choose a ready-made scenario or practice one connected to your learning goals. Each role play gives your conversation a purpose, helping you work on what you need to say in that situation.

## English role play for job interviews and work

Depending on your goal, work-related scenarios may include:

- Recruiter screening calls.
- Job interviews.
- Technical interviews.
- Salary discussions.

Use these conversations to practice explaining your experience, answering questions, and discussing your expectations in English.

## Everyday English conversation scenarios

Ready-made role plays also cover shop conversations, support calls, and everyday situations. Practice asking for help, explaining a problem, or making a request before you need to do it in real life.

### What is English role play practice?

Role play means practicing a conversation as if you were in a specific situation. In FluencyPal, the AI takes part in the scenario so you can respond in English and rehearse the exchange.

Choose a scenario that matches an upcoming conversation and practice what you want to say.`,
      ),
    },
    {
      id: 'custom-role-play',
      title: i18n._('Create Your Own English Role Play Scenario'),
      subTitle: i18n._(
        'Build an AI conversation around a meeting, trip, or personal situation you want to prepare for.',
      ),
      metaTitle: i18n._('Custom English Role Play Generator | FluencyPal'),
      metaDescription: i18n._(
        'Create a custom English role play with AI. Build speaking scenarios for work meetings, travel, customer conversations, and situations from your own life.',
      ),
      keywords: [
        'custom English role play',
        'English role play generator',
        'create English conversation scenarios',
      ],
      content: i18n._(
        `## Create an English speaking scenario for your own situation

FluencyPal Custom Role Play lets you build your own English conversation scenario. Use it when you have a specific situation to prepare for and want practice that reflects your personal or professional context.

## Ideas for custom English role plays

You could create a scenario around:

- A work meeting where you need to explain an idea.
- A travel situation where you need to ask for information.
- A customer conversation about a request or problem.
- A personal speaking challenge you want to rehearse.

These are examples of situations you can use as the basis for your own practice.

## Make your practice relevant to the conversation ahead

When planning your scenario, think about who you will speak to, what you need to communicate, and what would make the exchange difficult. A concrete situation gives you a clearer purpose for practicing than a broad topic alone.

### How is custom role play different from ready-made scenarios?

Ready-made role plays give you a situation to start with. Custom Role Play lets you create the situation yourself, so the conversation can focus on your own needs.

Create a scenario around a conversation you want to feel more prepared for.`,
      ),
    },
    {
      id: 'interactive-stories',
      title: i18n._('Learn English with Stories, Audio, and Quizzes'),
      subTitle: i18n._(
        'Read and listen to English stories with translations, then practice sentence structure in a quiz.',
      ),
      metaTitle: i18n._('Learn English with Stories and Audio | FluencyPal'),
      metaDescription: i18n._(
        'Learn English with interactive stories, audio, and side-by-side translations. Practice listening, reading, and word order with sentence-building quizzes.',
      ),
      keywords: [
        'learn English with stories',
        'English stories with audio',
        'English reading and listening practice',
      ],
      content: i18n._(
        `## Practice English reading and listening with stories

FluencyPal Stories combines English audio, written text, and translation in one activity. Listen while following the original text and its translation side by side, then complete a quiz based on what you heard.

## Read, listen, and rebuild sentences

The story quiz asks you to reconstruct parts of the text word by word. This gives you a way to practice:

- English word order.
- Sentence structure.
- Common phrases and language patterns.

You move from following the story to actively working with its sentences.

## Use translation to follow the meaning

Seeing the original text next to a translation helps you connect English wording with its meaning. Listening at the same time lets you follow how the written language sounds.

### Can I practice reading and listening together?

Yes. Stories lets you listen to the audio while reading the English text. The quiz then adds sentence-building practice to the same activity.

Choose a story for an English practice session during a break or commute.`,
      ),
    },
    {
      id: 'books-reader',
      title: i18n._('English EPUB Reader with Translation and Audio'),
      subTitle: i18n._(
        'Read English books, translate unfamiliar words, and listen aloud while keeping your place.',
      ),
      metaTitle: i18n._('EPUB Reader with Translation for English | FluencyPal'),
      metaDescription: i18n._(
        'Read English books with instant word translation and text-to-speech. Upload EPUBs, highlight passages, and sync reading progress with FluencyPal Books.',
      ),
      keywords: [
        'EPUB reader with translation',
        'English reading app',
        'read books to learn English',
        'FluencyPal Books',
      ],
      content: i18n._(
        `## Read English books with built-in word translation

FluencyPal Books is an English reading app for language learners. Upload an EPUB, open a book, and translate unfamiliar words as you read. You can also highlight passages and listen with browser text-to-speech.

The reader is separate from the main FluencyPal practice dashboard, with tools focused on reading books and exploring language in context.

## Reading tools for English learners

- **Word translation:** click a word for an instant translation, or enable hover translation.
- **Read aloud:** listen with browser text-to-speech while following the text.
- **Highlights:** mark useful passages and return to them later.
- **Synced reading:** keep your library, highlights, and reading progress across devices.

## Upload EPUB books or explore free classics

Upload your own EPUB files, or convert PDF and DOCX files for reading. You can also browse free public-domain classics from the Gutenberg library.

A familiar story or an interesting subject gives you a reason to keep reading while encountering vocabulary and grammar in context.

### Can I translate words without leaving the book?

Yes. Click a word or use hover translation to look up its meaning while you read.

### Can I listen to the books?

Yes. The reader uses browser text-to-speech to read the text aloud.

[Try the FluencyPal Books live demo](https://book.fluencypal.com/landing) to explore the reader and start reading in English.`,
      ),
    },
    {
      id: 'daily-questions',
      title: i18n._('Daily English Speaking Questions and Prompts'),
      subTitle: i18n._(
        'Practice expressing your ideas with a new English conversation question each day.',
      ),
      metaTitle: i18n._('Daily English Speaking Questions | FluencyPal'),
      metaDescription: i18n._(
        'Practice English with a new speaking question every day. Build answers, express opinions, and explore other learners’ responses with FluencyPal.',
      ),
      keywords: [
        'daily English speaking questions',
        'English speaking prompts',
        'daily English conversation practice',
      ],
      content: i18n._(
        `## A new English speaking question every day

FluencyPal Daily Questions gives you one new prompt each day, so you have something to talk about when you want to practice English. Use the question to work on turning your thoughts into a spoken answer.

## Practice giving clear, complete answers

Daily speaking prompts give you opportunities to:

- Express an opinion and explain your reasons.
- Organize your thoughts before answering.
- Respond to an unexpected question.
- Practice speaking about your own ideas.

For a simple practice routine, answer the question directly, add a reason, and give an example. This is a way to structure your response when you are unsure how to begin.

## See how other learners answer

You can also read or explore answers from other learners, compare perspectives, and discover different ways to approach the same question.

### What should I talk about when practicing English alone?

A daily speaking prompt gives you a starting point. Focus on explaining your own answer clearly, then add details to make it more complete.

Open today’s question and use it for your next speaking practice session.`,
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
      title: i18n._('English Learning Games for Vocabulary and Sentences'),
      subTitle: i18n._(
        'Practice words, build sentences, and answer speaking questions while earning points.',
      ),
      metaTitle: i18n._('English Learning Games Online | FluencyPal'),
      metaDescription: i18n._(
        'Practice English with games for vocabulary, sentence building, reading, and speaking. Complete interactive challenges and earn points for correct answers.',
      ),
      keywords: [
        'English learning games',
        'English vocabulary games',
        'English sentence building games',
      ],
      content: i18n._(
        `## Practice English with interactive learning games

FluencyPal Game Mode turns English practice into interactive challenges. Work on vocabulary, sentence building, reading, and speaking while earning points for correct answers.

## English vocabulary and sentence-building activities

Game tasks include:

- Translating words to practice vocabulary.
- Building sentences to work on word order.
- Reading short texts.
- Answering speaking questions.

The mix of activities gives you different ways to use English within a game-based practice session.

## Add variety to your English learning routine

Use games when you want a change from a lesson or a longer conversation. Points give you an immediate goal as you work through the questions, while the activities keep the focus on language practice.

### Can I practice speaking through English games?

Yes. Game Mode includes speaking questions alongside vocabulary, sentence-building, and reading tasks.

Open Game Mode to try an English learning challenge.`,
      ),
    },
    {
      id: 'progress-chart',
      title: i18n._('Track Your English Learning Progress'),
      subTitle: i18n._(
        'Follow AI-assessed trends in grammar, vocabulary, fluency, and speaking confidence.',
      ),
      metaTitle: i18n._('English Learning Progress Tracker | FluencyPal'),
      metaDescription: i18n._(
        'Track your English learning progress with AI-assessed charts for grammar, vocabulary, fluency, and confidence. Compare skill trends over weeks and months.',
      ),
      keywords: [
        'English learning progress tracker',
        'track English speaking progress',
        'English fluency progress chart',
      ],
      content:
        '![English learning progress chart showing skill trends](/landing/progressChart.webp)\n\n' +
        i18n._(
          `## See how your English practice changes over time

FluencyPal tracks your performance after conversations, role plays, and daily question answers. The English learning progress chart turns AI assessments into a timeline, helping you follow individual skills across your practice sessions.

## What does the English progress tracker measure?

The AI assesses four areas separately:

- **Grammar:** accuracy of your sentence structure and grammar use.
- **Vocabulary:** the range of words you use and how well they fit the context.
- **Fluency:** how smoothly you express your ideas.
- **Confidence:** how clear and assertive your communication sounds to the AI.

These are AI assessments of your practice responses. The confidence score describes how your communication comes across, rather than measuring how you feel.

## Compare your progress over weeks and months

Switch between skills and choose the last 30 days, three months, six months, or all time. A smoothed trend line makes it easier to look beyond individual sessions and see longer-term patterns.

Use these patterns to decide what to practice next. For example, if your grammar trend is improving but your vocabulary scores remain steady, you may want to spend more time using new words in conversation.

### How can I track my English speaking progress?

Compare several sessions over time and look at specific skills, rather than judging your English from a single answer. FluencyPal brings those session assessments together in one chart.

Open your progress chart to review your recent practice and choose your next focus.`,
        ),
    },
    {
      id: 'community',
      title: i18n._('English Learning Community: Connect with Learners'),
      subTitle: i18n._(
        'Ask questions, share your progress, and talk about learning English with other people.',
      ),
      metaTitle: i18n._('English Learning Community Online | FluencyPal'),
      metaDescription: i18n._(
        'Connect with other English learners in the FluencyPal community. Ask questions, share progress, and discuss learning challenges in community chats.',
      ),
      keywords: [
        'English learning community',
        'online English learner community',
        'English learning support',
      ],
      content: i18n._(
        `## Join a community of English learners

The FluencyPal English learning community gives you a place to interact with other learners alongside your AI practice. Use community chats to ask questions, share progress, and discuss the challenges of learning a language.

## Share your English learning experience

In community chats, you can:

- Ask questions about learning English.
- Share progress and personal milestones.
- Discuss difficulties with other learners.
- Encourage each other to keep practicing.

Writing about your experiences also gives you a meaningful reason to use English beyond a lesson.

### How can I connect with other English learners?

Open the FluencyPal community chats to join discussions, ask a question, or share what you are working on. Some community functions may require age verification, depending on the feature.

Join a conversation about your learning goals or your latest practice session.`,
      ),
    },
    {
      id: 'leaderboard',
      title: i18n._('English Learning Leaderboard: Earn Practice Points'),
      subTitle: i18n._(
        'Earn points from your learning activities and work toward leaderboard rewards.',
      ),
      metaTitle: i18n._('English Learning Leaderboard and Rewards | FluencyPal'),
      metaDescription: i18n._(
        'Earn points for English conversations, story quizzes, daily questions, and games. Follow your place on the FluencyPal leaderboard and work toward rewards.',
      ),
      keywords: [
        'English learning leaderboard',
        'language learning rewards',
        'English practice points',
      ],
      content: i18n._(
        `## Turn regular English practice into leaderboard points

The FluencyPal leaderboard gives you an extra reason to keep practicing. Earn points through activities across the platform and follow your position as you learn.

## How to earn English practice points

Activities that earn points include:

- AI conversations.
- Story quizzes.
- Daily questions.
- Community activity.
- Game Mode.

This lets you work toward leaderboard points through different parts of your learning routine.

## Work toward rewards through regular practice

Top users can unlock rewards while they remain at the top. The leaderboard adds a shared goal to your personal study routine and gives your activity a visible place in the community.

### Does the leaderboard measure my English level?

The leaderboard tracks activity points. Use it as motivation to practice; use your skill progress charts to review AI assessments of your English performance.

Complete a learning activity and check your place on the leaderboard.`,
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
