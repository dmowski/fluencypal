import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getAssistantChatScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'assistant-chat',
  title: i18n._('General AI Assistant'),
  shortTitle: i18n._('General Assistant'),
  contentPage: i18n._(`This is a classic, free-form AI assistant — similar to ChatGPT.

You can ask questions, explore ideas, solve problems, or just talk things through.  
There are no strict roles, scenarios, or scripts — just a natural conversation.

## What you can use this assistant for

- Asking general questions  
- Getting explanations or summaries  
- Brainstorming ideas  
- Solving everyday problems  
- Writing, rewriting, or improving text  
- Thinking out loud and exploring thoughts  

## How the conversation works

You talk to the assistant like you would in a normal chat.  
Ask follow-up questions, change topics, or go deeper whenever you want.

The assistant adapts to your style — short answers, detailed explanations, or step-by-step help.

## Best for

- Everyday conversations  
- Quick help and clarification  
- Open-ended discussions  
- When you don’t need a specific role-play or scenario  

Just start typing — the assistant is ready.
`),
  input: [],
  category: {
    categoryTitle: i18n._('Assistant'),
    categoryId: 'assistant',
  },

  subTitle: i18n._('Ask questions, get explanations, and solve everyday problems'),

  useInstructionOnly: true,
  instructionToAi: `You are a general AI assistant, similar to ChatGPT.
Answer questions clearly and naturally.
Be concise by default, but provide more detail when helpful.

Start the conversation with:
"Hi there, how can I help you today?"
`,
  exampleOfFirstMessageFromAi: 'Hi there, how can I help you today?',
  illustrationDescription:
    'A friendly assistant ready to help with any questions or tasks you have, symbolizing a helpful and approachable AI companion.',
  imageSrc: '/call/ash/photo.webp',
  voice: 'ash',
});
