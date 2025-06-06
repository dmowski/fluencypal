"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack, Typography } from "@mui/material";
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
import { useEffect, useState } from "react";
import { SelectLanguage } from "../Dashboard/SelectLanguage";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { WordsToLearn } from "../Dashboard/WordsToLearn";
import { RulesToLearn } from "../Dashboard/RulesToLearn";
import { ConversationError } from "./ConversationError";
import { GoalPreparingModal } from "../Goal/GoalPreparingModal";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlan } from "../Plan/usePlan";
import { ConfirmConversationModal } from "./ConfirmConversationModal";
import { getUrlStart } from "../Lang/getUrlStart";
import { GamePage } from "../Game/GamePage";
import { useGame } from "../Game/useGame";
import { useGoalCreation } from "../Plan/useGoalCreation";
import { useConversationsAnalysis } from "./useConversationsAnalysis";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { PlanDashboardCards } from "../Dashboard/PlanDashboardCards";

interface ConversationPageProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPage({ rolePlayInfo, lang }: ConversationPageProps) {
  const auth = useAuth();
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const usage = useUsage();
  const recorder = useAudioRecorder();
  const corrections = useCorrections();
  const { i18n } = useLingui();
  const words = useWords();
  const rules = useRules();
  const history = useChatHistory();
  const conversationsCount = history.conversations.length;
  const game = useGame();
  const plan = usePlan();
  const isReadyToFirstStart =
    !history.loading &&
    conversationsCount === 0 &&
    !aiConversation.isStarted &&
    !aiConversation.isInitializing &&
    !!plan.latestGoal;

  console.log("aiConversation.isStarted", aiConversation.isStarted);
  console.log("isInitializing", aiConversation.isInitializing);

  const searchParams = useSearchParams();

  const gamePage = searchParams.get("gamePage");
  const { isProcessingGoal } = useGoalCreation();
  const [isShowGoalModal, setIsShowGoalModal] = useState(false);

  const { analyzeConversation, conversationAnalysis } = useConversationsAnalysis();
  const router = useRouter();

  useEffect(() => {
    if (!aiConversation.isStarted) {
      recorder.removeTranscript();
    }
  }, [aiConversation.isStarted]);

  if (auth.loading) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (!auth.isAuthorized) return <SignInForm rolePlayInfo={rolePlayInfo} lang={lang} />;

  const isLoading =
    settings.loading || auth.loading || !auth.uid || !usage.isWelcomeBalanceInitialized;

  if (isLoading) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (isProcessingGoal) {
    return <InfoBlockedSection title={isProcessingGoal || i18n._(`Loading Goal...`)} />;
  }

  if (gamePage) {
    return <GamePage />;
  }

  if (!usage.loading && usage.balanceHours <= 0.01 && !game.isGameWinner) {
    if (game.loadingProfile) {
      return <InfoBlockedSection title={i18n._(`Loading...`)} />;
    }
    return <NoBalanceBlock lang={lang} />;
  }

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

  if (aiConversation.confirmStartConversationModal) {
    return (
      <ConfirmConversationModal
        onCancel={() => aiConversation.setIsConfirmed(false)}
        onConfirm={() => {
          aiConversation.setIsConfirmed(true);
          if (aiConversation.confirmStartConversationModal) {
            aiConversation.startConversation(aiConversation.confirmStartConversationModal);
          }
        }}
      />
    );
  }

  if (isReadyToFirstStart) {
    return <PlanDashboardCards lang={lang} />;
  }

  if (!aiConversation.isStarted) {
    return <Dashboard rolePlayInfo={rolePlayInfo} lang={lang} />;
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
