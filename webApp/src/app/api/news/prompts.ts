import { NewsLanguageComplexity } from '@/features/News/types';

const COMPLEXITY_GUIDANCE: Record<NewsLanguageComplexity, string> = {
  beginner: [
    'Target CEFR level A1–A2.',
    'Use very simple, short sentences and the most common everyday vocabulary.',
    'Avoid idioms, phrasal verbs, and complex tenses (prefer present simple / past simple).',
  ].join(' '),
  middle: [
    'Target CEFR level B1.',
    'Use clear everyday language with moderate sentence length.',
    'Common phrasal verbs and a wider tense range are allowed, but avoid rare or technical jargon.',
  ].join(' '),
  advance: [
    'Target CEFR level C1.',
    'Use natural, fluent language with varied sentence structure.',
    'You may keep nuanced vocabulary and idiomatic phrasing, while staying clear and concise.',
  ].join(' '),
};

/**
 * System prompt for the news complexity rewrite. The model must output ONLY
 * markdown — no preface, no apology, no closing remarks.
 *
 * `targetLanguageName` is the English name of the user's learning language
 * (e.g. "English", "Spanish", "German"). The rewrite is produced in that
 * language regardless of the source article's language.
 */
export const buildNewsRewriteSystemPrompt = (
  complexity: NewsLanguageComplexity,
  targetLanguageName: string,
): string => {
  return [
    `You are a ${targetLanguageName}-language news editor for adult language learners.`,
    `Rewrite the user-provided news article in clear ${targetLanguageName} at the requested CEFR level.`,
    `The source article may be in any language; always output in ${targetLanguageName} regardless of source language.`,
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

/**
 * System prompt for the headline translation step. Produces a JSON object
 * with the translated `title` and `subTitle` so we can split them back out
 * with zero extra calls.
 */
export const buildNewsHeadlineTranslationSystemPrompt = (targetLanguageName: string): string => {
  return [
    `You translate short news headlines into ${targetLanguageName}.`,
    `Always reply with raw JSON only (no markdown, no code fences), with this exact shape:`,
    `{"title": "...", "subTitle": "..."}`,
    `Translate naturally into ${targetLanguageName}. Keep it concise and factual.`,
    `Do NOT add commentary, do NOT include the original text, do NOT add extra fields.`,
    `If the source is already in ${targetLanguageName}, return it unchanged.`,
  ].join('\n');
};

export const buildNewsHeadlineTranslationUserPrompt = ({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}): string => {
  return JSON.stringify({ title, subTitle });
};
