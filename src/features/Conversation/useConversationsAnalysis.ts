import { useMemo, useState } from "react";
import { useAiConversation } from "./useAiConversation";
import { usePlan } from "../Plan/usePlan";
import { useSettings } from "../Settings/useSettings";
import { useTextAi } from "../Ai/useTextAi";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "../Auth/useAuth";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useLingui } from "@lingui/react";
import { fullLanguageName, getPageLangCode, SupportedLanguage } from "../Lang/lang";
import { increaseGamePointsRequest } from "../Game/gameBackendRequests";

export const useConversationsAnalysis = () => {
  const plan = usePlan();
  const aiConversation = useAiConversation();
  const textAi = useTextAi();
  const settings = useSettings();
  const userInfo = useAiUserInfo();
  const auth = useAuth();
  const notifications = useNotifications();
  const { i18n } = useLingui();

  const learningLanguage = settings.languageCode || "en";

  const pageLangCode = useMemo(() => getPageLangCode(), []);
  const planNativeLanguage = plan.activeGoal?.goalQuiz?.nativeLanguageCode;
  const nativeLanguageCode = pageLangCode !== learningLanguage ? pageLangCode : planNativeLanguage;
  const fullNativeLanguage = nativeLanguageCode
    ? fullLanguageName[nativeLanguageCode as SupportedLanguage] || nativeLanguageCode
    : nativeLanguageCode;

  const [conversationAnalysisMap, setConversationAnalysisMap] = useState<Record<string, string>>(
    {}
  );

  const [gamePointsEarnMap, setGamePointsEarnMap] = useState<Record<string, number>>({});

  const activeConversationId = aiConversation.conversationId || "";
  const conversationAnalysis = conversationAnalysisMap[activeConversationId] || "";
  const gamePointsEarned = gamePointsEarnMap[activeConversationId] || 0;

  const analyzeConversation = async () => {
    if (conversationAnalysis && !conversationAnalysis.startsWith("Error")) {
      return;
    }

    if (!conversationAnalysis) {
      const usersMessages = aiConversation.conversation.filter((msg) => !msg.isBot);
      if (usersMessages.length > 3) {
        const pointsEarned = usersMessages.length;
        setGamePointsEarnMap((prev) => {
          const newMap = { ...prev, [activeConversationId]: pointsEarned };
          return newMap;
        });

        await increaseGamePointsRequest(
          {
            aiConversationId: activeConversationId,
            aiConversationPoints: pointsEarned,
          },
          await auth.getToken()
        );
      }
    }

    const messages = aiConversation.conversation;

    const messagesString = messages
      .map((message) => {
        const author = message.isBot ? "AI" : "User";
        return `${author}: ${message.text}`;
      })
      .join("\n");

    const planDescription = plan.activeGoal?.goalQuiz?.description || "";
    const goalElement = aiConversation.goalInfo?.goalElement;
    const goalElementDescription = goalElement
      ? `Lesson: ${goalElement.title} - ${goalElement.description} - ${goalElement.details}`
      : "";

    const expectedStructure = `#### ${i18n._("What went well")}:
Example: I liked the way you described your situation related to *** 

#### ${i18n._("Areas to improve")}:
It's better to use *** instead of ***, because ***

#### ${i18n._("Language level")}:
Example: Intermediate

`;

    const systemMessage = `You are a language teacher/analyzer.
You are analyzing the conversation between the user and AI.
The user is learning ${settings.fullLanguageName}.
Use the "${fullNativeLanguage}" language for analysis.
The user has the following goal: ${planDescription}.
The user is using the following lesson: ${goalElementDescription}.
    
Answer to the user in the following format:
${expectedStructure}`;
    try {
      const aiResults = await textAi.generate({
        systemMessage,
        userMessage: messagesString,
        model: "gpt-4o",
        languageCode: settings.languageCode || "en",
      });
      setConversationAnalysisMap((prev) => {
        const newMap = { ...prev, [activeConversationId]: aiResults };
        return newMap;
      });
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
      setConversationAnalysisMap((prev) => {
        const newMap = { ...prev, [activeConversationId]: "Error analyzing conversation..." };
        return newMap;
      });
      throw error;
    }
  };

  const generateNextUserMessage = async () => {
    const messages = aiConversation.conversation;
    const messagesString = messages
      .map((message) => {
        const author = message.isBot ? "AI" : "User";
        return `${author}: ${message.text}`;
      })
      .join("\n");

    const systemMessage = `You are a language teacher and helper.
You are analyzing the conversation between the user and AI.
The user is learning ${settings.fullLanguageName}.

Your goal is to generate potential user's answer to last "AI" message. User is struggling with answering it.

Provide only potential answer, without any kind of wrapper/started/intro words. Just return answer. Generate one not long sentence
`;

    try {
      const aiResults = await textAi.generate({
        systemMessage,
        userMessage: messagesString,
        model: "gpt-4o",
        languageCode: settings.languageCode || "en",
      });
      return aiResults;
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

      return "Error. Try one more time";
    }
  };

  return {
    conversationAnalysis,
    analyzeConversation,
    generateNextUserMessage,
    gamePointsEarned,
  };
};
