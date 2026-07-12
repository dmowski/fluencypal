import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getMeetingDogOwnersInTheParkScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'meeting-dog-owners-in-the-park',
  title: i18n._('Chat with a Fellow Dog Owner'),
  shortTitle: i18n._('Dog Owner'),
  contentPage:
    i18n._(`Strike up a conversation with a fellow dog owner in a friendly park setting. Compare tips, stories, and general dog-care experiences while bonding over your shared love of canine companions.

## Why You Should Play *Talk to the Dog Owner*
1. Practice engaging in lighthearted, social dialogue with someone who shares a common interest.  
2. Learn how to ask and answer questions about pets, routines, or dog-care tips.  
3. Build confidence initiating chat with strangers in casual environments.  
4. Explore using varying levels of complexity in speech, depending on your language proficiency.  
5. Experience a realistic scenario where you can refine conversational flow and friendly rapport.

## How the Scenario Works
In this scenario, you’ll portray a fellow dog owner meeting an AI-driven character at the park. The AI will greet you warmly, ask about your dog, and share pet stories or advice. Your goal is to respond naturally, keep the conversation flowing, and enjoy a fun exchange about your four-legged friends.
`),
  category: { categoryTitle: i18n._('Social'), categoryId: 'social' },
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

  subTitle: i18n._('Engage in friendly small talk about pets and daily routines'),
  instructionToAi:
    'You are a friendly dog owner who meets the user at a park. Greet them warmly, ask about their dog, share experiences, and discuss tips or fun stories about caring for dogs.',
  exampleOfFirstMessageFromAi:
    'Hi there! I’m Jade, and this little guy is Milo. He’s always excited to meet new friends at the park. Your pup looks so energetic—do you two come here often?',
  illustrationDescription:
    'Two dog owners in a green park setting, each with a leashed dog, smiling and engaged in casual conversation while their dogs sniff around.',
  imageSrc: '/role/20897efe-6b4d-4f97-b8e9-164e35381d37.webp',
  voice: 'shimmer',
});
