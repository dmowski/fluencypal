/**
 * Process my conversations
 * Run assessment on users that logged in today
 */

import { getDB } from '@/app/api/config/firebase';
import { getUserConversationsMeta } from '@/app/api/user/getUserInfo';
import {
  ProgressEvaluationError,
  ProgressEvaluationInput,
  ProgressEvaluationOutput,
  ProgressStat,
  ProgressStatUpsertInput,
} from '../types';
import { createProgressStatData } from '../createProgressStatData';
import {
  getAiUserMessage,
  MAX_EVALUATION_ATTEMPTS,
  MODEL_FOR_ASSESSMENT,
  progressEvaluationSystemMessage,
} from '../aiPrompts';
import {
  AiTextGenerator,
  GenerateStrictJsonFunction,
  StrictJsonAiRequest,
  StrictJsonAiResponse,
  TextAiJsonError,
  TextAiRequest,
} from '@/features/Ai/types';
import { generateJsonResult } from '@/features/Ai/generateJson';
import { parseStrictJson } from '@/features/Ai/jsonParser';
import { generateTextWithAi } from '@/app/api/ai/generateTextWithAi';
import { progressAssessmentSchema } from '../progressSchemas';
import { normalizeAssessment } from '../normalizeAssessment';
import { evaluateUserData } from '../evaluateUserData';

export const processAssessment = async () => {
  const userIdsToProcess = [
    'K1S4bliZw4hYbpftEC6sG5s9WYj2',
    'mAqf0cibi2Wdp923LiPRsUyrDZi1',
    'Mq2HfU3KrXTjNyOpPXqHSPg5izV2',
  ];

  for (const userId of userIdsToProcess) {
    const conversationsMeta = await getUserConversationsMeta(userId);

    await evaluateUserData({
      conversations: conversationsMeta.conversations,
      isAlreadyEvaluated: (progressStatId: string) => isAlreadyEvaluated(progressStatId, userId),
      evaluateProgress: evaluateProgress,
      upsertProgressStat: (input: ProgressStatUpsertInput) => upsertProgressStat(input, userId),
    });
  }
};

const isAlreadyEvaluated = async (progressStatId: string, userId: string): Promise<boolean> => {
  const db = getDB();
  const statDocRef = db
    .collection('users')
    .doc(userId)
    .collection('progressStats')
    .doc(progressStatId);
  const statDoc = await statDocRef.get();
  return statDoc.exists;
};

const upsertProgressStat = async (
  input: ProgressStatUpsertInput,
  userId: string,
): Promise<string> => {
  const progressStat = createProgressStatData({ input, userId: userId });

  const db = getDB();
  const statDocRef = db
    .collection('users')
    .doc(userId)
    .collection('progressStats')
    .doc(progressStat.documentId);

  if (!statDocRef) {
    throw new Error('Invalid progress stat document reference');
  }

  statDocRef.set(progressStat.stat);
  return progressStat.documentId;
};

export const getAllProgressStatsForUser = async (userId: string): Promise<ProgressStat[]> => {
  const db = getDB();
  const statsCollectionRef = db.collection('users').doc(userId).collection('progressStats');
  const snapshot = await statsCollectionRef.get();
  const stats: ProgressStat[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data() as ProgressStat;
    stats.push(data);
  });
  return stats;
};

const generate: AiTextGenerator = async (conversationDate: TextAiRequest) => {
  const { output } = await generateTextWithAi({
    systemMessage: conversationDate.systemMessage,
    userMessage: conversationDate.userMessage,
    model: conversationDate.model,
  });

  const responseString = output || '';

  return responseString;
};

const generateStrictJson: GenerateStrictJsonFunction = async <T>(
  conversationDate: StrictJsonAiRequest<T>,
): Promise<StrictJsonAiResponse<T>> => {
  return generateJsonResult({
    conversationDate,
    parseResponse: (response) =>
      parseStrictJson({
        json: response,
        schema: conversationDate.schema,
        generate,
        languageCode: 'en',
      }),
    generate,
  });
};

const evaluateProgress = async (
  input: ProgressEvaluationInput,
): Promise<ProgressEvaluationOutput> => {
  const transcriptText = input.transcriptText.trim();

  if (!transcriptText) {
    throw new Error('Transcript is empty');
  }

  try {
    const userMessage = getAiUserMessage(input, transcriptText);

    try {
      const result = await generateStrictJson({
        systemMessage: progressEvaluationSystemMessage,
        userMessage,
        model: MODEL_FOR_ASSESSMENT,
        cache: false,
        languageCode: input.language,
        attempts: MAX_EVALUATION_ATTEMPTS,
        schema: progressAssessmentSchema,
      });

      return {
        rawOutput: result.rawOutput,
        parsed: normalizeAssessment(result.parsed),
      };
    } catch (error) {
      if (error instanceof TextAiJsonError) {
        throw new ProgressEvaluationError(
          `Failed to evaluate progress after ${error.attempts || MAX_EVALUATION_ATTEMPTS} attempts`,
          {
            rawOutput: error.rawOutput,
            parseError: error.cause instanceof Error ? error.cause.message : error.message,
            attempts: error.attempts || MAX_EVALUATION_ATTEMPTS,
            cause: error,
          },
        );
      }

      throw new ProgressEvaluationError('Failed to evaluate progress', {
        parseError: error instanceof Error ? error.message : 'Unknown evaluation error',
        attempts: MAX_EVALUATION_ATTEMPTS,
        cause: error,
      });
    }
  } finally {
  }
};
