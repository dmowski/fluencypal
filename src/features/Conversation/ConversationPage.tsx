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
import { ConversationError } from "./ConversationError";
import { useRouter } from "next/navigation";
import { getUrlStart } from "../Lang/getUrlStart";
import { GamePage } from "../Game/GamePage";
import { useConversationsAnalysis } from "./useConversationsAnalysis";
import { useAppNavigation } from "../Navigation/useAppNavigation";
import { RolePlayProvider } from "../RolePlay/useRolePlay";
import { useAccess } from "../Usage/useAccess";
import { useLessonPlan } from "../LessonPlan/useLessonPlan";
import { usePlan } from "../Plan/usePlan";

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
  const { i18n } = useLingui();
  const access = useAccess();
  const plan = usePlan();

  const appNavigation = useAppNavigation();

  const conversationAnalysis = useConversationsAnalysis();

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

  useEffect(() => {
    if (aiConversation.isClosing) {
      recorder.cancelRecording();
    }
  }, [aiConversation.isClosing]);

  const lessonPlan = useLessonPlan();

  useEffect(() => {
    if (recorder.transcription) {
      lessonPlan.generateAnalysis(recorder.transcription);
    }
  }, [recorder.transcription]);

  if (auth.loading) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (!auth.isAuthorized) return <SignInForm rolePlayInfo={rolePlayInfo} lang={lang} />;

  const isLoading =
    settings.loading || auth.loading || !auth.uid || !usage.isWelcomeBalanceInitialized;

  if (isLoading) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
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

  if (!aiConversation.isStarted) {
    return (
      <RolePlayProvider rolePlayInfo={rolePlayInfo}>
        <Dashboard lang={lang} />
      </RolePlayProvider>
    );
  }

  return (
    <Stack>
      <ConversationCanvas
        pointsEarned={conversationAnalysis.gamePointsEarned}
        analyzeConversation={conversationAnalysis.analyzeConversation}
        conversationAnalysisResult={conversationAnalysis.conversationAnalysis}
        generateHelpMessage={conversationAnalysis.generateNextUserMessage}
        lessonPlanAnalysis={aiConversation.lessonPlanAnalysis}
        openCommunityPage={() => appNavigation.setCurrentPage("community")}
        conversation={aiConversation.conversation}
        isAiSpeaking={aiConversation.isAiSpeaking}
        gameWords={aiConversation.gameWords}
        isClosed={aiConversation.isClosed}
        isClosing={aiConversation.isClosing}
        addUserMessage={async (message) => {
          recorder.removeTranscript();
          await aiConversation.addUserMessage(message);
        }}
        openNextLesson={() => plan.openNextLesson()}
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
        closeConversation={async () => {
          lessonPlan.setActiveLessonPlan(null);
          await aiConversation.closeConversation();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
        isShowMessageProgress={!!aiConversation.goalInfo?.goalElement}
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
