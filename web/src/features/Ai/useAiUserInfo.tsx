'use client';
import { createContext, useContext, ReactNode, JSX, useMemo } from 'react';
import { ConversationMessage, MessagesOrderMap } from '@/common/conversation';
import { AdvancedUserRecord, AiUserInfo, FirstBotConversationMessage } from '@/common/userInfo';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useTextAi } from './useTextAi';
import { getDoc, setDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useSettings } from '../Settings/useSettings';
import { ExtractKnowledgeMode, useExtractKnowledge } from '../AiKnowledge/useExtractKnowledge';
dayjs.extend(duration);
dayjs.extend(relativeTime);

export interface ConversationIdea {
  firstMessage: string;
  potentialTopics: string;
}

interface AiUserInfoContextType {
  userInfo: AiUserInfo | null;
  advancedUserRecords: string;

  generateFirstMessageText: (topic: string) => Promise<ConversationIdea>;

  addRecord: (record: AdvancedUserRecord) => Promise<void>;
  updateRecord: (index: number, record: AdvancedUserRecord) => Promise<void>;
  updateAllRecords: (records: AdvancedUserRecord[]) => Promise<void>;
  deleteRecord: (index: number) => Promise<void>;

  extractAdvancedUserRecordsFromConversation: (props: {
    messages: ConversationMessage[];
    messageOrder: MessagesOrderMap;
    lastMessagesCount?: number;
    isNeedToCleanUpOldRecords: boolean;
    mode: ExtractKnowledgeMode;
  }) => Promise<void>;

  extractUserRecordsFromText?: (context: string) => Promise<AdvancedUserRecord[]>;
}

const AiUserInfoContext = createContext<AiUserInfoContextType | null>(null);

function useProvideAiUserInfo(): AiUserInfoContextType {
  const auth = useAuth();
  const settings = useSettings();
  const languageCode = settings.languageCode || 'en';
  const textAi = useTextAi();
  const dbDocRef = db.documents.aiUserInfo(auth.uid);
  const [userInfo] = useDocumentData<AiUserInfo>(dbDocRef);

  const getActualAdvancedUserRecords = async (): Promise<{
    advancedRecords: AdvancedUserRecord[];
    grammarRecords: AdvancedUserRecord[];
  }> => {
    // get from database
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.getActualAdvancedUserRecords');
    }

    const userInfoData = await getDoc(dbDocRef);
    const userInfo = userInfoData.data();
    if (!userInfo) {
      return {
        advancedRecords: [],
        grammarRecords: [],
      };
    }

    return {
      advancedRecords: userInfo.advancedRecords || [],
      grammarRecords: userInfo.grammarRecords || [],
    };
  };

  const updateGrammarRecords = async (grammarRecords: AdvancedUserRecord[]) => {
    if (grammarRecords.length === 0) return;
    if (!dbDocRef) throw new Error('dbDocRef is not defined | useAiUserInfo.updateGrammarRecords');

    await setDoc(
      dbDocRef,
      {
        grammarRecords,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  };

  const updateAdvancedUserRecords = async (advancedRecords: AdvancedUserRecord[]) => {
    if (advancedRecords.length === 0) return;
    if (!dbDocRef)
      throw new Error('dbDocRef is not defined | useAiUserInfo.updateAdvancedUserRecords');

    await setDoc(
      dbDocRef,
      {
        advancedRecords,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  };

  const extractInfo = useExtractKnowledge();

  const extractUserRecordsFromText = async (context: string): Promise<AdvancedUserRecord[]> => {
    const newRecords = await extractInfo.extractUserRecords({ context, mode: 'user-info' });
    const oldRecords = await getActualAdvancedUserRecords();
    const simplifiedResult = await extractInfo.simplifyRecords([
      ...oldRecords.advancedRecords,
      ...newRecords,
    ]);
    console.log('extractUserRecordsFromText: User Advanced info', simplifiedResult);

    await updateAdvancedUserRecords(simplifiedResult);
    return simplifiedResult;
  };

  const extractAdvancedUserRecordsFromConversation = async (props: {
    messages: ConversationMessage[];
    messageOrder: MessagesOrderMap;
    lastMessagesCount?: number;
    isNeedToCleanUpOldRecords: boolean;
    mode: ExtractKnowledgeMode;
  }): Promise<void> => {
    const newRecords = await extractInfo.extractUserInfoRecordsFromConversation({
      ...props,
    });

    const oldRecordsAll = await getActualAdvancedUserRecords();

    const oldRecords =
      props.mode === 'user-info' ? oldRecordsAll.advancedRecords : oldRecordsAll.grammarRecords;

    const simplifiedAllRecords = props.isNeedToCleanUpOldRecords
      ? newRecords
      : await extractInfo.simplifyRecords([...oldRecords, ...newRecords]);

    if (props.mode === 'user-info') {
      await updateAdvancedUserRecords(simplifiedAllRecords);
    }

    if (props.mode === 'grammar') {
      await updateGrammarRecords(simplifiedAllRecords);
    }
  };

  const advancedUserRecords = useMemo(() => {
    if (!userInfo || !userInfo.advancedRecords) {
      return '';
    }
    // YYYY-MM-DD
    const todayIso = dayjs().format('YYYY-MM-DD');
    const sortedRecords = userInfo.advancedRecords.sort((a, b) =>
      b.createdAtDayIso.localeCompare(a.createdAtDayIso),
    );
    const recordsString = sortedRecords
      .map((record) => `${record.createdAtDayIso}: ${record.value}`)
      .join('\n');
    return `${todayIso}: today \n${recordsString}`;
  }, [userInfo]);

  const saveUserInfo = async (data: Partial<AiUserInfo>) => {
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.saveUserInfo');
    }

    await setDoc(
      dbDocRef,
      {
        ...data,
        createdAt: userInfo?.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  };

  const updateRecord = async (index: number, record: AdvancedUserRecord) => {
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.updateRecord');
    }

    const currentRecords = [...(userInfo?.advancedRecords || [])];
    if (index < 0 || index >= currentRecords.length) return;

    const trimmedRecord = record.value.trim();
    if (!trimmedRecord) return;

    if (!currentRecords[index]) {
      return;
    }

    currentRecords[index] = { ...record, value: trimmedRecord };
    await updateAdvancedUserRecords(currentRecords);
  };

  const deleteRecord = async (index: number) => {
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.deleteRecord');
    }

    const currentRecords = [...(userInfo?.advancedRecords || [])];
    if (index < 0 || index >= currentRecords.length) return;

    const updatedRecords = currentRecords.filter((_, i) => i !== index);
    await saveUserInfo({ advancedRecords: updatedRecords });
  };

  const addFirstConversationMessage = async (message: string) => {
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.addFirstConversationMessage');
    }

    const record: FirstBotConversationMessage = {
      createdAt: Date.now(),
      text: message,
    };

    const oldFirstMessages = userInfo?.firstBotMessages || [];
    const updatedFirstMessages = [...oldFirstMessages, record];
    setDoc(
      dbDocRef,
      {
        firstBotMessages: updatedFirstMessages,
        updatedAt: Date.now(),
      },
      { merge: true },
    );
  };

  const getLastFirstMessage = async (count: number) => {
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.getLastFirstMessage');
    }

    const firstMessages = userInfo?.firstBotMessages || [];
    const sortedMessage = firstMessages.sort((a, b) => b.createdAt - a.createdAt);
    const lastMessages = sortedMessage.slice(0, count);

    const lastMessagesText = lastMessages.map((message) => {
      const timeAgo = dayjs(message.createdAt).fromNow();
      return message.text + ` (${timeAgo})`;
    });

    return lastMessagesText;
  };

  const generateFirstMessageText = async (topic: string) => {
    const firstMessages: string[] = await getLastFirstMessage(4);

    const potentialTopicsToDiscuss =
      topic ||
      (await textAi.generate({
        systemMessage: `Your are tool to guess the users interests. User will provide list of their interests.
Your task is to guess the most interesting topic for the user based on their interests.
Example of input: Football, Learning languages.
Example of output: Traveling, Events, Concerts

Return list of 6 topics comma separated. Do not add any other wrapper text. 
Important that your guess should be not straightforward, but interesting and fun.
`,
        userMessage: `
### User Info (Use this to guess the interest):
${advancedUserRecords}
`,
        model: 'gpt-4o',
        cache: false,
        languageCode,
      }));

    const systemMessage = `
You're Fluency Pal's conversational AI.
Write ONE playful, extremely short (≤10 words) message starting with a casual greeting like "Hey", "Hi", or a funny greeting phrase.
Pick only one potential user interest (You need guess it based on user's info).
Do not reference recent topics at all, because it was already discussed.
No emojis or symbols. Keep it lightweight, casual, and fresh.

### Potential topics to discuss (Use this to guess the interest):
${potentialTopicsToDiscuss}

### Task:
Write ONE extremely short (≤10 words), playful message starting with "Hey", "Hi", or a funny greeting phrase. Use a DIFFERENT, SINGLE interest. Language: ${settings.fullLanguageName || 'English'}.
    `;

    const userMessage = `
### Recent topics (Already discussed. Strictly avoid them):
${firstMessages.length === 0 ? 'None' : firstMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}
`;

    const response = await textAi.generate({
      systemMessage,
      userMessage,
      model: 'gpt-4o',
      cache: false,
      languageCode,
    });

    const responseString = response || '';

    await addFirstConversationMessage(responseString);

    return {
      firstMessage: responseString,
      potentialTopics: potentialTopicsToDiscuss,
    };
  };

  const addRecord = async (record: AdvancedUserRecord) => {
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.addRecord');
    }

    const trimmedValue = record.value.trim();
    if (!trimmedValue) {
      return;
    }

    const newRecord = { ...record, value: trimmedValue };
    const currentRecords = [...(userInfo?.advancedRecords || []), newRecord];
    await updateAdvancedUserRecords(currentRecords);
  };

  const updateAllRecords = async (records: AdvancedUserRecord[]) => {
    if (!dbDocRef) {
      throw new Error('dbDocRef is not defined | useAiUserInfo.updateAllRecords');
    }

    const validRecords = records
      .map((record) => ({ ...record, value: record.value.trim() }))
      .filter((record) => record.value);

    await updateAdvancedUserRecords(validRecords);
  };

  return {
    advancedUserRecords,
    userInfo: userInfo || null,
    generateFirstMessageText,
    deleteRecord,
    extractAdvancedUserRecordsFromConversation,
    updateRecord,
    updateAllRecords,
    extractUserRecordsFromText,
    addRecord,
  };
}

export function AiUserInfoProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideAiUserInfo();
  return <AiUserInfoContext.Provider value={hook}>{children}</AiUserInfoContext.Provider>;
}

export const useAiUserInfo = (): AiUserInfoContextType => {
  const context = useContext(AiUserInfoContext);
  if (!context) {
    throw new Error('useAiUserInfo must be used within a AiUserInfoProvider');
  }
  return context;
};
