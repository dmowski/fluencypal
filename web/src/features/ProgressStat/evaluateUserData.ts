import { Conversation } from '../Conversation/conversation';
import dayjs from 'dayjs';
import { shuffleArray } from '@/libs/array';
import { buildProgressStatId } from './buildProgressStatId';
import { PROGRESS_ALGORITHM_VERSION } from './data';
import { convertMessagesToTranscript } from './convertMessagesToTranscript';
import {
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

export const evaluateUserData = async ({
  conversations,
  isAlreadyEvaluated,
  evaluateProgress,
  upsertProgressStat,
}: {
  conversations: Conversation[];
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
  console.log('DONE with processing conversations');
  //setProcessStarted(false);
};
