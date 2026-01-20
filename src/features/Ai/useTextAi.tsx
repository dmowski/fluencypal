"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import * as Sentry from "@sentry/nextjs";
import { sendTextAiRequest } from "./sendTextAiRequest";
import { TextAiModel } from "@/common/ai";
import { getDataFromCache, setDataToCache } from "@/libs/localStorageCache";
import { useAuth } from "../Auth/useAuth";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useSettings } from "../Settings/useSettings";
import { sleep } from "@/libs/sleep";

const cacheKey = `DL_text-ai-cache`;

export interface TextAiRequest {
  userMessage: string;
  systemMessage: string;
  model: TextAiModel;
  cache?: boolean;
  languageCode?: SupportedLanguage;
}

export interface JsonAiRequest extends TextAiRequest {
  attempts?: number;
}

interface TextAiContextType {
  generate: (conversationDate: TextAiRequest) => Promise<string>;
  generateJson: <T>(conversationDate: JsonAiRequest) => Promise<T>;
}

const TextAiContext = createContext<TextAiContextType | null>(null);

function useProvideTextAi(): TextAiContextType {
  const auth = useAuth();
  const settings = useSettings();
  const languageCode = settings.languageCode || "en";

  const generate = async (conversationDate: TextAiRequest) => {
    const valueForCache =
      conversationDate.userMessage + conversationDate.systemMessage;

    if (conversationDate.cache) {
      const responseFromCache = await getDataFromCache({
        inputValue: valueForCache,
        storageSpace: cacheKey,
      });
      if (responseFromCache) {
        return responseFromCache;
      }
    }

    const response = await sendTextAiRequest(
      {
        ...conversationDate,
        languageCode: conversationDate.languageCode || languageCode,
      },
      await auth.getToken(),
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

  const parseJson = async <T,>(json: string): Promise<T> => {
    try {
      let trimmedJson = json.trim();
      const isAbleToFixWithoutAi =
        trimmedJson.startsWith("```json") && trimmedJson.endsWith("```");
      if (isAbleToFixWithoutAi) {
        trimmedJson = trimmedJson.slice(7, -3).trim();
      }

      return JSON.parse(trimmedJson);
    } catch (error) {
      console.error("Error parsing JSON. error", error);
      console.error("Error parsing JSON. json", json);

      Sentry.captureException(error, {
        extra: {
          title: "Error init parsing in useFixJson",
        },
      });
      const fixedJson = await fixJson(json, error + "");
      return fixedJson;
    }
  };

  const fixJson = async (badJson: string, error: string) => {
    const systemMessage = [
      "Given JSON with some json mistakes.",
      "Please fix json and return the fixed JSON.",
      "Error: " + error,
      "Return only the correct JSON, nothing else. No wrappers, no explanations, your response will be passed into javascript JSON.parse() function",
    ].join("\n");

    const fixJsonRes = await generate({
      systemMessage,
      userMessage: badJson,
      model: "gpt-4o",
      languageCode,
    });
    try {
      let trimmedJson = fixJsonRes.trim();
      const isAbleToFixWithoutAi =
        trimmedJson.startsWith("```json") && trimmedJson.endsWith("```");
      if (isAbleToFixWithoutAi) {
        trimmedJson = trimmedJson.slice(7, -3).trim();
      }

      return JSON.parse(trimmedJson);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          title: "Error parsing fixed json in useFixJson",
        },
      });
      throw error;
    }
  };

  interface AttemptInfo {
    attempt: number;
    error?: Error;
  }

  const generateJson = async <T,>(
    conversationDate: JsonAiRequest,
    attemptInfo?: AttemptInfo,
  ) => {
    const isAttemptExceeded =
      attemptInfo && attemptInfo.attempt >= (conversationDate.attempts || 3);
    if (isAttemptExceeded) {
      throw (
        attemptInfo.error ||
        new Error("AI JSON generation: Max attempts exceeded")
      );
    }

    try {
      const response = await generate(conversationDate);
      return parseJson<T>(response);
    } catch (error) {
      console.error("Error generating JSON. error", error);
      Sentry.captureException(error, {
        extra: {
          title: "Error generating JSON in useTextAi",
        },
      });
      await sleep(2000);
      console.log(
        "Retrying AI JSON generation, attempt:",
        (attemptInfo?.attempt || 0) + 1,
      );
      return generateJson<T>(
        { ...conversationDate, cache: false },
        {
          attempt: (attemptInfo?.attempt || 0) + 1,
          error: error as Error,
        },
      );
    }
  };

  return {
    generate,
    generateJson,
  };
}

export function TextAiProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const hook = useProvideTextAi();
  return (
    <TextAiContext.Provider value={hook}>{children}</TextAiContext.Provider>
  );
}

export const useTextAi = (): TextAiContextType => {
  const context = useContext(TextAiContext);
  if (!context) {
    throw new Error("useTextAi must be used within a UsageProvider");
  }
  return context;
};
