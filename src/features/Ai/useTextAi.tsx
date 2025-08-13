"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { sendTextAiRequest } from "./sendTextAiRequest";
import { TextAiModel } from "@/common/ai";
import { getDataFromCache, setDataToCache } from "@/libs/localStorageCache";
import { useAuth } from "../Auth/useAuth";
import { SupportedLanguage } from "@/features/Lang/lang";

const cacheKey = `DL_text-ai-cache`;

export interface TextAiRequest {
  userMessage: string;
  systemMessage: string;
  model: TextAiModel;
  cache?: boolean;
  languageCode: SupportedLanguage;
}

interface TextAiContextType {
  generate: (conversationDate: TextAiRequest) => Promise<string>;
}

const TextAiContext = createContext<TextAiContextType | null>(null);

function useProvideTextAi(): TextAiContextType {
  const auth = useAuth();

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

    const languageCode = conversationDate.languageCode;

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
