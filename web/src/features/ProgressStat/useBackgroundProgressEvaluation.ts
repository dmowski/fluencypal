import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { Conversation } from '../Conversation/conversation';
import {
  buildProgressStatId,
  PROGRESS_ALGORITHM_VERSION,
  useProgressStats,
} from './useProgressStats';
import { useEffect, useState } from 'react';
import { useProgressEvaluation } from './useProgressEvaluation';
import { getSortedMessages } from '../Conversation/getSortedMessages';
import dayjs from 'dayjs';
import { shuffleArray } from '@/libs/array';

export const useBackgroundProgressEvaluation = () => {
  const auth = useAuth();
  const progressStats = useProgressStats();
  const progressEvaluation = useProgressEvaluation();
  const userId = auth.uid;
  const collectionRef = db.collections.conversation(userId);
  const [conversations = [], loading] = useCollectionDataOnce(collectionRef);

  const convertMessagesToTranscript = (conversation: Conversation): string => {
    const sortedMessages = getSortedMessages({
      conversation: conversation.messages,
      messageOrder: conversation.messageOrder || {},
    });
    let transcript: string = '';
    sortedMessages.forEach((message) => {
      const isUser = message.isBot === false;
      const role = isUser ? 'Student' : 'Teacher';
      transcript += `${role}: ${message.text}\n`;
    });
    return transcript;
  };

  const processConversation = async (conversation: Conversation) => {
    if (conversation.messages.length < 10) {
      return;
    }

    const statId = buildProgressStatId({
      sourceType: 'conversation',
      sourceId: conversation.id,
      algorithmVersion: PROGRESS_ALGORITHM_VERSION,
    });

    const isAlreadyEvaluated = await progressStats.isAlreadyEvaluated(statId);
    if (isAlreadyEvaluated) {
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

    const evaluationResult = await progressEvaluation.evaluateProgress({
      transcriptText: transcriptText,
      language: conversation.languageCode,
      sourceType: 'conversation',
      sourceId: conversation.id,
    });

    await progressStats.upsertProgressStat({
      sourceType: 'conversation',
      sourceId: conversation.id,
      language: conversation.languageCode,
      sourceText: transcriptText,
      textLength: transcriptText.length,
      createdAtIso: conversationDate,
      ...evaluationResult.parsed,
    });
  };

  const processAllConversations = async () => {
    if (!conversations) {
      return;
    }

    setProcessStarted(true);
    const maxCountToProcess = 100;
    const goodConversations = shuffleArray(
      conversations.filter((conversation) => {
        return (
          conversation.messageOrder && conversation.messages && conversation.messages.length >= 10
        );
      }),
    );

    for (let i = 0; i < Math.min(goodConversations.length, maxCountToProcess); i++) {
      const conversation = goodConversations[i];
      await processConversation(conversation);
    }
    console.log('DONE with processing conversations');
    //setProcessStarted(false);
  };

  const [processStarted, setProcessStarted] = useState(false);
  const isReadyToProcess =
    conversations.length > 0 && !loading && !progressStats.loadingProgressStats && !processStarted;

  useEffect(() => {
    if (isReadyToProcess) {
      processAllConversations();
    }
  }, [isReadyToProcess]);
};
