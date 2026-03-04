'use client';
import { AdvancedUserRecord } from '@/common/userInfo';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTextAi } from '../Ai/useTextAi';
dayjs.extend(duration);
dayjs.extend(relativeTime);

export function useExtractKnowledge() {
  const textAi = useTextAi();

  const extractUserRecords = async (
    info: string,
    oldRecords: AdvancedUserRecord[],
  ): Promise<AdvancedUserRecord[]> => {
    const systemMessage = `Given info.
Your goal is to extract information about user from his text.

Return info in JSON format.
Important information like name or location should be more important than interests, plans or preferences.

Return each fact on a new line. Example:
- name: John
- location: New York
- profession: software engineer
- experience: 5 years
- interests: coding, web development

In case of lack of information, return the word 'No information'.
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

  return {
    extractUserRecords,
  };
}
