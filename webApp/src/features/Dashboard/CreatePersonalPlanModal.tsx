'use client';

import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ModalHeader } from '@/features/uiKit/Modal/ModalHeader';
import { fullEnglishLanguageName } from '@/features/Lang/lang';
import { useSettings } from '@/features/Settings/useSettings';
import { usePlan } from '@/features/Plan/usePlan';
import { useTextAi } from '@/features/Ai/useTextAi';
import { useAiUserInfo } from '@/features/User/useAiUserInfo';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import { VoiceRecordControl } from '@/features/Audio/VoiceRecordControl';
import { generateFollowUpQuestion } from '@/features/Goal/Quiz/followUpQuestion';
import { followUpSubtitle, personalizedPlanContext } from '@/features/Goal/Quiz/onboardingContent';

const appendTranscript = (current: string, transcript: string) => {
  const base = current.trim();
  const next = transcript.trim();
  if (!next) return current;
  if (!base) return next;
  if (base.includes(next)) return current;
  return `${base} ${next}`;
};

export const CreatePersonalPlanModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const plan = usePlan();
  const textAi = useTextAi();
  const userInfo = useAiUserInfo();

  const [reason, setReason] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [step, setStep] = useState<'reason' | 'followUp'>('reason');
  const [isWritingQuestion, setIsWritingQuestion] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [questionError, setQuestionError] = useState(false);
  const recorder = useAudioRecorder();
  const appliedRecordingRef = useRef<Blob | null>(null);
  const recordingStepRef = useRef<'reason' | 'followUp'>('reason');

  useEffect(() => {
    const blob = recorder.transcriptionBlob;
    const transcript = recorder.transcription?.trim() || '';
    if (!blob || recorder.isTranscribing || appliedRecordingRef.current === blob || !transcript) {
      return;
    }
    appliedRecordingRef.current = blob;
    if (recordingStepRef.current === 'reason') {
      setReason((current) => appendTranscript(current, transcript));
      return;
    }
    setFollowUpAnswer((current) => appendTranscript(current, transcript));
  }, [recorder.isTranscribing, recorder.transcription, recorder.transcriptionBlob]);

  const learningLanguage = settings.languageCode || 'en';
  const languageName = settings.fullLanguageName || fullEnglishLanguageName[learningLanguage];
  const isVoiceBusy = recorder.isRecording || recorder.isTranscribing;
  const isBusy = isWritingQuestion || isGeneratingPlan || isVoiceBusy;

  const toggleVoice = async () => {
    if (isWritingQuestion || isGeneratingPlan || recorder.isTranscribing) {
      return;
    }
    if (recorder.isRecording) {
      await recorder.stopRecording();
      return;
    }
    recordingStepRef.current = step;
    await recorder.startRecording();
  };
  const reasonText = reason.trim();
  const followUpText = followUpAnswer.trim();

  const continueToFollowUp = async () => {
    if (!reasonText || isBusy) {
      return;
    }

    setQuestionError(false);
    setIsWritingQuestion(true);
    try {
      const title = await generateFollowUpQuestion({
        textAi,
        transcript: reasonText,
        languageCode: settings.pageLanguageCode,
      });
      setFollowUpQuestion(title);
      setFollowUpAnswer('');
      setStep('followUp');
    } catch (error) {
      Sentry.captureException(error);
      setQuestionError(true);
    } finally {
      setIsWritingQuestion(false);
    }
  };

  const generatePlan = async () => {
    if (!reasonText || !followUpText || isBusy) {
      return;
    }

    setIsGeneratingPlan(true);
    try {
      const context = personalizedPlanContext({
        aboutUserTranscription: reasonText,
        aboutUserFollowUpTranscription: followUpText,
      });
      const recordsRequest = userInfo.extractUserRecordsFromText?.(context).catch((error) => {
        Sentry.captureException(error);
        return [];
      });
      const goal = await plan.generateGoal({
        languageCode: learningLanguage,
        context,
      });
      await recordsRequest;
      await plan.addGoalPlan(goal);
      onClose();
    } catch (error) {
      Sentry.captureException(error);
      alert(i18n._('Something went wrong while creating your plan. Please try again later.'));
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <CustomModal
      isOpen
      onClose={isBusy ? undefined : onClose}
      zIndex={1400}
      backgroundColor="#1c1e24"
      data-testid="create-personal-plan"
    >
      <Stack sx={{ width: '100%', maxWidth: '600px', gap: '20px' }}>
        {step === 'reason' ? (
          <>
            <ModalHeader
              title={i18n._('Why do you want to learn {language}?', { language: languageName })}
              subtitle={i18n._('Write a few sentences in your own words.')}
            />
            <TextField
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={i18n._('I want to learn it so I can...')}
              aria-label={i18n._('Why do you want to learn {language}?', {
                language: languageName,
              })}
              multiline
              minRows={5}
              fullWidth
              disabled={isBusy}
              data-testid="create-personal-plan-reason"
            />
            <VoiceRecordControl
              isRecording={recorder.isRecording}
              isTranscribing={recorder.isTranscribing}
              visualizer={recorder.visualizerComponent}
              idleLabel={i18n._('Record with voice')}
              disabled={isWritingQuestion || isGeneratingPlan}
              onToggle={() => {
                void toggleVoice();
              }}
              onCancel={() => {
                void recorder.cancelRecording();
              }}
              buttonTestId="create-personal-plan-voice"
              visualizerTestId="create-personal-plan-voice-visualizer"
            />
            {recorder.error ? (
              <Typography color="error" variant="body2">
                {recorder.error}
              </Typography>
            ) : null}
            {questionError && (
              <Typography color="error">
                {i18n._('Could not write your next question. Please try again.')}
              </Typography>
            )}
            <Button
              variant="contained"
              color="info"
              size="large"
              disabled={!reasonText || isBusy}
              onClick={() => {
                void continueToFollowUp();
              }}
              data-testid="create-personal-plan-continue"
            >
              {isWritingQuestion
                ? i18n._('Generating...')
                : questionError
                  ? i18n._('Try again')
                  : i18n._('Continue')}
            </Button>
          </>
        ) : (
          <>
            <ModalHeader title={followUpQuestion} subtitle={followUpSubtitle(i18n)} />
            <TextField
              value={followUpAnswer}
              onChange={(event) => setFollowUpAnswer(event.target.value)}
              placeholder={i18n._('Your answer')}
              aria-label={followUpQuestion}
              multiline
              minRows={5}
              fullWidth
              disabled={isBusy}
              data-testid="create-personal-plan-follow-up"
            />
            <VoiceRecordControl
              isRecording={recorder.isRecording}
              isTranscribing={recorder.isTranscribing}
              visualizer={recorder.visualizerComponent}
              idleLabel={i18n._('Record with voice')}
              disabled={isGeneratingPlan}
              onToggle={() => {
                void toggleVoice();
              }}
              onCancel={() => {
                void recorder.cancelRecording();
              }}
              buttonTestId="create-personal-plan-voice"
              visualizerTestId="create-personal-plan-voice-visualizer"
            />
            {recorder.error ? (
              <Typography color="error" variant="body2">
                {recorder.error}
              </Typography>
            ) : null}
            <Stack sx={{ gap: '8px' }}>
              <Button
                variant="contained"
                color="info"
                size="large"
                disabled={!followUpText || isBusy}
                onClick={() => {
                  void generatePlan();
                }}
                data-testid="create-personal-plan-generate"
              >
                {isGeneratingPlan ? i18n._('Generating...') : i18n._('Generate plan')}
              </Button>
              <Button
                variant="text"
                disabled={isBusy}
                onClick={() => setStep('reason')}
                data-testid="create-personal-plan-back"
              >
                {i18n._('Back')}
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </CustomModal>
  );
};
