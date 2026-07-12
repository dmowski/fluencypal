import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getCustomConversationScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'custom-conversation',
  title: i18n._(`Practice the exact conversation you're afraid of`),
  shortTitle: i18n._('Custom Conversation'),
  subTitle: i18n._('Build your own role-play with more guidance'),
  input: [
    {
      id: 'situation',
      labelForUser: i18n._(`What situation do you want to practice?`),
      labelForAi: 'Situation',
      placeholder: i18n._(
        `For example: returning a damaged laptop, asking for a refund, explaining a delay in a work meeting`,
      ),
      type: 'textarea',
      defaultValue: '',
      required: true,
      requiredFieldsToSummary: ['aiRole', 'userRole', 'goal'],
      lengthToTriggerSummary: 120,
      aiSummarizingInstruction:
        'Summarize the user’s scenario in 1–2 clear sentences for an AI role-play setup. Keep the situation practical and specific.',
      injectUserInfoToSummary: true,
      cacheAiSummary: true,
    },
    {
      id: 'aiRole',
      labelForUser: i18n._(`Who should the AI be?`),
      labelForAi: 'AI role',
      placeholder: i18n._(
        `For example: recruiter, customer support agent, doctor, hotel receptionist`,
      ),
      type: 'text-input',
      defaultValue: '',
      required: true,
    },
    {
      id: 'userRole',
      labelForUser: i18n._(`Who are you in this scenario?`),
      labelForAi: 'User role',
      placeholder: i18n._(`For example: job candidate, customer, patient, traveler`),
      type: 'text-input',
      defaultValue: '',
      required: true,
    },
    {
      id: 'goal',
      labelForUser: i18n._(`What do you want to achieve?`),
      labelForAi: 'User goal',
      placeholder: i18n._(
        `For example: get a refund, make a good impression, solve a problem, ask for clarification`,
      ),
      type: 'textarea',
      defaultValue: '',
      required: true,
    },
    {
      id: 'tone',
      labelForUser: i18n._(`What tone should the conversation have?`),
      labelForAi: 'Tone',
      placeholder: '',
      type: 'options',
      options: [
        i18n._('Friendly'),
        i18n._('Professional'),
        i18n._('Formal'),
        i18n._('Stressful'),
        i18n._('Challenging'),
      ],
      optionsAiDescriptions: {
        [i18n._('Friendly')]: 'The AI should sound warm, relaxed, and supportive.',
        [i18n._('Professional')]: 'The AI should sound polite, clear, and work-appropriate.',
        [i18n._('Formal')]: 'The AI should sound more official, structured, and formal.',
        [i18n._('Stressful')]:
          'The AI should create a bit of pressure, urgency, or emotional tension.',
        [i18n._('Challenging')]:
          'The AI should be demanding, skeptical, or slightly difficult to deal with.',
      },
      defaultValue: i18n._('Professional'),
      required: true,
    },
    {
      id: 'difficulty',
      labelForUser: i18n._(`How difficult should it be?`),
      labelForAi: 'Difficulty',
      placeholder: '',
      type: 'options',
      options: [i18n._('Easy'), i18n._('Medium'), i18n._('Hard')],
      optionsAiDescriptions: {
        [i18n._('Easy')]:
          'Use simple vocabulary, short sentences, and give the user time to respond.',
        [i18n._('Medium')]: 'Use natural everyday language with a moderate level of challenge.',
        [i18n._('Hard')]:
          'Use more natural, fast, or complex language and make the conversation more demanding.',
      },
      defaultValue: i18n._('Medium'),
      required: true,
    },
    {
      id: 'mustInclude',
      labelForUser: i18n._(`Anything the AI must include?`),
      labelForAi: 'Important details',
      placeholder: i18n._(
        `Optional: specific vocabulary, background details, objections, questions, or behavior`,
      ),
      type: 'textarea',
      defaultValue: '',
      required: false,
    },
  ],
  contentPage:
    i18n._(`Create a unique, personalized setting that fits your specific interests or challenges. This scenario lets you define the context, roles, tone, and goals of the conversation you want to practice.

## Why You Should Play *Your Custom Scenario*
1. Practice situations that match your real life, work, travel, or personal goals.  
2. Control who the AI is and how the conversation feels.  
3. Focus on the outcome you want, not just general speaking practice.  
4. Adjust the difficulty and tone to match your confidence level.  
5. Prepare for conversations that standard role-plays may never cover.

## How the Scenario Works
You describe the situation, choose roles, set the goal, and optionally add extra details. The AI will then create a conversation that follows your setup and behaves according to the tone and difficulty you selected.
`),

  category: { categoryTitle: i18n._('Custom'), categoryId: 'custom' },

  instructionToAi: `
Use the user's inputs to create a realistic role-play.

Important inputs:
- Situation: {{situation}}
- AI role: {{aiRole}}
- User role: {{userRole}}
- User goal: {{goal}}
- Tone: {{tone}}
- Difficulty: {{difficulty}}
- Important details: {{mustInclude}}

Rules:
- Stay in character as the AI role.
- Treat the user as the user role.
- Keep the conversation focused on the stated situation and goal.
- Follow the selected tone and difficulty.
- If important details are provided, naturally incorporate them.
- Start the conversation naturally without explaining the setup.
`,
  exampleOfFirstMessageFromAi:
    'Hello, I understand you wanted to discuss an issue with your recent order. Could you tell me what happened?',
  illustrationDescription:
    'Two people in a custom conversation setting, such as a customer and service agent or candidate and recruiter, speaking in a realistic situation tailored to the user’s goal.',
  imageSrc:
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1776511953446-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
  voice: 'shimmer',
});
