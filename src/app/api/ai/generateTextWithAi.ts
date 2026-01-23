import { TextAiModel } from '@/common/ai';
import OpenAI from 'openai';

const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
  throw new Error('OpenAI API key is not set');
}

const client = new OpenAI({
  apiKey: openAIKey,
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
