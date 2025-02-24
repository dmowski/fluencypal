"use client";
import { createContext, useContext, ReactNode, JSX, useState } from "react";
import { useSettings } from "../Settings/useSettings";
import { sendAiRequest } from "../Ai/sendAiRequest";
import { calculateTextUsagePrice, TextAiModel } from "@/common/ai";
import { useUsage } from "../Usage/useUsage";
import { TextUsageLog } from "@/common/usage";

export interface TextAiRequest {
  userMessage: string;
  systemMessage: string;
  model: TextAiModel;
}

interface TextAiContextType {
  generate: (conversationDate: TextAiRequest) => Promise<string>;
}

const TextAiContext = createContext<TextAiContextType | null>(null);

function useProvideTextAi(): TextAiContextType {
  const settings = useSettings();
  const usage = useUsage();

  const generate = async (conversationDate: TextAiRequest) => {
    const language = settings.language;
    if (!language) {
      throw new Error("Language is not set | useProvideTextAi.generate");
    }

    const response = await sendAiRequest({ ...conversationDate, language });

    const textUsageLog: TextUsageLog = {
      usageId: `${Date.now()}`,
      language,
      createdAt: Date.now(),
      price: calculateTextUsagePrice(response.usageEvent, conversationDate.model),
      type: "text",
      model: conversationDate.model,
      usageEvent: response.usageEvent,
    };

    usage.setUsageLogs((logs) => [...logs, textUsageLog]);
    return response.aiResponse;
  };

  return {
    generate,
  };
}

export function TextAiProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideTextAi();
  return <TextAiContext.Provider value={hook}>{children}</TextAiContext.Provider>;
}

export const useTextAi = (): TextAiContextType => {
  const context = useContext(TextAiContext);
  if (!context) {
    throw new Error("useTextAi must be used within a UsageProvider");
  }
  return context;
};
