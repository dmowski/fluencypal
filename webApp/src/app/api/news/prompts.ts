import { NewsLanguageComplexity } from '@/features/News/types';

const COMPLEXITY_GUIDANCE: Record<NewsLanguageComplexity, string> = {
  beginner: [
    'Target CEFR level A1–A2.',
    'Use very simple, short sentences and the most common everyday vocabulary.',
    'Avoid idioms, phrasal verbs, and complex tenses (prefer present simple / past simple).',
  ].join(' '),
  middle: [
    'Target CEFR level B1.',
    'Use clear everyday English with moderate sentence length.',
    'Common phrasal verbs and a wider tense range are allowed, but avoid rare or technical jargon.',
  ].join(' '),
  advance: [
    'Target CEFR level C1.',
    'Use natural, fluent English with varied sentence structure.',
    'You may keep nuanced vocabulary and idiomatic phrasing, while staying clear and concise.',
  ].join(' '),
};

/**
 * System prompt for the news complexity rewrite. The model must output ONLY
 * markdown — no preface, no apology, no closing remarks.
 */
export const buildNewsRewriteSystemPrompt = (complexity: NewsLanguageComplexity): string => {
  return [
    'You are an English-language news editor for adult language learners.',
    'Rewrite the user-provided news article in clear English at the requested CEFR level.',
    COMPLEXITY_GUIDANCE[complexity],
    '',
    'Strict output rules:',
    '- Respond with markdown only. Do NOT include any wrapper sentence such as "Here is..." or "Sure!".',
    '- Do NOT include the original headline as an H1; do NOT use headings larger than H2.',
    '- Preserve all factual claims from the source. Do not invent details or add opinions.',
    '- Keep the length roughly the same as the source (±20%).',
    '- Use short paragraphs separated by blank lines. Bullet lists are allowed when natural.',
  ].join('\n');
};

/**
 * User message containing the article context. The original title is provided
 * for grounding but the model is instructed (in the system prompt) not to
 * repeat it as a heading.
 */
export const buildNewsRewriteUserPrompt = ({
  title,
  content_origin,
}: {
  title: string;
  content_origin: string;
}): string => {
  return [
    `ORIGINAL TITLE (for context only — do not repeat as a heading):`,
    title,
    '',
    'ORIGINAL ARTICLE (markdown):',
    content_origin,
  ].join('\n');
};
