"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { useTextAi } from "../Ai/useTextAi";
import { GoalElementInfo } from "../Plan/types";
import { useSettings } from "../Settings/useSettings";

interface RulesContextType {
  getRules: (goal?: GoalElementInfo) => Promise<string>;
}

const RulesContext = createContext<RulesContextType | null>(null);

function useProvideRules(): RulesContextType {
  const chatHistory = useChatHistory();
  const textAi = useTextAi();
  const settings = useSettings();
  const appMode = settings.appMode;

  const getUserMessages = async () => {
    const data = await chatHistory.getLastConversations(20);
    const userMessages = data
      .map((conversation) =>
        conversation.messages.filter((m) => !m.isBot).map((m) => m.text),
      )
      .flat()
      .join("\n");
    if (userMessages.length > 1000) {
      return userMessages.slice(0, 1000);
    }
    return userMessages;
  };

  const getRules = async (goal?: GoalElementInfo) => {
    try {
      const userMessage = await getUserMessages();
      const systemInstruction = [
        `User provides list of his messages that he used during voice conversation.`,
        appMode === "interview"
          ? "System should generate a most important rule user must to learn to prepare for job interview."
          : `System should generate a most important grammar rule user must to learn.`,
        `${goal ? `Follow this topic: ${goal.goalElement.title} - ${goal.goalElement.description} (${goal.goalElement.details})` : ""}`,
        `Rules should be useful and not too difficult. Use  only ${settings.fullLanguageName} language for your response.`,
        appMode === "interview"
          ? "Return rule in Markdown format. Starting from something like 'Based on recent conversation...' but use "
          : `Return grammar rule in Markdown format. Starting from something like "Based on recent conversation..." but use `,
      ].join(" ");
      const newRuleToLearn = await textAi.generate({
        systemMessage: systemInstruction,
        userMessage: `User Messages: ${userMessage}`,
        model: "gpt-4o",
        languageCode: settings.languageCode || "en",
      });
      return newRuleToLearn;
    } catch (error) {
      return "";
    }
  };

  return {
    getRules,
  };
}

export function RulesProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
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
