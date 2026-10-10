import { z } from 'zod';
import { generateJsonResult } from '@/features/Ai/generateJson';
import { extractJsonFromAiResponse, parseStrictJson } from '@/features/Ai/jsonParser';
import { TextAiContextType } from '@/features/Ai/types';
import { SupportedLanguage, fullEnglishLanguageName } from '@/features/Lang/lang';
import { fnv1aHash } from '@/libs/hash';
import { QuizSurvey2FollowUpQuestion } from './types';

const FOLLOW_UP_QUESTION_MODEL = 'gpt-4o-mini' as const;

const inFlightFollowUpQuestions = new Set<string>();

export const followUpQuestionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(8)
    .max(280)
    .refine((title) => /[?？؟]$/.test(title), {
      message: 'Follow-up must be one question',
    }),
});

export const followUpQuestionHash = (transcript: string, languageCode: string): string => {
  const trimmed = transcript.trim();
  if (!trimmed || !languageCode) return '';
  return fnv1aHash(`${languageCode}\n${trimmed}`);
};

export const isFollowUpQuestionReady = (
  question: Pick<QuizSurvey2FollowUpQuestion, 'title' | 'hash'> | null | undefined,
  transcript: string,
  languageCode: string,
): boolean => {
  const hash = followUpQuestionHash(transcript, languageCode);
  return Boolean(hash && question?.title?.trim() && question.hash === hash);
};

/** One request per transcript and page language. Returns the hash to generate, or null. */
export const claimFollowUpQuestion = (
  transcript: string,
  languageCode: string,
  saved: Pick<QuizSurvey2FollowUpQuestion, 'title' | 'hash'> | null | undefined,
): string | null => {
  const hash = followUpQuestionHash(transcript, languageCode);
  if (!hash) return null;
  if (isFollowUpQuestionReady(saved, transcript, languageCode)) return null;
  if (inFlightFollowUpQuestions.has(hash)) return null;
  inFlightFollowUpQuestions.add(hash);
  return hash;
};

export const releaseFollowUpQuestion = (hash: string): void => {
  inFlightFollowUpQuestions.delete(hash);
};

export const resetFollowUpQuestionClaims = (): void => {
  inFlightFollowUpQuestions.clear();
};

export const buildFollowUpQuestionMessages = (input: {
  transcript: string;
  languageName: string;
}) => ({
  systemMessage: [
    'You write one follow-up question for an adult who just said why they want to practice a language.',
    'Include one concrete detail they mentioned, such as their job, a place, an exam, or the people they named.',
    'If they were vague, ask which real situation they want to handle.',
    'Do not ask a question that would fit any learner.',
    'One sentence only.',
    `Write the question in ${input.languageName}.`,
    'End with a question mark.',
    'Put that question in the title field.',
    'Return only a JSON object, with no question written outside it.',
  ].join(' '),
  userMessage: `What they said:\n${input.transcript.trim()}`,
});

const questionSentenceFromText = (text: string): string | null => {
  const compact = text.replace(/\s+/g, ' ').trim();
  const match = compact.match(/([^.!?]{8,280}[?？؟])/);
  if (!match) return null;
  const title = match[1].trim();
  return followUpQuestionSchema.safeParse({ title }).success ? title : null;
};

/**
 * Models sometimes write the question as prose and a placeholder object
 * such as {"title":"Follow-up Question"}. Keep a valid title, otherwise
 * use the question sentence.
 */
export const coerceFollowUpQuestionResponse = (raw: string): string => {
  const embedded = extractJsonFromAiResponse(raw);
  try {
    const parsed: unknown = JSON.parse(embedded);
    if (followUpQuestionSchema.safeParse(parsed).success) {
      return JSON.stringify(parsed);
    }
  } catch {
    // The embedded slice is not JSON yet; the strict parser can still repair it.
  }

  const prose = embedded === raw.trim() ? raw : raw.replace(embedded, ' ');
  const question = questionSentenceFromText(prose);
  if (question) return JSON.stringify({ title: question });
  return raw;
};

export const generateFollowUpQuestion = async (input: {
  textAi: TextAiContextType;
  transcript: string;
  languageCode: SupportedLanguage;
}): Promise<string> => {
  const languageName = fullEnglishLanguageName[input.languageCode] || 'English';
  const messages = buildFollowUpQuestionMessages({
    transcript: input.transcript,
    languageName,
  });
  const { parsed } = await generateJsonResult({
    conversationDate: {
      ...messages,
      model: FOLLOW_UP_QUESTION_MODEL,
      cache: false,
      languageCode: input.languageCode,
      attempts: 3,
    },
    parseResponse: (response) =>
      parseStrictJson({
        json: coerceFollowUpQuestionResponse(response),
        schema: followUpQuestionSchema,
        generate: input.textAi.generate,
        languageCode: input.languageCode,
      }),
    generate: input.textAi.generate,
  });
  return parsed.title.trim();
};
