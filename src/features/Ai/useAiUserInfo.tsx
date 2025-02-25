"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { ChatMessage } from "@/common/conversation";
import { AiUserInfo, AiUserInfoRecord } from "@/common/userInfo";
import { useAuth } from "../Auth/useAuth";
import { db } from "../Firebase/db";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useTextAi } from "./useTextAi";
import { setDoc } from "firebase/firestore";

interface AiUserInfoContextType {
  updateUserInfo: (conversation: ChatMessage[]) => Promise<void>;
  userInfo: AiUserInfo | null;
  generateConversationOpener: () => Promise<string>;
}

const AiUserInfoContext = createContext<AiUserInfoContextType | null>(null);

function useProvideAiUserInfo(): AiUserInfoContextType {
  const auth = useAuth();
  const textAi = useTextAi();
  const dbDocRef = db.documents.aiUserInfo(auth.uid);
  const [userInfo] = useDocumentData<AiUserInfo>(dbDocRef);

  const cleanUpSummary = async (summary: string[]) => {
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
    });
    return JSON.parse(summaryFromConversation) as string[];
  };

  const updateUserInfo = async (conversation: ChatMessage[]) => {
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
    });
    const parsedSummary = JSON.parse(summaryFromConversation) as string[];
    console.log("parsedSummary", { aiUserMessage, parsedSummary });

    const oldRecords = userInfo?.records;
    const newRecords: AiUserInfoRecord[] = parsedSummary;

    const updatedRecords = oldRecords
      ? await cleanUpSummary([...newRecords, ...oldRecords])
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
  };

  const generateConversationOpener = async () => {
    if (!dbDocRef) {
      return "";
    }
    const recordsSorted = userInfo?.records || [];
    const maxCount = 40;
    const recordsToAnalyze = recordsSorted.slice(0, maxCount);

    return recordsToAnalyze.join(". ");
  };

  return {
    userInfo: userInfo || null,
    updateUserInfo,
    generateConversationOpener,
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
