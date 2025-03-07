"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useSettings } from "../Settings/useSettings";
import { sendTextAiRequest } from "./sendTextAiRequest";
import { calculateTextUsagePrice, TextAiModel } from "@/common/ai";
import { useUsage } from "../Usage/useUsage";
import { TextUsageLog } from "@/common/usage";
import { getDataFromCache, setDataToCache } from "@/libs/localStorageCache";

const cacheKey = `DL_text-ai-cache`;

export interface TextAiRequest {
  userMessage: string;
  systemMessage: string;
  model: TextAiModel;
  cache?: boolean;
}

interface TextAiContextType {
  generate: (conversationDate: TextAiRequest) => Promise<string>;
}

const TextAiContext = createContext<TextAiContextType | null>(null);

function useProvideTextAi(): TextAiContextType {
  const settings = useSettings();
  const usage = useUsage();

  const generate = async (conversationDate: TextAiRequest) => {
    const valueForCache = conversationDate.userMessage + conversationDate.systemMessage;

    if (conversationDate.cache) {
      const responseFromCache = await getDataFromCache({
        inputValue: valueForCache,
        storageSpace: cacheKey,
      });
      if (responseFromCache) {
        return responseFromCache;
      }
    }

    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error("Language is not set | useProvideTextAi.generate");
    }

    const response = await sendTextAiRequest({ ...conversationDate, languageCode });

    const textUsageLog: TextUsageLog = {
      usageId: `${Date.now()}`,
      languageCode,
      createdAt: Date.now(),
      price: calculateTextUsagePrice(response.usageEvent, conversationDate.model),
      type: "text",
      model: conversationDate.model,
      usageEvent: response.usageEvent,
    };

    usage.setUsageLogs((logs) => [...logs, textUsageLog]);
    const responseString = response.aiResponse || "";

    if (conversationDate.cache && responseString) {
      await setDataToCache({
        inputValue: valueForCache,
        outputValue: responseString,
        storageSpace: cacheKey,
      });
    }

    return responseString;
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
