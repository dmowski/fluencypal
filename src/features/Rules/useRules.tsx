"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { getWordsFromText } from "@/libs/getWordsFromText";
import { useSettings } from "../Settings/useSettings";
import { sendAiRequest } from "../Ai/sendAiRequest";
import { sleep } from "openai/core.mjs";
import { useChatHistory } from "../ConversationHistory/useChatHistory";

interface RulesContextType {
  getRules: () => Promise<void>;
  rule: string;
  isGeneratingRule: boolean;
  removeRule: () => void;
}

const RulesContext = createContext<RulesContextType | null>(null);

function useProvideRules(): RulesContextType {
  const auth = useAuth();
  const settings = useSettings();
  const [isGeneratingRule, setIsGeneratingRule] = useState(false);
  const [rule, setRule] = useState("");
  const chatHistory = useChatHistory();

  const getUserMessages = async () => {
    const data = await chatHistory.getLastConversations(2);
    const userMessages = data
      .map((conversation) => conversation.messages.filter((m) => !m.isBot).map((m) => m.text))
      .flat()
      .join("\n");
    return userMessages;
  };

  const getRules = async () => {
    setIsGeneratingRule(true);
    try {
      const userMessage = await getUserMessages();
      setRule(userMessage);
    } catch (error) {
      setIsGeneratingRule(false);
      throw error;
    }
    setIsGeneratingRule(false);
  };

  return {
    isGeneratingRule,
    getRules,
    rule,
    removeRule: () => setRule(""),
  };
}

export function RulesProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideRules();
  return <RulesContext.Provider value={hook}>{children}</RulesContext.Provider>;
}

export const useRules = (): RulesContextType => {
  const context = useContext(RulesContext);
  if (!context) {
    throw new Error("useWords must be used within a UsageProvider");
  }
  return context;
};
