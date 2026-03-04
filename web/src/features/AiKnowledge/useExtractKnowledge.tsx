'use client';
import { AdvancedUserRecord } from '@/common/userInfo';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTextAi } from '../Ai/useTextAi';
import { Conversation } from '@/common/conversation';
import { getSortedMessages } from '../Conversation/getSortedMessages';
dayjs.extend(duration);
dayjs.extend(relativeTime);

export function useExtractKnowledge() {
  const textAi = useTextAi();

  const extractUserRecords = async (
    info: string,
    oldRecords: AdvancedUserRecord[],
  ): Promise<AdvancedUserRecord[]> => {
    const systemMessage = `Given info. Your goal is to extract existing information about user from the text.

Important information like name or location should be more important than interests, plans or preferences.

Return each fact on a new line.

Example of returned facts based on given info:
- name: John
- location: New York
- profession: software engineer
- experience: 5 years
- interests: coding, web development


In case of lack of information at all, return the word 'No information'.
`;
    let parsedSummary = '';
    try {
      parsedSummary = await textAi.generate({
        userMessage: info,
        systemMessage,
        model: 'gpt-4o',
      });
    } catch (e) {
      console.error('Error extracting knowledge:', e);
      return oldRecords;
    }

    const ifNoInformation = parsedSummary.trim().toLowerCase() === 'no information';
    if (ifNoInformation) {
      return oldRecords;
    }

    if (!parsedSummary) {
      return oldRecords;
    }

    // YYYY-MM-DD
    const createdAtDayIso = dayjs().format('YYYY-MM-DD');

    const parsed = parsedSummary
      .split('\n')
      .map((fact) => fact.trim())
      .filter(Boolean);

    const newRecords: AdvancedUserRecord[] = parsed.map((fact) => {
      const cleanFact = fact.replace(/^-/, '').trim();
      const record: AdvancedUserRecord = {
        createdAtDayIso,
        value: cleanFact,
      };
      return record;
    });

    return [...newRecords, ...oldRecords];
  };

  const extractRecordsFromConversation = async (
    conversation: Conversation,
    oldRecords: AdvancedUserRecord[],
  ) => {
    if (conversation.messages.length < 3) {
      return oldRecords;
    }

    const sortedMessages = getSortedMessages({
      conversation: conversation.messages,
      messageOrder: conversation.messageOrder,
    });

    const messagesList = sortedMessages
      .map((m) => {
        const author = m.isBot ? 'Teacher' : 'User';

        const cleanText = m.text.replace(/\n/g, ' ').trim();
        return `${author}: ${cleanText}`;
      })
      .join('\n');

    const info = `Conversation between user and AI teacher:
${messagesList}

Extract information about user from this conversation.`;

    return extractUserRecords(info, oldRecords);
  };

  const simplifyRecords = async (records: AdvancedUserRecord[]) => {
    const sortedByDate = [...records].sort((a, b) => {
      return b.createdAtDayIso.localeCompare(a.createdAtDayIso);
    });

    const uniqRecords: AdvancedUserRecord[] = [];

    for (const record of sortedByDate) {
      const isDuplicate = uniqRecords.some(
        (r) => r.value.toLowerCase().trim() === record.value.toLowerCase().trim(),
      );
      if (!isDuplicate) {
        uniqRecords.push(record);
      }
    }

    return uniqRecords;
  };

  return {
    extractUserRecords,
    extractRecordsFromConversation,
    simplifyRecords,
  };
}
