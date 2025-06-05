import { useState } from "react";
import { useAiConversation } from "./useAiConversation";
import { usePlan } from "../Plan/usePlan";
import { useSettings } from "../Settings/useSettings";
import { useTextAi } from "../Ai/useTextAi";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "../Auth/useAuth";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useLingui } from "@lingui/react";

export const useConversationsAnalysis = () => {
  const plan = usePlan();
  const aiConversation = useAiConversation();
  const textAi = useTextAi();
  const settings = useSettings();
  const userInfo = useAiUserInfo();
  const auth = useAuth();
  const notifications = useNotifications();
  const { i18n } = useLingui();

  const [conversationAnalysis, setConversationAnalysis] = useState<string>("");
  const analyzeConversation = async () => {
    setConversationAnalysis("");
    const messages = aiConversation.conversation;

    const messagesString = messages
      .map((message) => {
        const author = message.isBot ? "AI" : "User";
        return `${author}: ${message.text}`;
      })
      .join("\n");

    const planDescription = plan.latestGoal?.goalQuiz?.description || "";
    const goalElement = aiConversation.goalInfo?.goalElement;
    const goalElementDescription = goalElement
      ? `Lesson: ${goalElement.title} - ${goalElement.description} - ${goalElement.details}`
      : "";

    const expectedStructure = `
    #### Language level:
    Example: Intermediate
    
    #### What was great:
    Example: I liked the way you described your situation related to *** 
    
    #### Areas to improve:
    It's better to use *** instead of ***, because ***
    
    `;

    const systemMessage = `You are a language teacher/analyzer.
    You are analyzing the conversation between the user and AI.
    The user is learning ${settings.fullLanguageName}.
    The user has the following goal: ${planDescription}.
    The user is using the following lesson: ${goalElementDescription}.
    
    Answer to the user in the following format:
    ${expectedStructure}
    `;

    try {
      const aiResults = await textAi.generate({
        systemMessage,
        userMessage: messagesString,
        model: "gpt-4o",
        languageCode: settings.languageCode || "en",
      });
      setConversationAnalysis(aiResults);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          userId: auth.uid,
          userInfo: userInfo.userInfo,
          conversationMessages: messages,
        },
      });

      notifications.show(i18n._(`Error analyzing conversation`) + "=" + error, {
        severity: "error",
      });
      setConversationAnalysis("Error analyzing conversation...");
      throw error;
    }
  };

  return {
    conversationAnalysis,
    analyzeConversation,
  };
};
