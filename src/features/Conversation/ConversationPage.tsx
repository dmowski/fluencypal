"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { NoBalanceBlock } from "../Usage/NoBalanceBlock";
import { Dashboard } from "../Dashboard/Dashboard";
import { SupportedLanguage } from "@/features/Lang/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";

import { ConversationCanvas2 } from "./ConversationCanvas2";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import { useCorrections } from "../Corrections/useCorrections";
import { useLingui } from "@lingui/react";
import { InfoBlockedSection } from "../Dashboard/InfoBlockedSection";
import { useEffect, useRef, useState } from "react";
import { SelectLanguage } from "../Dashboard/SelectLanguage";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { WordsToLearn } from "../Dashboard/WordsToLearn";
import { RulesToLearn } from "../Dashboard/RulesToLearn";
import { ConversationError } from "./ConversationError";
import { useHotjar } from "../Analytics/useHotjar";
import { GoalPreparingModal } from "../Goal/GoalPreparingModal";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteGoalQuiz, getGoalQuiz } from "@/app/api/goal/goalRequests";
import { usePlan } from "../Plan/usePlan";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { ChatMessage } from "@/common/conversation";
import * as Sentry from "@sentry/nextjs";
import { useNotifications } from "@toolpad/core/useNotifications";
import { ConfirmConversationModal } from "./ConfirmConversationModal";
import { getUrlStart } from "../Lang/getUrlStart";
import { useTextAi } from "../Ai/useTextAi";

interface ConversationPageProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPage({ rolePlayInfo, lang }: ConversationPageProps) {
  const auth = useAuth();
  useHotjar();
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const usage = useUsage();
  const recorder = useAudioRecorder();
  const corrections = useCorrections();
  const { i18n } = useLingui();
  const words = useWords();
  const rules = useRules();
  const plan = usePlan();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goalId");
  const userInfo = useAiUserInfo();
  const notifications = useNotifications();
  const textAi = useTextAi();

  const [isShowGoalModal, setIsShowGoalModal] = useState(false);
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
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
  const router = useRouter();
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

    setIsProcessingGoal(true);
    isProcessingGoalRef.current = true;

    const goalData = await getGoalQuiz(goalId);

    if (!goalData || goalData.isCreated) {
      setIsProcessingGoal(false);
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
          const updatedInfoRecords = await userInfo.updateUserInfo(conversation, code);
          console.log("updatedInfoRecords", updatedInfoRecords);

          const planData = await plan.generateGoal({
            conversationMessages: conversation,
            userInfo: updatedInfoRecords.records,
            languageCode: code,
            goalQuiz: goalData,
          });

          console.log("USER PLAN", planData);

          await plan.addGoalPlan(planData);

          removeGoalIdFromUrl();
          await deleteGoalQuiz(goalId);

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

      notifications.show(i18n._(`Error processing goal`) + "=" + error, {
        severity: "error",
      });

      console.error("Error processing goal", error);
    }

    setIsProcessingGoal(false);
    isProcessingGoalRef.current = false;
  };

  useEffect(() => {
    if (
      !auth.isAuthorized ||
      !goalId ||
      settings.loading ||
      !settings.userCreatedAt ||
      !auth.uid ||
      usage.loading
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
  ]);

  useEffect(() => {
    if (!aiConversation.isStarted) {
      recorder.removeTranscript();
    }
  }, [aiConversation.isStarted]);

  if (auth.loading) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (!auth.isAuthorized) return <SignInForm rolePlayInfo={rolePlayInfo} lang={lang} />;

  const isLoading = settings.loading || auth.loading || !auth.uid;

  if (isLoading) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (isProcessingGoal) {
    return <InfoBlockedSection title={i18n._(`Loading Goal...`)} />;
  }

  if (!usage.loading && usage.balanceHours <= 0.01) return <NoBalanceBlock />;

  if (aiConversation.errorInitiating) {
    return (
      <ConversationError
        errorMessage={aiConversation.errorInitiating || ""}
        onRetry={() => window.location.reload()}
      />
    );
  }
  if (aiConversation.isInitializing) {
    return <InfoBlockedSection title={aiConversation.isInitializing || i18n._(`Loading...`)} />;
  }

  if (!settings.languageCode) {
    return <SelectLanguage pageLang={lang} />;
  }

  if (words.isGeneratingWords) {
    return <InfoBlockedSection title={i18n._(`Crafting new words...`)} />;
  }

  if (rules.isGeneratingRule) {
    return <InfoBlockedSection title={i18n._(`Crafting new rule...`)} />;
  }

  if (words.wordsToLearn.length > 0) {
    return <WordsToLearn />;
  }

  if (rules.rule) {
    return <RulesToLearn />;
  }

  if (isShowGoalModal) {
    return (
      <GoalPreparingModal
        onClose={() => setIsShowGoalModal(false)}
        onStart={() => aiConversation.startConversation({ mode: "goal" })}
      />
    );
  }

  if (!aiConversation.isStarted) {
    return (
      <>
        {aiConversation.confirmStartConversationModal && (
          <ConfirmConversationModal
            onCancel={() => aiConversation.setIsConfirmed(false)}
            onConfirm={() => {
              aiConversation.setIsConfirmed(true);
              if (aiConversation.confirmStartConversationModal) {
                aiConversation.startConversation(aiConversation.confirmStartConversationModal);
              }
            }}
          />
        )}
        <Dashboard rolePlayInfo={rolePlayInfo} lang={lang} />
      </>
    );
  }

  return (
    <Stack>
      <ConversationCanvas2
        conversation={aiConversation.conversation}
        isOnboarding={aiConversation.currentMode === "goal"}
        isAiSpeaking={aiConversation.isAiSpeaking}
        gameWords={aiConversation.gameWords}
        isClosed={aiConversation.isClosed}
        isClosing={aiConversation.isClosing}
        addUserMessage={async (message) => {
          recorder.removeTranscript();
          await aiConversation.addUserMessage(message);
        }}
        balanceHours={usage.balanceHours}
        conversationId={aiConversation.conversationId}
        togglePaymentModal={usage.togglePaymentModal}
        analyzeUserMessage={corrections.analyzeUserMessage}
        transcriptMessage={recorder.transcription || ""}
        toggleVolume={aiConversation.toggleVolume}
        startRecording={async () => {
          aiConversation.toggleVolume(false);
          await recorder.startRecording();
        }}
        stopRecording={async () => {
          aiConversation.toggleVolume(true);
          await recorder.stopRecording();
        }}
        cancelRecording={async () => {
          aiConversation.toggleVolume(true);
          recorder.cancelRecording();
        }}
        isTranscribing={recorder.isTranscribing}
        isRecording={recorder.isRecording}
        recordingMilliSeconds={recorder.recordingMilliSeconds}
        recordVisualizerComponent={recorder.visualizerComponent}
        recordingError={recorder.error}
        isProcessingGoal={aiConversation.isProcessingGoal}
        temporaryGoal={aiConversation.temporaryGoal}
        confirmGoal={aiConversation.confirmGoal}
        goalSettingProgress={aiConversation.goalSettingProgress}
        isSavingGoal={aiConversation.isSavingGoal}
        analyzeConversation={analyzeConversation}
        closeConversation={() => {
          const url = `${getUrlStart(lang)}practice`;
          router.push(url);
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
        isShowMessageProgress={!!aiConversation.goalInfo?.goalElement}
        conversationAnalysisResult={conversationAnalysis}
      />
    </Stack>
  );
}
