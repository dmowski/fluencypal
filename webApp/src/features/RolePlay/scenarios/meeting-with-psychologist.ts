import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getMeetingWithPsychologistScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'meeting-with-psychologist',
  title: i18n._('Speaking with a Psychologist'),
  shortTitle: i18n._('Psychologist'),
  category: { categoryTitle: i18n._('Health'), categoryId: 'health' },
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
        Beginner: `Use simple, reassuring language. Ask short, direct questions.`,
        Intermediate: `Use clear language with supportive and open-ended questions.`,
        Advanced: `Use nuanced language, and engage in deeper discussions with insightful reflections.`,
        Fluent: `Use sophisticated language and detailed psychological concepts.`,
      },
      required: false,
    },

    {
      type: 'checkbox',
      labelForAi: '',
      labelForUser: i18n._(
        'I aware that this is a simulation and not a real medical consultation.',
      ),
      id: 'aware',
      placeholder: '',
      defaultValue: '',
      required: true,
    },
  ],

  subTitle: i18n._('Discuss mental health topics and express your thoughts effectively'),
  instructionToAi: `You are a psychologist meeting a client for a casual consultation.

- Engage in supportive dialogue
- Ask open-ended questions to encourage the client to express their feelings and thoughts.
- Offer reflective, empathetic responses, validating their experiences.
- Suggest general coping strategies or thought-provoking perspectives.
  
Note: This is a role-play scenario intended to practice speaking on mental health topics, not a medical consultation or treatment.`,
  exampleOfFirstMessageFromAi: `Hello, I'm Sage, your psychologist today. I'm here to listen and support you. Could you tell me what's on your mind?`,
  illustrationDescription:
    'A comfortable, welcoming office with a psychologist listening attentively to a client seated across from them, expressing themselves in a supportive atmosphere.',
  imageSrc: '/role/ceb0e1b7-9c34-47c0-ae09-4086fb734da4.webp',
  voice: 'shimmer',

  contentPage:
    i18n._(`Discuss mental health topics in a comfortable, supportive setting. This role-play scenario provides a safe space to express yourself clearly, explore sensitive issues, and practice discussing mental health openly.

**Note:** This scenario is not a medical treatment and is intended purely for language practice and conversational comfort about mental health.
  
## Why You Should Play *Meeting with Psychologist*
1. Practice articulating complex emotions and sensitive topics confidently.
2. Learn vocabulary related to mental health and emotional well-being.
3. Improve your communication skills through supportive, reflective conversations.
4. Explore various coping strategies and discuss perspectives on common mental health challenges.
5. Gain comfort in expressing emotions and thoughts openly and clearly.

## How the Scenario Works

You'll act as a client meeting a psychologist for an informal discussion about mental health topics you choose, such as stress management, anxiety, relationships, or self-esteem. The AI acts as your psychologist, providing supportive dialogue, asking reflective questions, and validating your experiences to help you practice meaningful, thoughtful conversation.
`),
});
