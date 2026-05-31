import { z } from 'zod';

import { generateStrictJson } from '@/app/api/ai/generateJson';
import { buildNewsTagsSystemPrompt, buildNewsTagsUserPrompt } from './prompts';

const tagsSchema = z.object({
  tags: z.array(z.string()).default([]),
});

export interface GenerateNewsTagsInput {
  title: string;
  subTitle: string;
  category: string;
}

/**
 * Generate 2-5 topic tags for a news article when the upstream API does not
 * provide any.
 */
export const generateNewsTags = async ({
  title,
  subTitle,
  category,
}: GenerateNewsTagsInput): Promise<string[]> => {
  console.log('Generate tags for news', title);
  const { parsed } = await generateStrictJson({
    systemMessage: buildNewsTagsSystemPrompt(),
    userMessage: buildNewsTagsUserPrompt({ title, subTitle, category }),
    model: 'gpt-4o-mini',
    schema: tagsSchema,
    attempts: 2,
  });

  return parsed.tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, 5);
};
