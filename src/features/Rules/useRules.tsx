"use client";
import { createContext, useContext, ReactNode, JSX, useState } from "react";
import { useSettings } from "../Settings/useSettings";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { useTextAi } from "../Ai/useTextAi";

interface RulesContextType {
  getRules: () => Promise<void>;
  rule: string;
  isGeneratingRule: boolean;
  removeRule: () => void;
}

const RulesContext = createContext<RulesContextType | null>(null);

function useProvideRules(): RulesContextType {
  const settings = useSettings();
  const [isGeneratingRule, setIsGeneratingRule] = useState(false);
  const [rule, setRule] = useState("");
  const chatHistory = useChatHistory();
  const textAi = useTextAi();

  const getUserMessages = async () => {
    const data = await chatHistory.getLastConversations(2);
    const userMessages = data
      .map((conversation) => conversation.messages.filter((m) => !m.isBot).map((m) => m.text))
      .flat()
      .join("\n");
    if (userMessages.length > 1000) {
      return userMessages.slice(0, 1000);
    }
    return userMessages;
  };

  const getRules = async () => {
    const language = settings?.language;
    if (!language) {
      throw new Error("❌ language is not defined | getRules");
    }

    setIsGeneratingRule(true);
    try {
      const userMessage = await getUserMessages();

      const systemInstruction = [
        `User provides list of his messages that he used during voice conversation.`,
        `System should generate a most important grammar rule user must to learn.`,
        `Rules should be useful and not too difficult.`,
        `Return grammar rule in Markdown format. Starting from similar to: Based on recent conversation`,
      ].join(" ");
      const newRuleToLearn = await textAi.generate({
        systemMessage: systemInstruction,
        userMessage: `userMessage: ${userMessage}`,
        model: "gpt-4o",
      });
      setRule(newRuleToLearn);
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
    throw new Error("useRules must be used within a RulesProvider");
  }
  return context;
};
