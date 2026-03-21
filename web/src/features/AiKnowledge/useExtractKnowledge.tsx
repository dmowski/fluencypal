'use client';
import { AdvancedUserRecord } from '@/features/User/userInfo';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTextAi } from '../Ai/useTextAi';
import {
  Conversation,
  ConversationMessage,
  MessagesOrderMap,
} from '@/features/Conversation/conversation';
import { getSortedMessages } from '../Conversation/getSortedMessages';
dayjs.extend(duration);
dayjs.extend(relativeTime);

export type ExtractKnowledgeMode = 'user-info' | 'grammar';

const extractSystemPrompts: Record<ExtractKnowledgeMode, string> = {
  'user-info': `Given info. Your goal is to extract existing information about user from the text.

Important information like name or location should be more important than interests, plans or preferences.

Return each fact on a new line.

Example of returned facts based on given info:
- name: John
- location: New York
- profession: software engineer
- experience: 5 years
- interests: coding, web development
- exam preparation: planning to take TOEFL in 6 months
- studying English with a teacher and likes it

In case of lack of information at all, return the word 'No information.'.
`,
  grammar: `Given info. Your goal is to extract information about user's grammar mistakes and difficulties from the text.

Return each topic to improve on a new line with short example of mistake.

Example of returned facts based on given info:
- Need to practice past tense verbs (e.g. "I goed to the store" should be "I went to the store")
- Need to improve prepositions, especially "in" and "on" (e.g. "I am good in English" should be "I am good at English")
- Need to improve using articles "a" and "the" (e.g. "I have cat" should be "I have a cat")
- It's worth practicing conditionals, especially second conditional (e.g. "If I will be rich, I will buy a house" should be "If I were rich, I would buy a house")
- Strong need to work on word order in complex sentences (e.g. "I only like English" should be "Only I like English" or "I like only English")

In case of perfect grammar, return the word 'No information.'.`,
};

export function useExtractKnowledge() {
  const textAi = useTextAi();

  const extractUserRecords = async ({
    context,
    mode,
  }: {
    context: string;
    mode: ExtractKnowledgeMode;
  }): Promise<AdvancedUserRecord[]> => {
    const systemMessage = extractSystemPrompts[mode];

    let factsAiResponse = '';
    try {
      factsAiResponse = await textAi.generate({
        userMessage: context,
        systemMessage,
        model: 'gpt-4o',
      });
    } catch (e) {
      console.error('Error extracting knowledge:', e);
      return [];
    }

    console.log('Facts AiResponse from context');
    console.log(systemMessage);
    console.log('-');
    console.log(context);
    console.log('-');
    console.log(factsAiResponse);

    console.log('--------------------');

    return parseFactsFromText(factsAiResponse);
  };

  const parseFactsFromText = (aiResponse: string): AdvancedUserRecord[] => {
    const ifNoInformation = aiResponse.trim().toLowerCase() === 'no information.';
    if (ifNoInformation) {
      return [];
    }

    if (!aiResponse) {
      return [];
    }

    // YYYY-MM-DD
    const createdAtDayIso = dayjs().format('YYYY-MM-DD');

    const parsed = aiResponse
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

    return newRecords;
  };

  const getConversationText = ({
    messages,
    messageOrder,
    lastMessagesCount,
  }: {
    messages: ConversationMessage[];
    messageOrder: MessagesOrderMap;
    lastMessagesCount?: number;
  }) => {
    if (messages.length < 3) {
      return '';
    }

    const sortedMessages = getSortedMessages({
      conversation: messages,
      messageOrder: messageOrder,
    });

    const messagesToProcess = lastMessagesCount
      ? sortedMessages.slice(-lastMessagesCount)
      : sortedMessages;

    console.log('messagesToProcess', messagesToProcess);

    const messagesList = messagesToProcess
      .map((m) => {
        const author = m.isBot ? 'Teacher' : 'User';

        const cleanText = m.text.replace(/\n/g, ' ').trim();
        return `${author}: ${cleanText}`;
      })
      .join('\n');

    return messagesList;
  };

  const extractUserInfoRecordsFromConversation = async ({
    messages,
    messageOrder,
    lastMessagesCount,
    mode,
  }: {
    messages: ConversationMessage[];
    messageOrder: MessagesOrderMap;
    lastMessagesCount?: number;
    mode: ExtractKnowledgeMode;
  }) => {
    if (messages.length < 3) {
      return [];
    }

    const messagesList = getConversationText({
      messages: messages,
      messageOrder,
      lastMessagesCount,
    });

    const info = `Conversation between User and AI teacher:
${messagesList}`;

    return extractUserRecords({ context: info, mode });
  };

  const cleanUpRecords = async (records: AdvancedUserRecord[]) => {
    if (records.length < 2) {
      return records;
    }

    const systemMessage = `Your goal is to clean up user information records.

Your goal is to clean up and unify the records, remove duplicates and contradictions.
You should also unify similar records, for example:
- "name: John" and "name: John Doe" can be unified into "name: John Doe"
- "location: New York" and "location: NYC" can be unified into "location: New York City"

Return only cleaned up records, without any explanations. Return each record on a new line.
Return in the format: 
 - {DATE}: {RECORD}

If original records already look good and clean, return the word "OK".
`;

    const inputInFormat = records.map((r) => `- ${r.createdAtDayIso}: ${r.value}`).join('\n');
    let parsedSummary = '';

    try {
      parsedSummary = await textAi.generate({
        userMessage: inputInFormat,
        systemMessage,
        model: 'gpt-4o',
      });
      console.log('parsedSummary');
      console.log(parsedSummary);
    } catch (e) {
      console.error('Error cleaning up records:', e);
      return records;
    }

    const ifOk = parsedSummary.trim().toLowerCase() === 'ok';
    if (ifOk) {
      return records;
    }

    if (!parsedSummary) {
      return records;
    }

    const lines = parsedSummary
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line.startsWith('- '));

    if (lines.length === 0) {
      return records;
    }

    const cleanedRecords: AdvancedUserRecord[] = lines.map((line) => {
      const date = line.substring(2, 12);
      const value = line.substring(14).trim();
      return {
        createdAtDayIso: date,
        value,
      };
    });

    return cleanedRecords;
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

    const cleanedRecords = await cleanUpRecords(uniqRecords);

    return cleanedRecords;
  };

  return {
    extractUserRecords,
    extractUserInfoRecordsFromConversation,
    simplifyRecords,
  };
}
