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
import {
  fullLanguageName,
  getPageLangCode,
  SupportedLanguage,
} from "../Lang/lang";
import { increaseGamePointsRequest } from "../Game/gameBackendRequests";
import { ConversationResult } from "../Plan/types";
import { useLessonPlan } from "../LessonPlan/useLessonPlan";

export const useConversationsAnalysis = () => {
  const plan = usePlan();
  const aiConversation = useAiConversation();
  const textAi = useTextAi();
  const settings = useSettings();
  const userInfo = useAiUserInfo();
  const auth = useAuth();
  const notifications = useNotifications();
  const { i18n } = useLingui();
  const lessonPlan = useLessonPlan();

  const learningLanguage = settings.languageCode || "en";

  const pageLangCode = useMemo(() => getPageLangCode(), []);
  const planNativeLanguage = plan.activeGoal?.goalQuiz?.nativeLanguageCode;
  const nativeLanguageCode =
    pageLangCode !== learningLanguage ? pageLangCode : planNativeLanguage;
  const fullNativeLanguage = nativeLanguageCode
    ? fullLanguageName[nativeLanguageCode as SupportedLanguage] ||
      nativeLanguageCode
    : nativeLanguageCode;

  const [conversationAnalysisMap, setConversationAnalysisMap] = useState<
    Record<string, ConversationResult | null>
  >({});

  const [gamePointsEarnMap, setGamePointsEarnMap] = useState<
    Record<string, number>
  >({});

  const activeConversationId = aiConversation.conversationId || "";
  const conversationAnalysis =
    conversationAnalysisMap[activeConversationId] || null;
  const gamePointsEarned = gamePointsEarnMap[activeConversationId] || 0;

  const analyzeConversation = async () => {
    if (conversationAnalysis) {
      return;
    }

    if (!conversationAnalysis) {
      const usersMessages = aiConversation.conversation.filter(
        (msg) => !msg.isBot,
      );
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
            aiConversationUserId: auth.uid || "",
          },
          await auth.getToken(),
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

    const goalElementId = goalElement?.id;
    const goalElementDescription = goalElementId
      ? `Lesson: ${goalElement.title} - ${goalElement.description} - ${goalElement.details}`
      : "";

    const systemMessage = `You are a language teacher/analyzer.
You are analyzing the conversation between the user and AI.
The user is learning ${settings.fullLanguageName}.

Use the "${fullNativeLanguage}" language for analysis.

The user has the following goal: ${planDescription}.

The user is using the following lesson: ${goalElementDescription}.

${lessonPlan.activeLessonPlan ? `Lesson plan: ${JSON.stringify(lessonPlan.activeLessonPlan)}` : ""}
    
Answer in the following format (Results object in JSON):
{
shortSummaryOfLesson: string;

whatUserDidWell: string;
whatUserCanImprove: string;

whatToFocusOnNextTime: string;
}
Use ${settings.fullLanguageName} language for all answers.
Your output must be in valid JSON format with no additional text or explanation.
Your response will be parsed using JSON.parse().
`;
    try {
      console.log("Lesson review", systemMessage, messagesString);
      const aiResults = await textAi.generateJson<ConversationResult>({
        systemMessage,
        userMessage: messagesString,
        model: "gpt-4o",
        languageCode: settings.languageCode || "en",
      });

      if (goalElementId) {
        plan.finishGoalElement(goalElementId, aiResults);
      }

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
      console.error(error);
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
