import { TextAiModel } from '@/features/Ai/ai';
import { NewsContentVersions, NewsLanguageComplexity } from '@/features/News/types';
import { generateTextWithAi } from '@/app/api/ai/generateTextWithAi';
import { buildNewsRewriteSystemPrompt, buildNewsRewriteUserPrompt } from './prompts';

const COMPLEXITIES: NewsLanguageComplexity[] = ['beginner', 'middle', 'advance'];

// MVP: use the cheapest text model we already support. The rewrite is short
// (one article → three complexity versions) and runs once per news item, so
// `gpt-4o-mini` is a good tradeoff of speed/cost vs. quality for now. Bump
// this once we have user feedback that the rewrites need more nuance.
const DEFAULT_MODEL: TextAiModel = 'gpt-4o-mini';

/**
 * Strip common LLM "wrapper" preface lines (e.g. "Sure! Here is the rewritten
 * article in simple English:") that occasionally slip through despite the
 * system prompt forbidding them.
 */
const stripWrapper = (raw: string): string => {
  let text = raw.trim();

  // Drop code fences if the model wrapped the whole reply in ```markdown ... ```
  const fenceMatch = text.match(/^```(?:markdown|md)?\n([\s\S]*?)\n```$/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const lines = text.split('\n');
  if (lines.length > 0) {
    const first = lines[0].trim();
    const looksLikeWrapper =
      /^(sure[!,.]?|here(?:'s| is)|of course[!,.]?|certainly[!,.]?|below is)/i.test(first) &&
      first.endsWith(':');
    if (looksLikeWrapper) {
      return lines.slice(1).join('\n').trim();
    }
  }

  return text;
};

export interface RewriteNewsInput {
  title: string;
  content_origin: string;
  /** English name of the user's target learning language (e.g. 'English', 'Spanish'). */
  targetLanguageName: string;
  model?: TextAiModel;
}

/**
 * Generate a single CEFR-level rewrite of a news article.
 */
export const rewriteNewsForLevel = async ({
  title,
  content_origin,
  targetLanguageName,
  complexity,
}: RewriteNewsInput & { complexity: NewsLanguageComplexity }): Promise<string> => {
  const userMessage = buildNewsRewriteUserPrompt({ title, content_origin });
  const { output } = await generateTextWithAi({
    systemMessage: buildNewsRewriteSystemPrompt(complexity, targetLanguageName),
    userMessage,
    model: 'gpt-4o-mini',
  });
  return stripWrapper(output);
};

/**
 * Generate three CEFR-level rewrites (beginner / middle / advance) of a news
 * article in parallel. Returns `NewsItem['versions']`.
 */
export const rewriteNewsForLevels = async ({
  title,
  content_origin,
  targetLanguageName,
}: RewriteNewsInput): Promise<NewsContentVersions> => {
  const results = await Promise.all(
    COMPLEXITIES.map(async (complexity) => {
      const text = await rewriteNewsForLevel({
        title,
        content_origin,
        targetLanguageName,
        complexity,
      });
      return [complexity, text] as const;
    }),
  );

  return results.reduce<NewsContentVersions>((acc, [complexity, text]) => {
    acc[complexity] = text;
    return acc;
  }, {});
};
