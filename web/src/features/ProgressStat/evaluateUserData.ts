import { Conversation } from '../Conversation/conversation';
import dayjs from 'dayjs';
import { shuffleArray } from '@/libs/array';
import { buildProgressStatId } from './buildProgressStatId';
import { PROGRESS_ALGORITHM_VERSION } from './data';
import { convertMessagesToTranscript } from './convertMessagesToTranscript';
import {
  DailyQuestionData,
  ProgressEvaluationInput,
  ProgressEvaluationOutput,
  ProgressStatUpsertInput,
} from './types';

const minMessagesForEvaluation = 9;

const processConversation = async ({
  conversation,
  isAlreadyEvaluated,
  evaluateProgress,
  upsertProgressStat,
}: {
  conversation: Conversation;
  isAlreadyEvaluated: (progressStatId: string) => Promise<boolean>;
  evaluateProgress: (input: ProgressEvaluationInput) => Promise<ProgressEvaluationOutput>;
  upsertProgressStat: (input: ProgressStatUpsertInput) => Promise<string>;
}) => {
  const statId = buildProgressStatId({
    sourceType: 'conversation',
    sourceId: conversation.id,
    algorithmVersion: PROGRESS_ALGORITHM_VERSION,
  });

  const isAlreadyDone = await isAlreadyEvaluated(statId);
  if (isAlreadyDone) {
    console.log('Already done,', statId);
    return;
  }

  const transcriptText = convertMessagesToTranscript(conversation);
  const conversationDate =
    conversation.updatedAtIso ||
    conversation.createdAtIso ||
    dayjs(conversation.createdAt).toISOString() ||
    dayjs(conversation.updatedAt).toISOString();

  if (!conversationDate) {
    return;
  }
  console.log('starting procession', conversation.languageCode, conversationDate);

  const evaluationResult = await evaluateProgress({
    transcriptText: transcriptText,
    language: conversation.languageCode,
    sourceType: 'conversation',
    sourceId: conversation.id,
  });

  await upsertProgressStat({
    sourceType: 'conversation',
    sourceId: conversation.id,
    language: conversation.languageCode,
    sourceText: transcriptText,
    textLength: transcriptText.length,
    createdAtIso: conversationDate,
    ...evaluationResult.parsed,
  });
};

const processDailyQuestion = async ({
  dailyQuestion,
  isAlreadyEvaluated,
  evaluateProgress,
  upsertProgressStat,
}: {
  dailyQuestion: DailyQuestionData;
  isAlreadyEvaluated: (progressStatId: string) => Promise<boolean>;
  evaluateProgress: (input: ProgressEvaluationInput) => Promise<ProgressEvaluationOutput>;
  upsertProgressStat: (input: ProgressStatUpsertInput) => Promise<string>;
}) => {
  const statId = buildProgressStatId({
    sourceType: 'daily-question-answer',
    sourceId: dailyQuestion.questionSpaceId,
    algorithmVersion: PROGRESS_ALGORITHM_VERSION,
  });

  const isAlreadyDone = await isAlreadyEvaluated(statId);
  if (isAlreadyDone) {
    console.log('Already done,', statId);
    return;
  }

  const sortedMessages = dailyQuestion.messages.sort((a, b) => {
    // early first: use updatedAtIso.localeCompare
    return a.updatedAtIso.localeCompare(b.updatedAtIso);
  });
  const lastMessage = sortedMessages[sortedMessages.length - 1];
  if (!lastMessage) {
    return;
  }

  const lastUpdatedTime = lastMessage.updatedAtIso || lastMessage.createdAtIso;

  const questionAnswers = sortedMessages
    .map((message) => {
      return `${message.content}`;
    })
    .join('\n')
    .trim();

  if (questionAnswers.length < 30) {
    return;
  }

  const questions = `${dailyQuestion.question.title}\n${dailyQuestion.question.description}`;
  const transcriptText = `Question: ${questions}\n\nStudent answer(s):\n${questionAnswers}`;

  if (!lastUpdatedTime) {
    return;
  }

  console.log(
    'starting procession',
    dailyQuestion.languageCode,
    dailyQuestion.questionSpaceId,
    lastUpdatedTime,
  );

  const evaluationResult = await evaluateProgress({
    transcriptText: transcriptText,
    language: dailyQuestion.languageCode,
    sourceType: 'daily-question-answer',
    sourceId: dailyQuestion.questionSpaceId,
  });

  await upsertProgressStat({
    sourceType: 'daily-question-answer',
    sourceId: dailyQuestion.questionSpaceId,
    language: dailyQuestion.languageCode,
    sourceText: transcriptText,
    textLength: transcriptText.length,
    createdAtIso: lastUpdatedTime,
    ...evaluationResult.parsed,
  });
};

export const evaluateUserData = async ({
  conversations,
  userDailyQuestions,
  isAlreadyEvaluated,
  evaluateProgress,
  upsertProgressStat,
}: {
  conversations: Conversation[];
  userDailyQuestions: DailyQuestionData[];
  isAlreadyEvaluated: (progressStatId: string) => Promise<boolean>;
  evaluateProgress: (input: ProgressEvaluationInput) => Promise<ProgressEvaluationOutput>;
  upsertProgressStat: (input: ProgressStatUpsertInput) => Promise<string>;
}) => {
  if (!conversations) {
    return;
  }

  const maxCountToProcess = 300;
  const chunkSize = 10;
  const goodConversations = shuffleArray(
    conversations.filter((conversation) => {
      return conversation.messages && conversation.messages.length >= minMessagesForEvaluation;
    }),
  );

  const totalToProcess = Math.min(goodConversations.length, maxCountToProcess);

  for (let i = 0; i < totalToProcess; i += chunkSize) {
    const conversationChunk = goodConversations.slice(i, i + chunkSize);

    await Promise.all(
      conversationChunk.map((conversation) =>
        processConversation({
          conversation,
          isAlreadyEvaluated: isAlreadyEvaluated,
          evaluateProgress: evaluateProgress,
          upsertProgressStat: upsertProgressStat,
        }),
      ),
    );
  }

  for (const dailyQuestion of userDailyQuestions) {
    await processDailyQuestion({
      dailyQuestion,
      isAlreadyEvaluated: isAlreadyEvaluated,
      evaluateProgress: evaluateProgress,
      upsertProgressStat: upsertProgressStat,
    });
  }
};
