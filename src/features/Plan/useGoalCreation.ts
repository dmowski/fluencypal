import { deleteGoalQuiz, getGoalQuiz } from "@/app/api/goal/goalRequests";
import { useLingui } from "@lingui/react";
import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "../Auth/useAuth";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { useSettings } from "../Settings/useSettings";
import { ChatMessage } from "@/common/conversation";
import { sleep } from "@/libs/sleep";
import { usePlan } from "./usePlan";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useSearchParams } from "next/navigation";
import { useUsage } from "../Usage/useUsage";
import { getPageLangCode } from "../Lang/lang";

export const useGoalCreation = () => {
  const [isProcessingGoal, setIsProcessingGoal] = useState("");
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const plan = usePlan();
  const userInfo = useAiUserInfo();
  const notifications = useNotifications();
  const usage = useUsage();

  const searchParams = useSearchParams();

  const goalId = searchParams.get("goalId");
  const removeGoalIdFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("goalId");
    window.history.replaceState({}, "", `${window.location.pathname}?${searchParams}`);
  };
  const isProcessingGoalRef = useRef(false);

  const processNewGoalFromUrl = async (goalId: string) => {
    if (isProcessingGoalRef.current) {
      return;
    }

    setIsProcessingGoal(i18n._(`Processing the goal...`) + "10%");
    isProcessingGoalRef.current = true;

    const goalData = await getGoalQuiz(goalId);

    if (!goalData || goalData.isCreated) {
      setIsProcessingGoal("");
      isProcessingGoalRef.current = false;

      if (!goalData) {
        Sentry.captureException(new Error("Goal already created or not found"), {
          extra: {
            goalId,
            userId: auth.uid,
            userInfo: userInfo.userInfo,
            goalData,
          },
        });
        console.error("Goal already created or not found", goalId);
      }
      return;
    }

    try {
      const code = await settings.setLanguage(goalData.languageToLearn);
      settings.setPageLanguage(getPageLangCode());
      if (goalData.nativeLanguageCode) {
        settings.setNativeLanguage(goalData.nativeLanguageCode);
      }

      setIsProcessingGoal(i18n._(`Processing the goal...`) + "12%");
      console.log("code", code);

      const conversation: ChatMessage[] = [
        {
          isBot: true,
          text: `Tell me about your goal to learn ${goalData.languageToLearn}.`,
          id: "1",
        },
        {
          isBot: false,
          id: "2",
          text: `I want to learn ${goalData.languageToLearn}. 
    My language level is ${goalData.level}.
    About me: ${goalData.description}.`,
        },
      ];

      await new Promise((resolve) =>
        setTimeout(async () => {
          const updatedInfoRecords = await userInfo.updateUserInfo(conversation);
          console.log("updatedInfoRecords", updatedInfoRecords);
          setIsProcessingGoal(i18n._(`Processing the goal...`) + "32%");

          sleep(3000).then(() => {
            setIsProcessingGoal(i18n._(`Processing the goal...`) + "50%");
          });

          sleep(4500).then(() => {
            setIsProcessingGoal(i18n._(`Processing the goal...`) + "60%");
          });

          const planData = await plan.generateGoal({
            conversationMessages: conversation,
            userInfo: updatedInfoRecords.records,
            languageCode: code,
            goalQuiz: goalData,
          });
          setIsProcessingGoal(i18n._(`Processing the goal...`) + "72%");

          console.log("USER PLAN", planData);

          await plan.addGoalPlan(planData);

          setIsProcessingGoal(i18n._(`Processing the goal...`) + "82%");

          removeGoalIdFromUrl();
          await deleteGoalQuiz(goalId);
          setIsProcessingGoal(i18n._(`Processing the goal...`) + "99%");

          resolve(true);
        }, 100)
      );
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          goalId,
          userId: auth.uid,
          userInfo: userInfo.userInfo,
        },
      });

      notifications.show(i18n._(`Error Processing the goal`) + "=" + error, {
        severity: "error",
      });

      console.error("Error Processing the goal", error);
    }

    setIsProcessingGoal("");
    isProcessingGoalRef.current = false;
  };

  useEffect(() => {
    if (
      !auth.isAuthorized ||
      !goalId ||
      settings.loading ||
      !settings.userCreatedAt ||
      !auth.uid ||
      usage.loading ||
      !usage.isWelcomeBalanceInitialized
    ) {
      return;
    }

    processNewGoalFromUrl(goalId);
  }, [
    goalId,
    auth.isAuthorized,
    settings.loading,
    auth.uid,
    settings.userCreatedAt,
    usage.loading,
    usage.isWelcomeBalanceInitialized,
  ]);

  return {
    isProcessingGoal,
    processNewGoalFromUrl,
    removeGoalIdFromUrl,
    isProcessingGoalRef,
    setIsProcessingGoal,
  };
};
