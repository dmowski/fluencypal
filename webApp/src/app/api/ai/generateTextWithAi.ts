import { TextAiModel } from '@/features/Ai/ai';
import { AiChatMessage } from './aiRequest.types';
import OpenAI from 'openai';

const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
  throw new Error('OpenAI API key is not set');
}

const client = new OpenAI({
  apiKey: openAIKey,
  maxRetries: 4,
});

interface generateTextWithAiProps {
  systemMessage: string;
  userMessage: string;
  model: TextAiModel;
}
export const generateTextWithAi = async ({
  systemMessage,
  userMessage,
  model,
}: generateTextWithAiProps) => {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      { role: 'user', content: userMessage },
    ],
    model: model,
  });

  const output = chatCompletion.choices[0].message.content || '';
  const usage = chatCompletion.usage;

  return {
    output,
    usage,
  };
};

export const generateChatWithAi = async ({
  systemMessage,
  chatMessages,
  model,
}: {
  systemMessage: string;
  chatMessages: AiChatMessage[];
  model: TextAiModel;
}) => {
  const messages = [
    {
      role: 'system' as const,
      content: systemMessage,
    },
    ...chatMessages.map((msg) => ({
      role: msg.isBot ? ('assistant' as const) : ('user' as const),
      content: msg.text,
    })),
  ];

  const chatCompletion = await client.chat.completions.create({
    messages: messages,
    model: model,
  });

  const output = chatCompletion.choices[0].message.content || '';
  const usage = chatCompletion.usage;

  return {
    output,
    usage,
  };
};
