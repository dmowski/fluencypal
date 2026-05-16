import { TextAiModel } from '@/features/Ai/ai';
import { generateTextWithAi } from '../ai/generateTextWithAi';
import {
  buildNewsHeadlineTranslationSystemPrompt,
  buildNewsHeadlineTranslationUserPrompt,
} from './prompts';

const DEFAULT_MODEL: TextAiModel = 'gpt-4o-mini';

export interface TranslateNewsHeadlineInput {
  title: string;
  subTitle: string;
  /** English name of the user's target learning language (e.g. 'English'). */
  targetLanguageName: string;
  model?: TextAiModel;
}

export interface TranslateNewsHeadlineResult {
  title: string;
  subTitle: string;
}

/**
 * Translate a news article's `title` + `subTitle` into the user's target
 * learning language in a single AI call.
 *
 * Falls back to the original strings if the model returns malformed JSON so
 * the pipeline never blocks on a translation error.
 */
export const translateNewsHeadline = async ({
  title,
  subTitle,
  targetLanguageName,
  model = DEFAULT_MODEL,
}: TranslateNewsHeadlineInput): Promise<TranslateNewsHeadlineResult> => {
  const { output } = await generateTextWithAi({
    systemMessage: buildNewsHeadlineTranslationSystemPrompt(targetLanguageName),
    userMessage: buildNewsHeadlineTranslationUserPrompt({ title, subTitle }),
    model,
  });

  const cleaned = output.trim().replace(/^```(?:json)?\n?|\n?```$/g, '');

  try {
    const parsed = JSON.parse(cleaned) as Partial<TranslateNewsHeadlineResult>;
    return {
      title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : title,
      subTitle:
        typeof parsed.subTitle === 'string' && parsed.subTitle.trim() ? parsed.subTitle : subTitle,
    };
  } catch {
    return { title, subTitle };
  }
};
