"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { NoBalanceBlock } from "../Usage/NoBalanceBlock";
import { Dashboard } from "../Dashboard/Dashboard";
import { SupportedLanguage } from "@/common/lang";
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
import { useHotjar } from "../Analytics/useHotjar";

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

  return (
    <Stack>
      {aiConversation.isStarted ? (
        <ConversationCanvas2
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
        />
      ) : (
        <Dashboard rolePlayInfo={rolePlayInfo} />
      )}
    </Stack>
  );
}
