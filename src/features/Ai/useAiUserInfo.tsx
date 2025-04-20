"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { ChatMessage } from "@/common/conversation";
import { AiUserInfo, AiUserInfoRecord, FirstBotConversationMessage } from "@/common/userInfo";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/db";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useTextAi } from "./useTextAi";
import { setDoc } from "firebase/firestore";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSettings } from "../Settings/useSettings";
import { SupportedLanguage } from "@/features/Lang/lang";
dayjs.extend(duration);
dayjs.extend(relativeTime);

interface AiUserInfoContextType {
  updateUserInfo: (
    conversation: ChatMessage[],
    languageCode: SupportedLanguage
  ) => Promise<{
    records: AiUserInfoRecord[];
  }>;
  userInfo: AiUserInfo | null;
  generateFirstMessageText: (
    topic: string,
    languageCode: SupportedLanguage
  ) => Promise<{ firstMessage: string; potentialTopics: string }>;
}

const AiUserInfoContext = createContext<AiUserInfoContextType | null>(null);

function useProvideAiUserInfo(): AiUserInfoContextType {
  const auth = useAuth();
  const settings = useSettings();
  const textAi = useTextAi();
  const dbDocRef = db.documents.aiUserInfo(auth.uid);
  const [userInfo] = useDocumentData<AiUserInfo>(dbDocRef);

  const cleanUpSummary = async (summary: string[], lang: SupportedLanguage) => {
    const systemMessage = `Given information about users from conversation with AI language teacher.
Your goal is to clean up repeated information and return only unique information.
Return info in JSON format.
Do not wrap answer with any wrappers like "answer": "...". Your response will be sent to JSON.parse() function.
Example of return value: ["User's name is Alex", "Learning English", "Interested in programming", "From USA", "25 years old", "A student"]
If not relevant information found, return empty array.
`;
    const aiUserMessage = JSON.stringify(summary);
    const summaryFromConversation = await textAi.generate({
      userMessage: aiUserMessage,
      systemMessage,
      model: "gpt-4o",
      languageCode: lang,
    });
    return JSON.parse(summaryFromConversation) as string[];
  };

  const updateUserInfo = async (conversation: ChatMessage[], lang: SupportedLanguage) => {
    if (!dbDocRef) {
      throw new Error("dbDocRef is not defined | useAiUserInfo.updateUserInfo");
    }
    const systemMessage = `Given conversation with user and language teacher.
Your goal is to extract information about user from this conversation.
Return info in JSON format. Important information like name or location should be first less important like interests, plans or preferences should be last.
Do not wrap answer with any wrappers like "answer": "...". Your response will be sent to JSON.parse() function.
Example of return value: ["User's name is Alex", "Learning English", "Interested in programming", "From USA", "25 years old", "A student"]
If not relevant information found, return empty array.`;

    const aiUserMessage = JSON.stringify(
      conversation.map((message) => {
        return {
          author: message.isBot ? "Teacher" : "User",
          text: message.text,
        };
      })
    );

    const summaryFromConversation = await textAi.generate({
      userMessage: aiUserMessage,
      systemMessage,
      model: "gpt-4o",
      languageCode: lang,
    });
    const parsedSummary = JSON.parse(summaryFromConversation) as string[];
    console.log("parsedSummary", { aiUserMessage, parsedSummary });

    const oldRecords = userInfo?.records;
    const newRecords: AiUserInfoRecord[] = parsedSummary;

    const updatedRecords = oldRecords
      ? await cleanUpSummary([...newRecords, ...oldRecords], lang)
      : newRecords;

    console.log("updatedRecords", updatedRecords);

    setDoc(
      dbDocRef,
      {
        records: updatedRecords,
        createdAt: userInfo?.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return {
      records: updatedRecords,
    };
  };

  const addFirstConversationMessage = async (message: string) => {
    if (!dbDocRef) {
      throw new Error("dbDocRef is not defined | useAiUserInfo.addFirstConversationMessage");
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
      { merge: true }
    );
  };

  const getLastFirstMessage = async (count: number) => {
    if (!dbDocRef) {
      throw new Error("dbDocRef is not defined | useAiUserInfo.getLastFirstMessage");
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

  const generateFirstMessageText = async (topic: string, languageCode: SupportedLanguage) => {
    const infoNotes = userInfo?.records || [];

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
${infoNotes.map((note) => `- ${note}`).join("\n")}
`,
        model: "gpt-4o",
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
Write ONE extremely short (≤10 words), playful message starting with "Hey", "Hi", or a funny greeting phrase. Use a DIFFERENT, SINGLE interest. Language: ${settings.fullLanguageName || "English"}.
    `;

    const userMessage = `
### Recent topics (Already discussed. Strictly avoid them):
${firstMessages.length === 0 ? "None" : firstMessages.map((msg, i) => `${i + 1}. ${msg}`).join("\n")}
`;

    const response = await textAi.generate({
      systemMessage,
      userMessage,
      model: "gpt-4o",
      cache: false,
      languageCode,
    });

    const responseString = response || "";

    await addFirstConversationMessage(responseString);

    return {
      firstMessage: responseString,
      potentialTopics: potentialTopicsToDiscuss,
    };
  };

  return {
    userInfo: userInfo || null,
    generateFirstMessageText,
    updateUserInfo,
  };
}

export function AiUserInfoProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideAiUserInfo();
  return <AiUserInfoContext.Provider value={hook}>{children}</AiUserInfoContext.Provider>;
}

export const useAiUserInfo = (): AiUserInfoContextType => {
  const context = useContext(AiUserInfoContext);
  if (!context) {
    throw new Error("useAiUserInfo must be used within a AiUserInfoProvider");
  }
  return context;
};
