'use client';

import { useLingui } from '@lingui/react';
import { Button, IconButton, Link, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import dayjs from 'dayjs';
import { Check, Mic, Minus, Plus } from 'lucide-react';
import { AuthWall } from '../Auth/AuthWall';
import { useAuth } from '../Auth/useAuth';
import { useAiConversation } from '../Conversation/useAiConversation/useAiConversation';
import { ConversationCanvas } from '../Conversation/ConversationCanvas';
import { ConversationError } from '../Conversation/ConversationError';
import { useJustTalk } from '../Conversation/useJustTalk';
import { useConversationsAnalysis } from '../Conversation/useConversationsAnalysis';
import { useAudioRecorder } from '../Audio/useAudioRecorder';
import { InfoBlockedSection } from '../Dashboard/InfoBlockedSection';
import { SupportedLanguage } from '../Lang/lang';
import { useLessonPlan } from '../LessonPlan/useLessonPlan';
import { AdvancedHeader } from './AdvancedHeader';
import { useAppNavigation } from '../Navigation/useAppNavigation';
import { usePlan } from '../Plan/usePlan';
import { useSettings } from '../Settings/useSettings';
import { useUsage } from '../Usage/useUsage';
import {
  ADVANCED_DEFAULT_HOURS,
  ADVANCED_MAX_HOURS,
  ADVANCED_MIN_HOURS,
  ADVANCED_PRICE_PER_HOUR_USD,
  ADVANCED_REALTIME_MODEL,
  clampAdvancedHours,
  formatAdvancedUsd,
  hasAdvancedTalkAccess,
} from '../Usage/advancedUsage';
import { createStripeInvoice } from '../Usage/createStripeInvoice';
import { ConfirmPaymentForm } from '../Usage/HoursPaymentModal/ConfirmPaymentForm';
import { PaymentSuccess } from '../Usage/HoursPaymentModal/PaymentSuccess';
import { PaymentLog } from '../Usage/usage';
import { convertHoursToHumanFormat } from '@/libs/convertHoursToHumanFormat';
import { useUrlState } from '../Url/useUrlState';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { TopOffset } from '../Layout/TopOffset';

export const AdvancedPage = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const usage = useUsage();
  const aiConversation = useAiConversation();
  const recorder = useAudioRecorder();
  const conversationAnalysis = useConversationsAnalysis();
  const lessonPlan = useLessonPlan();
  const plan = usePlan();
  const appNavigation = useAppNavigation();
  const { startJustTalk, isCallStarting } = useJustTalk();
  const notifications = useNotifications();

  const [hoursToBuy, setHoursToBuy] = useState(ADVANCED_DEFAULT_HOURS);
  const [hoursInput, setHoursInput] = useState(String(ADVANCED_DEFAULT_HOURS));
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPaymentSuccess, setPaymentSuccess] = useUrlState('paymentSuccess', false, true);

  const advancedBalanceHours = usage.advancedBalanceHours || 0;
  const canStartTalk = hasAdvancedTalkAccess(advancedBalanceHours);
  const advancedPayments = (usage.paymentLogs || [])
    .filter((log) => log.type === 'advanced-hours')
    .sort((a, b) => b.createdAt - a.createdAt);

  const startAdvancedTalk = async () => {
    if (!canStartTalk || isCallStarting) return;
    if (!settings.languageCode) {
      await settings.setLanguage('en');
    }
    await startJustTalk(ADVANCED_REALTIME_MODEL);
  };

  const clickOnConfirmRequest = async () => {
    setIsRedirecting(true);
    const invoiceInfo = await createStripeInvoice(
      {
        userId: auth.uid,
        amountOfHours: hoursToBuy,
        languageCode: lang,
      },
      await auth.getToken(),
    );

    if (!invoiceInfo.invoiceUrl) {
      notifications.show(i18n._('Error creating payment session'), {
        severity: 'error',
      });
      setIsRedirecting(false);
      return;
    }

    window.location.href = invoiceInfo.invoiceUrl;
  };

  if (auth.loading) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (!auth.isAuthorized) {
    return (
      <AuthWall
        signInTitle={i18n._('Advanced AI talking')}
        singInSubTitle={i18n._('Sign in to buy hours and start a high-quality conversation')}
      >
        {null}
      </AuthWall>
    );
  }

  if (settings.loading || !usage.isWelcomeBalanceInitialized) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (aiConversation.errorInitiating) {
    return (
      <ConversationError
        errorMessage={aiConversation.errorInitiating || ''}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (aiConversation.isInitializing) {
    return <InfoBlockedSection title={aiConversation.isInitializing} />;
  }

  if (aiConversation.isStarted) {
    return (
      <>
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
          balanceHours={advancedBalanceHours}
          togglePaymentModal={() => setIsPayOpen(true)}
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
            lessonPlan.setActiveLessonPlan(null);
            await aiConversation.closeConversation();
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
          isShowMessageProgress={false}
          conversationMode={aiConversation.conversationMode}
          toggleConversationMode={aiConversation.toggleConversationMode}
          isMuted={aiConversation.isMuted}
          setIsMuted={(isMuted) => aiConversation.toggleMute(isMuted)}
          isVolumeOn={aiConversation.isVolumeOn}
          voice={aiConversation.voice}
          messageOrder={aiConversation.messageOrder}
          onWebCamDescription={aiConversation.setWebCamDescription}
          onLimitedClick={() => setIsPayOpen(true)}
        />
        <AdvancedPayModal
          isOpen={isPayOpen}
          hoursToBuy={hoursToBuy}
          isRedirecting={isRedirecting}
          onClose={() => setIsPayOpen(false)}
          onConfirmRequest={() => void clickOnConfirmRequest()}
        />
      </>
    );
  }

  return (
    <AuthWall
      signInTitle={i18n._('Advanced AI talking')}
      singInSubTitle={i18n._('Sign in to buy hours and start a high-quality conversation')}
    >
      <TopOffset />
      <Stack
        sx={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: '40px 20px 80px 20px',
          boxSizing: 'border-box',
          gap: '28px',
        }}
      >
        <AdvancedHeader />
        <Stack sx={{ gap: '8px' }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {i18n._('Advanced AI')}
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            {i18n._('Just talk with the advanced realtime model. {price} per hour.', {
              price: formatAdvancedUsd(ADVANCED_PRICE_PER_HOUR_USD),
            })}
          </Typography>
        </Stack>

        <Stack
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px',
            padding: '20px',
            gap: '8px',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._('Balance')}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {convertHoursToHumanFormat(advancedBalanceHours)}
          </Typography>
        </Stack>

        <Stack
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px',
            padding: '20px',
            gap: '16px',
          }}
        >
          <Typography variant="h6">{i18n._('Buy hours')}</Typography>
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <IconButton
              aria-label={i18n._('Decrease hours')}
              disabled={hoursToBuy <= ADVANCED_MIN_HOURS}
              onClick={() => {
                const next = clampAdvancedHours(hoursToBuy - 1);
                setHoursToBuy(next);
                setHoursInput(String(next));
              }}
            >
              <Minus />
            </IconButton>
            <TextField
              type="number"
              inputProps={{
                min: ADVANCED_MIN_HOURS,
                max: ADVANCED_MAX_HOURS,
                step: 1,
              }}
              value={hoursInput}
              onChange={(event) => {
                const raw = event.target.value;
                setHoursInput(raw);
                const parsed = Number(raw);
                if (Number.isFinite(parsed)) {
                  setHoursToBuy(clampAdvancedHours(parsed));
                }
              }}
              onBlur={() => {
                const next = clampAdvancedHours(Number(hoursInput));
                setHoursToBuy(next);
                setHoursInput(String(next));
              }}
              sx={{
                width: '120px',
                '& input': {
                  textAlign: 'center',
                },
              }}
            />

            <IconButton
              aria-label={i18n._('Increase hours')}
              disabled={hoursToBuy >= ADVANCED_MAX_HOURS}
              onClick={() => {
                const next = clampAdvancedHours(hoursToBuy + 1);
                setHoursToBuy(next);
                setHoursInput(String(next));
              }}
            >
              <Plus />
            </IconButton>
          </Stack>

          <Button
            variant="contained"
            sx={{
              fontSize: '24px',
              fontWeight: 600,
            }}
            color="info"
            size="large"
            onClick={() => setIsPayOpen(true)}
          >
            {i18n._('Pay {amount}', {
              amount: formatAdvancedUsd(hoursToBuy * ADVANCED_PRICE_PER_HOUR_USD),
            })}
          </Button>
          <AdvancedPurchaseDetails hoursToBuy={hoursToBuy} />
        </Stack>

        <Button
          variant="contained"
          size="large"
          disabled={!canStartTalk || isCallStarting}
          startIcon={<Mic size={24} />}
          onClick={() => void startAdvancedTalk()}
          sx={{
            fontSize: '24px',
            fontWeight: 600,
          }}
          color={canStartTalk ? 'secondary' : 'info'}
        >
          {isCallStarting
            ? i18n._('Starting...')
            : canStartTalk
              ? i18n._('Start conversation')
              : i18n._('Buy hours to start')}
        </Button>

        <Stack sx={{ gap: '12px' }}>
          <Typography variant="h6">{i18n._('Payment history')}</Typography>
          {!usage.paymentLogs && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {i18n._('Loading...')}
            </Typography>
          )}
          {usage.paymentLogs && advancedPayments.length === 0 && (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {i18n._('No advanced payments yet')}
            </Typography>
          )}
          {advancedPayments.map((log) => (
            <AdvancedPaymentRow key={log.id} log={log} />
          ))}
        </Stack>
      </Stack>

      <AdvancedPayModal
        isOpen={isPayOpen}
        hoursToBuy={hoursToBuy}
        isRedirecting={isRedirecting}
        onClose={() => setIsPayOpen(false)}
        onConfirmRequest={() => void clickOnConfirmRequest()}
      />

      {isPaymentSuccess && (
        <CustomModal isOpen={true} onClose={() => void setPaymentSuccess(false)}>
          <PaymentSuccess onClose={() => void setPaymentSuccess(false)} />
        </CustomModal>
      )}
    </AuthWall>
  );
};

const AdvancedPurchaseDetails = ({ hoursToBuy }: { hoursToBuy: number }) => {
  const { i18n } = useLingui();
  const items = [
    i18n._('{hours} hour(s) of advanced AI talking', { hours: hoursToBuy }),
    i18n._('Just talk with the latest realtime model'),
    i18n._('You are charged for speaking time, not waiting time'),
  ];

  return (
    <Stack sx={{ gap: '12px', paddingTop: '4px' }}>
      {items.map((item) => (
        <Stack
          key={item}
          sx={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <Check size={18} color="#8bc34a" style={{ marginTop: '2px', flexShrink: 0 }} />
          <Typography>{item}</Typography>
        </Stack>
      ))}
      <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.6 }}>
        {i18n._(
          `One hour is based on the time you or the AI is actively speaking. If you talk for 10 minutes and then wait for 20 minutes, you use about 10 minutes. If the AI thinks for a long time before answering, usage can be a bit higher than the time you hear. An hour is an approximate measure of talking cost, and actual usage can vary.`,
        )}
      </Typography>
    </Stack>
  );
};

const AdvancedPayModal = ({
  isOpen,
  hoursToBuy,
  isRedirecting,
  onClose,
  onConfirmRequest,
}: {
  isOpen: boolean;
  hoursToBuy: number;
  isRedirecting: boolean;
  onClose: () => void;
  onConfirmRequest: () => void;
}) => {
  const { i18n } = useLingui();

  if (!isOpen) return null;

  return (
    <CustomModal isOpen={true} onClose={onClose}>
      <Stack sx={{ width: '100%', maxWidth: '700px', gap: '24px' }}>
        <Stack>
          <Typography variant="h5">{i18n._('Confirm payment')}</Typography>
          <Typography sx={{ opacity: 0.7 }}>
            {i18n._('Buying {hours} hour(s) of advanced AI talking', { hours: hoursToBuy })}
          </Typography>
        </Stack>
        <ConfirmPaymentForm
          isRedirecting={isRedirecting}
          amountInUsd={hoursToBuy * ADVANCED_PRICE_PER_HOUR_USD}
          forceUsd
          onConfirmRequest={onConfirmRequest}
        />
      </Stack>
    </CustomModal>
  );
};

const AdvancedPaymentRow = ({ log }: { log: PaymentLog }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <Stack>
        <Typography variant="h6">
          {log.currency.toUpperCase()} {log.amountAdded}
        </Typography>
        {!!log.amountOfHours && (
          <Typography variant="body2">{convertHoursToHumanFormat(log.amountOfHours)}</Typography>
        )}
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {i18n._('Advanced AI hours')}
        </Typography>
      </Stack>
      <Stack sx={{ alignItems: 'flex-end' }}>
        <Typography variant="caption">{dayjs(log.createdAt).format('HH:mm')}</Typography>
        <Typography variant="body2">{dayjs(log.createdAt).format('DD MMM YYYY')}</Typography>
        {log.receiptUrl && (
          <Link href={log.receiptUrl} target="_blank">
            <Typography variant="body2">{i18n._('Receipt')}</Typography>
          </Link>
        )}
      </Stack>
    </Stack>
  );
};
