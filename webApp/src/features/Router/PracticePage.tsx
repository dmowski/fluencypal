'use client';

import { useAiConversation } from '@/features/Conversation/useAiConversation/useAiConversation';
import { useAuth } from '../Auth/useAuth';
import { Stack } from '@mui/material';
import { SignInForm } from '../Auth/SignInForm';
import { useUsage } from '../Usage/useUsage';
import { useSettings } from '../Settings/useSettings';
import { Dashboard } from '../Dashboard/Dashboard';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayScenariosInfo } from '../RolePlay/rolePlayData';
import { ConversationCanvas } from '../Conversation/ConversationCanvas';
import { useAudioRecorder } from '../Audio/useAudioRecorder';
import { useLingui } from '@lingui/react';
import { InfoBlockedSection } from '../Dashboard/InfoBlockedSection';
import { useEffect, useState } from 'react';
import { SelectLanguage } from '../Dashboard/SelectLanguage';
import { ConversationError } from '../Conversation/ConversationError';
import { useConversationsAnalysis } from '../Conversation/useConversationsAnalysis';
import { useAppNavigation } from '../Navigation/useAppNavigation';
import { RolePlayProvider } from '../RolePlay/useRolePlay';
import { useAccess } from '../Usage/useAccess';
import { useLessonPlan } from '../LessonPlan/useLessonPlan';
import { usePlan } from '../Plan/usePlan';
import { usePageLangRedirect } from './usePageLangRedirect';
import { CommunityDashboard } from '../Community/CommunityDashboard';
import { BlockedAccess } from './BlockedAccess';
import { useSearchParams } from 'next/navigation';
import { useUrlState } from '@/features/Url/useUrlState';
import { ConversationGuestAuthWall } from '@/features/Conversation/ConversationGuestAuthWall';
import { canEnterPracticeAsGuest } from '@/features/Conversation/guestPracticeEntry';
import { useResumeDayPassCheckout } from '@/features/Usage/useResumeDayPassCheckout';
import {
  hasUserSpokenInConversation,
  JUST_TALK_HANDOFF_PARAM,
} from '@/features/Conversation/justTalkHandoff';

interface PracticePageProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function PracticePage({ rolePlayInfo, lang }: PracticePageProps) {
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
  const lessonPlan = useLessonPlan();
  usePageLangRedirect();
  const searchParams = useSearchParams();
  const rolePlayId = searchParams.get('rolePlayId');
  const [justTalk, setJustTalk] = useUrlState(JUST_TALK_HANDOFF_PARAM, '', false);
  const canGuestPractice = canEnterPracticeAsGuest({ justTalk, rolePlayId });
  const practiceLanguageCode = settings.languageCode || (canGuestPractice ? lang : null);
  const [showGuestAuthWall, setShowGuestAuthWall] = useState(false);
  useResumeDayPassCheckout();

  useEffect(() => {
    if (auth.isIdentified) {
      setShowGuestAuthWall(false);
    }
  }, [auth.isIdentified]);

  useEffect(() => {
    if (auth.loading || auth.isIdentified || !canGuestPractice) {
      return;
    }
    void auth.ensureAnonymousAuth();
  }, [auth.loading, auth.isIdentified, canGuestPractice, auth.ensureAnonymousAuth]);

  useEffect(() => {
    if (!aiConversation.isStarted) recorder.removeTranscript();
  }, [aiConversation.isStarted]);

  useEffect(() => {
    if (aiConversation.isClosing) recorder.cancelRecording();
  }, [aiConversation.isClosing]);

  if (auth.loading) return <InfoBlockedSection title={i18n._(`Loading...`)} />;

  if (showGuestAuthWall && !auth.isIdentified) {
    return <ConversationGuestAuthWall />;
  }

  if (!auth.isIdentified && !canGuestPractice) {
    return <SignInForm rolePlayInfo={rolePlayInfo} lang={lang} />;
  }

  if (!auth.isAuthorized && canGuestPractice) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  const settingsReady = canGuestPractice
    ? Boolean(practiceLanguageCode)
    : !settings.loading && Boolean(auth.uid);

  const usageReady = canGuestPractice || usage.isWelcomeBalanceInitialized;

  if (!settingsReady || !usageReady) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (access.isBlockedByAge) return <BlockedAccess />;

  if (appNavigation.currentPage === 'community') return <CommunityDashboard />;

  if (!practiceLanguageCode) return <SelectLanguage pageLang={lang} />;

  if (aiConversation.isInitializing) {
    return <InfoBlockedSection title={aiConversation.isInitializing} />;
  }

  if (aiConversation.errorInitiating) {
    return (
      <ConversationError
        errorMessage={aiConversation.errorInitiating}
        onRetry={() => window.location.reload()}
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

  if (aiConversation.isRestarting) {
    return <InfoBlockedSection title={i18n._(`Reloading conversation...`)} />;
  }

  return (
    <Stack>
      <ConversationCanvas
        isSendMessagesBlocked={aiConversation.isLimitedRecording}
        isLimitedVoice={aiConversation.isLimitedAiVoice}
        addTranscriptDelta={aiConversation.addUserMessageDelta}
        completeUserMessageDelta={({ removeMessage }: { removeMessage?: boolean }) => {
          aiConversation.completeUserMessageDelta({
            triggerResponse: true,
            removeMessage,
          });
        }}
        transcriptionBlob={recorder.transcriptionBlob}
        recordingVoiceMode={aiConversation.recordingVoiceMode}
        pointsEarned={conversationAnalysis.gamePointsEarned}
        analyzeConversation={conversationAnalysis.analyzeConversation}
        conversationAnalysisResult={conversationAnalysis.conversationAnalysis}
        openCommunityPage={() => appNavigation.setCurrentPage('community')}
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
        transcriptMessage={recorder.transcription || ''}
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
          recorder.removeTranscript();
        }}
        isTranscribing={recorder.isTranscribing}
        isRecording={recorder.isRecording}
        recordingMilliSeconds={recorder.recordingMilliSeconds}
        recordVisualizerComponent={recorder.visualizerComponent}
        recordingError={recorder.error}
        closeConversation={async () => {
          const spoken = hasUserSpokenInConversation(aiConversation.conversation);
          const wasGuest = !auth.isIdentified;
          lessonPlan.setActiveLessonPlan(null);
          await aiConversation.closeConversation();
          if (spoken) {
            await setJustTalk('');
          }
          if (wasGuest) {
            setShowGuestAuthWall(true);
          }
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }}
        isShowMessageProgress={!!aiConversation.goalInfo?.goalElement}
        conversationMode={aiConversation.conversationMode}
        toggleConversationMode={aiConversation.toggleConversationMode}
        isMuted={aiConversation.isMuted}
        setIsMuted={(isMuted) => aiConversation.toggleMute(isMuted)}
        onSelectMicrophone={aiConversation.switchMicrophone}
        isVolumeOn={aiConversation.isVolumeOn}
        voice={aiConversation.voice}
        messageOrder={aiConversation.messageOrder}
        onWebCamDescription={aiConversation.setWebCamDescription}
        isGuestConversationLimited={aiConversation.isGuestConversationLimited}
        onLimitedClick={() => {
          usage.togglePaymentModal(true);
        }}
      />
    </Stack>
  );
}
