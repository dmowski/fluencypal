import OpenAI from 'openai';

const VISION_MODEL = 'gpt-4o' as const;

const SYSTEM_PROMPT = `You analyze photographs for language-learning activities.
Describe what is objectively visible in the image in 4–6 English sentences.
Include: main subjects, setting, actions, objects, and any readable text or logos.
Do not identify real people by name. Do not speculate beyond what is visible.`;

export const describeImage = async (imageUrl: string): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not set');
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'What does this image show? Be factual and specific.',
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  });

  const description = completion.choices[0]?.message?.content?.trim() ?? '';
  if (!description) {
    throw new Error('Empty image description from vision model');
  }

  return description;
};
