import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';
import { AliasRolePlay } from '../fullArticles/AliasRolePlay';

export const getAliasGameScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'alias-game',
  title: i18n._('Alias Word Guessing Game'),
  shortTitle: 'Alias',
  category: { categoryTitle: i18n._('Game'), categoryId: 'game' },
  input: [
    {
      type: 'options',
      id: 'languageLevel',

      labelForAi: 'Language level of user',
      placeholder: '',
      defaultValue: 'Intermediate',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Fluent'],

      labelForUser: i18n._(`Your Language Level`),
      optionsAiDescriptions: {
        Beginner: `Basic vocabulary and simple sentences. Use greetings and common phrases.`,
        Intermediate:
          'Can hold conversations on familiar topics. Use idiomatic expressions and ask follow-up questions.',
        Advanced:
          'Comfortable with complex discussions. Use idiomatic expressions and ask open-ended questions.',
        Fluent:
          'Native or near-native proficiency. Use advanced vocabulary and ask for detailed opinions.',
      },
      required: false,
    },
  ],

  gameMode: 'alias',
  subTitle: i18n._('Practice vocabulary by creatively describing and guessing words'),
  contendElement: <AliasRolePlay lang={lang} />,
  contentPage: '',

  instructionToAi: `Your role:
You are playing the Alias game.

The game consists of two phases:

Phase 1: Guessing the User’s Word  
- The user will describe a word or phrase without explicitly mentioning it or its variations.
- Listen carefully to their description and try to guess the correct word.
- If the description is unclear, politely ask for clarification.

Phase 2: User Guessing Your Word
- You will receive the words or phrases to describe.
- Clearly and creatively describe this word without explicitly mentioning it, its synonyms, antonyms, translations, or variations.
- Allow the user up to 3 attempts to guess your word.

Answer Confirmation:
- Always explicitly acknowledge correct guesses (e.g. "That's right!" or "Great, that's true!").
- If the guess is incorrect, politely inform the user (e.g. "That's not quite right, try the form again.")

Gameplay Sequence:
1. Explicitly invite the user to begin by describing their word.
2. After you successfully guess the user's word, ask the user if it's right

Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s tricky…”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.
`,
  exampleOfFirstMessageFromAi: `Hello, I'm your AI partner for the Alias game. I'm ready to guess your word. Please describe it to me.`,
  illustrationDescription: '',
  imageSrc: '/role/f0de782c-6f1a-4005-924d-02459308a4fa.webp',
  videoSrc: '/role/69e7165b-a597-4731-8def-3e0f2b09ec1d_1.mp4',
  voice: 'shimmer',

  landingHighlight: i18n._(
    "Improve your vocabulary and speaking skills while having fun! Alias is a dynamic word-guessing game where you'll practice explaining and guessing words creatively, expanding your linguistic confidence.",
  ),
});
