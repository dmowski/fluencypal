import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getCustomScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'custom',
  title: i18n._('Create Your Own Role-Play Scenario'),
  shortTitle: i18n._('Custom'),
  subTitle: i18n._('Customize a conversation to fit your unique learning needs'),
  input: [
    {
      id: 'scenario',
      labelForUser: i18n._(`Scenario Description`),
      labelForAi: '',
      placeholder: i18n._(`Describe your custom scenario here...`),
      type: 'textarea',
      defaultValue: '',
      required: true,
    },
  ],
  contentPage:
    i18n._(`Create a unique, personalized setting that fits your specific interests or challenges. This scenario lets you decide the context, characters, and conversation flow you want to practice.

## Why You Should Play *Your Custom Scenario*
1. Tailor the experience to your personal goals, from work situations to everyday social interactions.  
2. Experiment with different conversation styles, topics, or tones in a setting of your choice.  
3. Focus on the skills or vocabulary you need most, whether it’s technical terminology or casual chit-chat.  
4. Enjoy full creative freedom to build a scenario that’s both realistic and engaging for you.  
5. Gain valuable practice in scenarios that might not be covered by standard role-plays.

## How the Scenario Works
You’ll outline your own role-play by providing a brief description of the setting, characters, and main objectives. The AI will adapt to your custom instructions and engage in dialogue aligned with your scenario’s theme. This flexible format helps you master the exact communication skills you need.
`),

  category: { categoryTitle: i18n._('Custom'), categoryId: 'custom' },

  instructionToAi: '',
  exampleOfFirstMessageFromAi: '',
  illustrationDescription:
    'A customer holding a shopping bag, talking to a cashier at the returns counter, explaining why they need to return an item while the cashier processes the request.',
  imageSrc: '/role/1ca9343e-839f-4b49-ac1f-9c7bfdea272e.webp',
  voice: 'shimmer',
});
