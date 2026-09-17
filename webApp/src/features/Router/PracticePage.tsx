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
import { useEffect, useRef, useState } from 'react';
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
import { isAliasGameRolePlay, trackAliasEvent } from '@/features/RolePlay/aliasAnalytics';
import { useUrlState } from '@/features/Url/useUrlState';
import { useJustTalk } from '@/features/Conversation/useJustTalk';
import { useAutoStartJustTalk } from '@/features/Conversation/useAutoStartJustTalk';
import { JustTalkHandoffScreen } from '@/features/Conversation/JustTalkHandoffScreen';
import { ConversationGuestAuthWall } from '@/features/Conversation/ConversationGuestAuthWall';
import { canEnterPracticeAsGuest } from '@/features/Conversation/guestPracticeEntry';
import { readPendingPracticeLanguage } from '@/features/Goal/Quiz/pendingPracticeLanguage';
import {
  getPracticeIdleSurface,
  hasUserSpokenInConversation,
  isJustTalkHandoff,
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
  const hasTrackedSignupCompleted = useRef(false);
  const [justTalk, setJustTalk] = useUrlState(JUST_TALK_HANDOFF_PARAM, '', false);
  const { startJustTalk, isCallStarting } = useJustTalk();
  const isHandoff = isJustTalkHandoff(justTalk);
  const canGuestPractice = canEnterPracticeAsGuest({ justTalk, rolePlayId });
  const pendingPracticeLanguage = readPendingPracticeLanguage();
  const practiceLanguageCode =
    settings.languageCode || pendingPracticeLanguage || (canGuestPractice ? lang : null);
  const startHandoffJustTalk = () => startJustTalk(undefined, { skipConsentUi: true });
  // Wait for auth (and guest anonymous ensure) before auto-start so we do not
  // call ensureAnonymousAuth while persistence is still restoring a signed-in user.
  const { isResolvingAutoStart } = useAutoStartJustTalk(
    isHandoff && !auth.loading && auth.isAuthorized,
    startHandoffJustTalk,
  );
  const [showGuestAuthWall, setShowGuestAuthWall] = useState(false);
  const hasAutoOpenedPaywallRef = useRef(false);

  useEffect(() => {
    if (auth.isIdentified) {
      setShowGuestAuthWall(false);
    }
  }, [auth.isIdentified]);

  useEffect(() => {
    if (!aiConversation.isStarted) {
      hasAutoOpenedPaywallRef.current = false;
      return;
    }
    if (
      aiConversation.isLimitedRecording &&
      auth.isIdentified &&
      !hasAutoOpenedPaywallRef.current
    ) {
      hasAutoOpenedPaywallRef.current = true;
      usage.togglePaymentModal(true);
    }
  }, [
    aiConversation.isLimitedRecording,
    aiConversation.isStarted,
    auth.isIdentified,
    usage.togglePaymentModal,
  ]);

  useEffect(() => {
    if (auth.loading || auth.isIdentified || !canGuestPractice) {
      return;
    }
    void auth.ensureAnonymousAuth();
  }, [auth.loading, auth.isIdentified, canGuestPractice, auth.ensureAnonymousAuth]);

  useEffect(() => {
    if (
      !hasTrackedSignupCompleted.current &&
      auth.isIdentified &&
      isAliasGameRolePlay(rolePlayId)
    ) {
      trackAliasEvent('alias_signup_completed');
      hasTrackedSignupCompleted.current = true;
    }
  }, [auth.isIdentified, rolePlayId]);

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
    : !settings.loading && Boolean(auth.uid) && Boolean(settings.languageCode);

  const usageReady = canGuestPractice || usage.isWelcomeBalanceInitialized;

  if (!settingsReady || !usageReady) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (access.isBlockedByAge) return <BlockedAccess />;

  if (appNavigation.currentPage === 'community') return <CommunityDashboard />;

  if (!practiceLanguageCode) return <SelectLanguage pageLang={lang} />;

  const idleSurface = getPracticeIdleSurface({
    isStarted: aiConversation.isStarted,
    isHandoff,
    errorInitiating: aiConversation.errorInitiating,
    isInitializing: aiConversation.isInitializing,
  });

  if (idleSurface === 'loading') {
    return <InfoBlockedSection title={aiConversation.isInitializing} />;
  }

  if (idleSurface === 'error') {
    return (
      <ConversationError
        errorMessage={aiConversation.errorInitiating || ''}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (idleSurface === 'handoff') {
    if (isResolvingAutoStart || isCallStarting) {
      return <InfoBlockedSection title={i18n._(`Loading...`)} />;
    }
    return (
      <JustTalkHandoffScreen
        onEnableMic={startHandoffJustTalk}
        isStarting={isCallStarting}
        wasDenied={Boolean(aiConversation.errorInitiating)}
      />
    );
  }

  if (idleSurface === 'dashboard') {
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
