import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { NewsLanguageComplexity } from '@/features/News/types';
import { NativeLangCode } from '@/libs/language/type';
import { QuizSectionSpec } from './resolveIncludedSections';

const COMPLEXITY_GUIDANCE: Record<NewsLanguageComplexity, string> = {
  beginner: 'CEFR A1–A2: simple vocabulary and short sentences.',
  middle: 'CEFR B1: intermediate vocabulary and natural phrasing.',
  advance: 'CEFR C1: advanced vocabulary; nuanced comprehension.',
};

const QUESTION_SHAPE_BY_SECTION: Record<string, string> = {
  'word-translation':
    '{ "promptText": "...", "direction": "target-to-native" | "native-to-target", "options": [{"label":"..."}], "correctOptionLabel": "exact match to one option label" }',
  'fill-gap':
    '{ "segments": [{"kind":"text","text":"..."},{"kind":"gap","gapKey":"g1"}], "gaps": { "g1": { "options": [{"label":"..."}], "correctOptionLabel": "..." } } }',
  'read-and-answer':
    '{ "passageText": "...", "questionText": "...", "options": [{"label":"..."}], "correctOptionLabel": "..." }',
  listening:
    '{ "audioText": "...", "questionText": "...", "options": [{"label":"..."}], "correctOptionLabel": "..." }',
  'describe-picture-voice':
    '{ "promptText": "...", "minWords": 10, "evaluation": { "instruction": "how to grade the spoken answer" } }',
};

export const buildNewsQuizSystemPrompt = (): string => `You create language-learning quizzes from news articles.
Return a single valid JSON object. No markdown fences, no commentary.

CRITICAL structure rules:
1. Each section has a "type" field — one of: word-translation | fill-gap | read-and-answer | listening | describe-picture-voice
2. Questions inside a section do NOT have a "type" field. The section type defines the question shape.
3. Use the exact section type strings above (kebab-case, lowercase).
4. Each section must contain EXACTLY the requested number of questions.
5. Multiple-choice: exactly 4 options, ONE correct. "correctOptionLabel" must match one option "label" exactly (case-sensitive).
6. Passages, gap text, listening audioText, and read-and-answer content use the TARGET learning language. word-translation uses direction-specific languages (see user message).

Per-section question shapes (no "type" on questions):
- word-translation: ${QUESTION_SHAPE_BY_SECTION['word-translation']}
- fill-gap: ${QUESTION_SHAPE_BY_SECTION['fill-gap']}
- read-and-answer: ${QUESTION_SHAPE_BY_SECTION['read-and-answer']}
- listening: ${QUESTION_SHAPE_BY_SECTION['listening']}
- describe-picture-voice: ${QUESTION_SHAPE_BY_SECTION['describe-picture-voice']}

Content rules:
- word-translation: follow the word-translation language rules in the user message; alternate directions across questions when possible.
- fill-gap: 1–2 gaps per question; every gapKey in segments must exist in gaps.
- read-and-answer: passage excerpt from the article (2–4 sentences).
- listening: audioText is read aloud (1–3 sentences); question tests comprehension.
- describe-picture-voice: handled outside this request (vision API builds the single speaking question).
- examEvaluation.instruction: how to summarize overall performance.
- Default passingScorePercent: 70.`;

export const buildNewsQuizUserPrompt = (input: {
  title: string;
  content: string;
  complexity: NewsLanguageComplexity;
  targetLanguageCode: SupportedLanguage;
  nativeLanguageCode: NativeLangCode | null;
  sections: QuizSectionSpec[];
}): string => {
  const targetLang = fullLanguageName[input.targetLanguageCode] || input.targetLanguageCode;
  const nativeLang = input.nativeLanguageCode
    ? fullLanguageName[input.nativeLanguageCode as SupportedLanguage] || input.nativeLanguageCode
    : 'not set';

  const sectionLines = input.sections
    .map(
      (s) =>
        `- section.type: "${s.type}", title: "${s.title}", questions count: ${s.questionCount}`,
    )
    .join('\n');

  const wordTranslationRules =
    input.sections.some((section) => section.type === 'word-translation') &&
    input.nativeLanguageCode
      ? `
Word-translation language rules (CRITICAL):
- target-to-native: promptText in ${targetLang} (${input.targetLanguageCode}); all 4 option labels in ${nativeLang} (${input.nativeLanguageCode}).
- native-to-target: promptText in ${nativeLang} (${input.nativeLanguageCode}); all 4 option labels in ${targetLang} (${input.targetLanguageCode}).
- promptText must NEVER be identical to any option label — the learner picks a translation, not the same word repeated.
`
      : '';

  const exampleSection = input.sections[0];
  const exampleBlock = exampleSection
    ? `
Example section skeleton (repeat pattern for each section, adjust content):
{
  "type": "${exampleSection.type}",
  "title": "${exampleSection.title}",
  "questions": [ /* exactly ${exampleSection.questionCount} question objects, NO type field on questions */ ]
}
`
    : '';

  return `Create a quiz for this news article.

Article title: ${input.title}
Target language (user is learning): ${targetLang} (${input.targetLanguageCode})
Native language: ${nativeLang}
Complexity: ${input.complexity} — ${COMPLEXITY_GUIDANCE[input.complexity]}

Sections to generate:
${sectionLines}
${wordTranslationRules}${exampleBlock}
Top-level JSON shape:
{
  "meta": { "title": "...", "description": "...", "estimatedMinutes": 15 },
  "sections": [ /* one object per section listed above */ ],
  "examEvaluation": { "instruction": "...", "passingScorePercent": 70 }
}

Article content:
---
${input.content.slice(0, 12000)}
---`;
};
