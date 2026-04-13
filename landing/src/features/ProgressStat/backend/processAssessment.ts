/**
 * Process my conversations
 * Run assessment on users that logged in today
 */

import { getDB } from '@/app/api/config/firebase';
import { getAllUsersWithIds, getUserConversationsMeta } from '@/app/api/user/getUserInfo';
import {
  DailyQuestionData,
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
import { TextAiJsonError } from '@/features/Ai/types';
import { progressAssessmentSchema } from '../progressSchemas';
import { normalizeAssessment } from '../normalizeAssessment';
import { evaluateUserData } from '../evaluateUserData';
import { generateStrictJson } from '../../../app/api/ai/generateJson';
import { dailyQuestions } from '@/features/DailyQuestion/dailyQuestions';
import { supportedLanguages } from '@/features/Lang/lang';
import { getDailyQuestionSpaceId } from '@/features/DailyQuestion/getDailyQuestionSpaceId';
import { ThreadsMessage } from '@/features/Chat/type';

export const processAssessment = async () => {
  const allUsers = await getAllUsersWithIds({
    limits: 30,
  });

  const questionsData = await getDailyQuestionsData();

  const userIdsToProcess = allUsers.map((user) => user.id);

  for (const userId of userIdsToProcess) {
    const conversationsMeta = await getUserConversationsMeta(userId);
    const userDailyQuestions = filterOnlyUserDailyQuestions(questionsData, userId);

    await evaluateUserData({
      conversations: conversationsMeta.conversations,
      userDailyQuestions,
      isAlreadyEvaluated: (progressStatId: string) => isAlreadyEvaluated(progressStatId, userId),
      evaluateProgress: evaluateProgress,
      upsertProgressStat: (input: ProgressStatUpsertInput) => upsertProgressStat(input, userId),
    });
  }
};

const getDailyQuestionsData = async () => {
  const spaces = await getAllChatSpaces();
  const questions = Object.values(dailyQuestions);
  const data: DailyQuestionData[] = [];
  for (const lang of supportedLanguages) {
    for (const question of questions) {
      const spaceId = getDailyQuestionSpaceId(question, lang);
      const isExists = spaces.includes(spaceId);
      if (!isExists) {
        continue;
      }
      const messages = await getChatSpaceMessages(spaceId);
      data.push({
        question,
        questionSpaceId: spaceId,
        messages,
        languageCode: lang,
      });
    }
  }

  return data;
};

const filterOnlyUserDailyQuestions = (
  dailyQuestionData: DailyQuestionData[],
  userId: string,
): DailyQuestionData[] => {
  const data: DailyQuestionData[] = [];

  for (const item of dailyQuestionData) {
    const userMessages = item.messages.filter((message) => message.senderId === userId);
    if (userMessages.length > 0) {
      data.push({
        question: item.question,
        questionSpaceId: item.questionSpaceId,
        messages: userMessages,
        languageCode: item.languageCode,
      });
    }
  }

  return data;
};

const getChatSpaceMessages = async (spaceId: string) => {
  const db = getDB();
  const messagesCollectionRef = db.collection('chat').doc(spaceId).collection('messages');
  const snapshot = await messagesCollectionRef.get();
  const messages: ThreadsMessage[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data() as ThreadsMessage;
    messages.push(data);
  });
  return messages;
};

const getAllChatSpaces = async (): Promise<string[]> => {
  const db = getDB();
  const chatCollectionRef = db.collection('chat');
  const snapshot = await chatCollectionRef.get();
  const spaceIds: string[] = [];
  snapshot.forEach((doc) => {
    spaceIds.push(doc.id);
  });
  return spaceIds;
};

const isChatSpaceExists = async (spaceId: string): Promise<boolean> => {
  const db = getDB();
  const spaceDocRef = db.collection('chat').doc(spaceId);
  const spaceDoc = await spaceDocRef.get();
  return spaceDoc.exists;
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
