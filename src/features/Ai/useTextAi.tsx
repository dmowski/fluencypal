"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useSettings } from "../Settings/useSettings";
import { sendTextAiRequest } from "./sendTextAiRequest";
import { TextAiModel } from "@/common/ai";
import { useUsage } from "../Usage/useUsage";
import { getDataFromCache, setDataToCache } from "@/libs/localStorageCache";
import { useAuth } from "../Auth/useAuth";

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
  const auth = useAuth();

  const generate = async (conversationDate: TextAiRequest) => {
    const balance = usage.balanceHours;
    if (balance < 0.01) {
      throw "Insufficient balance. Please top up your account.";
    }

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

    const response = await sendTextAiRequest(
      { ...conversationDate, languageCode },
      await auth.getToken()
    );

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
