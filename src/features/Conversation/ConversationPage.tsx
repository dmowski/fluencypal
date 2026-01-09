"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { Dashboard } from "../Dashboard/Dashboard";
import { getPageLangCode, SupportedLanguage } from "@/features/Lang/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { ConversationCanvas } from "./ConversationCanvas";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import { useLingui } from "@lingui/react";
import { InfoBlockedSection } from "../Dashboard/InfoBlockedSection";
import { useEffect } from "react";
import { SelectLanguage } from "../Dashboard/SelectLanguage";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { WordsToLearn } from "../Dashboard/WordsToLearn";
import { RulesToLearn } from "../Dashboard/RulesToLearn";
import { ConversationError } from "./ConversationError";
import { useRouter } from "next/navigation";
import { usePlan } from "../Plan/usePlan";
import { ConfirmConversationModal } from "./ConfirmConversationModal";
import { getUrlStart } from "../Lang/getUrlStart";
import { GamePage } from "../Game/GamePage";
import { useGoalCreation } from "../Plan/useGoalCreation";
import { useConversationsAnalysis } from "./useConversationsAnalysis";
import { useGame } from "../Game/useGame";
import { useAppNavigation } from "../Navigation/useAppNavigation";
import { RolePlayProvider } from "../RolePlay/useRolePlay";
import { useAccess } from "../Usage/useAccess";
import { ChatProvider } from "../Chat/useChat";

interface ConversationPageProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPage({ rolePlayInfo, lang }: ConversationPageProps) {
  const auth = useAuth();
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const usage = useUsage();
  const recorder = useAudioRecorder({});
  const { i18n } = useLingui();
  const words = useWords();
  const rules = useRules();
  const plan = usePlan();
  const access = useAccess();

  const appNavigation = useAppNavigation();
  const { isProcessingGoal } = useGoalCreation();

  const { analyzeConversation, conversationAnalysis, generateNextUserMessage } =
    useConversationsAnalysis();
  const router = useRouter();

  useEffect(() => {
    if (!aiConversation.isStarted) {
      recorder.removeTranscript();
    }
  }, [aiConversation.isStarted]);

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) {
      return;
    }

    if (!settings.userSettings?.pageLanguageCode) {
      return;
    }
    const settingsPageLang = settings.userSettings.pageLanguageCode;
    const actualPageLang = getPageLangCode();
    const isDifferent = actualPageLang !== settingsPageLang;
    if (!isDifferent) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);

    const url = `${getUrlStart(settingsPageLang)}practice${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    console.warn(
      `REDIRECT: Page language (${actualPageLang}) is different from settings (${settingsPageLang}). Redirecting to ${url}`
    );
    router.push(url, {
      scroll: false,
    });
  }, [settings.userSettings]);
  const game = useGame();

  useEffect(() => {
    if (aiConversation.isClosing) {
      recorder.cancelRecording();
    }
  }, [aiConversation.isClosing]);

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

  if (appNavigation.currentPage === "community") {
    return <GamePage lang={lang} />;
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

  if (!aiConversation.isStarted) {
    return (
      <RolePlayProvider rolePlayInfo={rolePlayInfo}>
        <Dashboard lang={lang} />
      </RolePlayProvider>
    );
  }

  const defaultMessagesToComplete = 5;
  const planMessageCount = Math.min(
    plan.activeGoal?.goalQuiz?.minPerDaySelected || defaultMessagesToComplete,
    defaultMessagesToComplete
  );

  return (
    <Stack>
      <ConversationCanvas
        messagesToComplete={planMessageCount}
        conversation={aiConversation.conversation}
        isAiSpeaking={aiConversation.isAiSpeaking}
        gameWords={aiConversation.gameWords}
        isClosed={aiConversation.isClosed}
        isClosing={aiConversation.isClosing}
        addUserMessage={async (message) => {
          recorder.removeTranscript();
          await aiConversation.addUserMessage(message);
        }}
        balanceHours={usage.balanceHours}
        togglePaymentModal={usage.togglePaymentModal}
        transcriptMessage={recorder.transcription || ""}
        setIsVolumeOn={aiConversation.toggleVolume}
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
        closeConversation={async () => {
          await aiConversation.closeConversation();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
        isShowMessageProgress={!!aiConversation.goalInfo?.goalElement}
        conversationAnalysisResult={conversationAnalysis}
        generateHelpMessage={generateNextUserMessage}
        conversationMode={aiConversation.conversationMode}
        toggleConversationMode={aiConversation.toggleConversationMode}
        isMuted={aiConversation.isMuted}
        setIsMuted={(isMuted) => aiConversation.toggleMute(isMuted)}
        isVolumeOn={aiConversation.isVolumeOn}
        voice={aiConversation.voice}
        messageOrder={aiConversation.messageOrder}
        onWebCamDescription={aiConversation.setWebCamDescription}
        isLimited={!access.isFullAppAccess}
        onLimitedClick={() => usage.togglePaymentModal(true)}
      />
    </Stack>
  );
}
