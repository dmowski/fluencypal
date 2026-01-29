import CallEndIcon from '@mui/icons-material/CallEnd';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Trophy, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { FeatureBlocker } from '@/features/Usage/FeatureBlocker';
import { useAudioRecorder } from '@/features/Audio/useAudioRecorder';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import ClosedCaptionDisabledIcon from '@mui/icons-material/ClosedCaptionDisabled';
import { LessonPlanAnalysis } from '@/features/LessonPlan/type';
import { sleep } from '@/libs/sleep';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { useLessonPlan } from '@/features/LessonPlan/useLessonPlan';
import { useVadAudioRecorder } from '@/features/Audio/useVadAudioRecorder';
import { FooterButton } from './FooterButton';
import { useTextAi } from '@/features/Ai/useTextAi';
import { RecordingUserMessageMode } from '../types';
import { ConversationMessage } from '@/common/conversation';
import { useAccess } from '@/features/Usage/useAccess';

export const CallButtons = ({
  isMuted,
  setIsMuted,
  isWebCamEnabled,
  toggleWebCam,

  exit,

  isVolumeOn,
  setIsVolumeOn,
  isLimited,
  onLimitedClick,

  onSubmitTranscription,

  isSubtitlesEnabled,
  toggleSubtitles,

  lessonPlanAnalysis,
  onShowAnalyzeConversationModal,

  addTranscriptDelta,
  completeUserMessageDelta,
  recordingVoiceMode,
  messages,
  isSendMessagesBlocked,
}: {
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  isWebCamEnabled: boolean;
  toggleWebCam: (isToggleOn: boolean) => void;
  exit: () => void;

  isVolumeOn: boolean;
  setIsVolumeOn: (value: boolean) => void;
  isLimited: boolean;
  onLimitedClick: () => void;

  onSubmitTranscription: (userMessage: string) => void;

  isSubtitlesEnabled: boolean;
  toggleSubtitles: (isToggleOn: boolean) => void;

  lessonPlanAnalysis: LessonPlanAnalysis | null;
  onShowAnalyzeConversationModal: () => void;

  addTranscriptDelta: (transcripts: string) => void;
  completeUserMessageDelta: ({ removeMessage }: { removeMessage?: boolean }) => void;

  recordingVoiceMode: RecordingUserMessageMode;
  messages: ConversationMessage[];
  isSendMessagesBlocked: boolean;
}) => {
  const { i18n } = useLingui();

  const progress = lessonPlanAnalysis?.progress || 1;

  const ai = useTextAi();

  const [isShowVolumeWarning, setIsShowVolumeWarning] = useState(false);
  const access = useAccess();

  const toggleVolume = () => {
    if (isLimited) {
      setIsShowVolumeWarning(true);
      return;
    }

    setIsVolumeOn(!isVolumeOn);
    setIsVolumeOnToDisplay(!isVolumeOn);
  };

  const recorder = useAudioRecorder();

  const isSubmittingRef = useRef(false);

  const lessonPlan = useLessonPlan();

  const [isProcessingTranscription, setIsProcessingTranscription] = useState(false);

  const submitTranscription = async () => {
    const transcription = recorder.transcription;
    if (!transcription || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setIsProcessingTranscription(true);

    await lessonPlan.generateAnalysis(transcription);

    onSubmitTranscription(transcription);
    recorder.removeTranscript();
    recorder.cancelRecording();

    setIsVolumeOn(isVolumeOnToDisplay);

    setTimeout(() => {
      isSubmittingRef.current = false;
      setIsProcessingTranscription(false);
    }, 200);
  };

  const [isRecordingByButton, setIsRecordingByButton] = useState(false);
  const [isVolumeOnToDisplay, setIsVolumeOnToDisplay] = useState(isVolumeOn);
  useEffect(() => {
    sleep(300).then(() => {
      setIsVolumeOnToDisplay(isVolumeOn);
    });
  }, []);

  const onDoneRecordingUsingButton = async () => {
    if (recorder.isTranscribing) return;

    recorder.stopRecording();
  };

  const startRecordingUsingButton = async () => {
    if (recorder.isTranscribing) return;
    setIsRecordingByButton(true);
    setIsVolumeOn(false);

    await sleep(20); // wait for state to update
    await recorder.startRecording();
  };

  const cancelRecordingUsingButton = () => {
    if (recorder.isTranscribing) return;
    recorder.cancelRecording();
    setIsRecordingByButton(false);
  };

  useEffect(() => {
    if (!isRecordingByButton) return;
    if (!recorder.transcription) return;

    submitTranscription();
    setIsRecordingByButton(false);
  }, [isRecordingByButton, recorder.transcription]);

  const [transcriptStack, setTranscriptStack] = useState('');
  const transcriptStackRef = useRef('');
  transcriptStackRef.current = transcriptStack;
  const WAIT_BEFORE_SEND = 6000;

  const messagesRef = useRef<ConversationMessage[]>(messages);
  messagesRef.current = messages;

  const howMuchToWait = async (message: string): Promise<number> => {
    const botMessages = messagesRef.current.filter((msg) => msg.isBot);
    const lastBotMessage = botMessages?.[botMessages.length - 1] || null;
    const previousBotMessage = lastBotMessage ? lastBotMessage.text : '';

    const systemMessage = `You will receive a transcript from a real-time spoken conversation.

Your task is to decide how long (in milliseconds) the AI should wait before responding,
based on whether the user has finished speaking or is likely to continue.

Rules:
- Return ONLY a single number (milliseconds). No text, no explanation.
- Minimum wait time: 1500 ms
- Maximum wait time: 6000 ms

Decision logic:
- If the user's message feels logically complete, finished, or conclusive → return 1500
- If the user sounds like they are still thinking, continuing, or building an idea → return a longer wait time
- Add more wait time if:
  - The sentence ends abruptly
  - There are fillers (e.g. "uh", "um", "you know", long pauses implied)
  - The message feels mid-thought, reflective, or exploratory
- Use shorter wait time if:
  - The message ends with a clear conclusion
  - The user answers a question directly
  - The tone sounds confident and finished

Context:
- The previous bot message may change over time and should be used only as conversational context.
- Do NOT respond to the content itself — only estimate waiting time.

Examples:

User transcript:
"I think the idea works really well because it connects technology with nature."
→ 1500

User transcript:
"I think the idea works really well because it connects technology with…"
→ 4500

User transcript:
"Well, maybe one challenge could be… actually, I'm not sure, but like…"
→ 5500

User transcript:
"Yes, I can imagine ethical dilemmas around resource usage."
→ 1500

Previous bot message:
${previousBotMessage}

Return ONLY the number.
`;

    const userMessage = message;

    const start = Date.now();
    const response = await ai.generate({
      systemMessage: systemMessage,
      userMessage: userMessage,
      model: 'gpt-4o-mini',
    });

    return Math.min(5000, Math.max(2000, parseInt(response.trim())));
  };

  const vadAudioRecorder = useVadAudioRecorder({
    onTranscriptionStart: () => addTranscriptDelta(' '),
    silenceMs: 1000,
  });

  const processVadTranscript = async (transcript: string | null) => {
    if (!transcript) return;

    addTranscriptDelta(transcript);
    setBeforeSendingTimeout(null);
    const updatedTranscript = (transcriptStackRef.current + ' ' + transcript).trim();
    const toWait = updatedTranscript ? await howMuchToWait(updatedTranscript) : WAIT_BEFORE_SEND;
    setBeforeSendingTimeout(toWait);
    setOriginBeforeSendingTimeout(toWait);

    setTranscriptStack((prev) => {
      const newTranscript = prev + ' ' + transcript;
      return newTranscript;
    });

    await lessonPlan.generateAnalysis(updatedTranscript);
  };

  useEffect(() => {
    processVadTranscript(vadAudioRecorder.lastTranscript);
  }, [vadAudioRecorder.lastTranscript]);

  const isReallySpeaking = vadAudioRecorder.isSpeaking && vadAudioRecorder.speakingLevel > 0.6;
  const isSpeakingRef = useRef(false);
  isSpeakingRef.current = vadAudioRecorder.isSpeaking || vadAudioRecorder.isTranscribing;

  useEffect(() => {
    if (isReallySpeaking) {
      setIsVolumeOn(false);
    } else {
      setIsVolumeOn(isVolumeOnToDisplay);
    }
  }, [isReallySpeaking]);

  const [beforeSendingTimeout, setBeforeSendingTimeout] = useState<number | null>(null);
  const [originBeforeSendingTimeout, setOriginBeforeSendingTimeout] = useState<number | null>(null);

  const waitingPercent = beforeSendingTimeout
    ? Math.round(
        (((originBeforeSendingTimeout || WAIT_BEFORE_SEND) - beforeSendingTimeout) /
          (originBeforeSendingTimeout || WAIT_BEFORE_SEND)) *
          100,
      )
    : 0;

  useEffect(() => {
    if (!transcriptStack) return;
    if (vadAudioRecorder.isTranscribing || isReallySpeaking) {
      setBeforeSendingTimeout(null);
      return;
    }
    setBeforeSendingTimeout(WAIT_BEFORE_SEND);
    setOriginBeforeSendingTimeout(WAIT_BEFORE_SEND);
  }, [isReallySpeaking, vadAudioRecorder.isTranscribing]);

  useEffect(() => {
    if (beforeSendingTimeout === null) return;

    const tick = 100;

    if (beforeSendingTimeout <= tick) {
      completeUserMessageDelta({});
      setTranscriptStack('');
      setBeforeSendingTimeout(null);
      return;
    }

    const timeout = setTimeout(() => {
      setBeforeSendingTimeout((prev) => {
        if (prev === null) return null;
        return prev - tick;
      });
    }, tick);

    return () => clearTimeout(timeout);
  }, [beforeSendingTimeout]);

  const toggleVad = () => {
    if (vadAudioRecorder.isEnabled) {
      vadAudioRecorder.stop();
    } else {
      vadAudioRecorder.start();
    }
  };

  const speakingVolumePercent = Math.max(10, Math.round(vadAudioRecorder.speakingLevel * 100));
  const inActivePercent = 100 - speakingVolumePercent;

  const cancelActiveMessage = () => {
    setTranscriptStack('');
    setBeforeSendingTimeout(null);
    completeUserMessageDelta({
      removeMessage: true,
    });
  };

  const isShowUndo = recordingVoiceMode === 'VAD' && waitingPercent > 20;

  useEffect(() => {
    if (isSendMessagesBlocked && !isMuted) {
      setTimeout(() => {
        setIsMuted(true);
        vadAudioRecorder.stop();
      }, 200);
    }
  }, [isSendMessagesBlocked]);

  return (
    <Stack
      sx={{
        backgroundColor: 'rgba(10, 18, 30, 1)',
        borderRadius: '20px 20px 0 0 ',
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: 'max-content',
        padding: '10px 10px 21px 10px',
        position: 'relative',
        bottom: '-1px',
      }}
    >
      <Stack
        sx={{
          position: 'absolute',
          bottom: '0px',
          left: '0px',
          width: 'calc(100% - 0px)',
          height: '9px',
          borderRadius: '0',
          overflow: 'hidden',
          opacity: lessonPlanAnalysis ? 1 : 0,
        }}
      >
        <Stack
          sx={{
            width: `${progress}%`,
            height: '100%',
            position: 'absolute',
            top: 0,
            left: '0px',
            background: 'linear-gradient(90deg, rgba(46, 193, 233, 1), rgba(0, 166, 255, 1))',
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </Stack>

      {progress > 99 ? (
        <Button
          startIcon={<Trophy />}
          size="large"
          color="info"
          variant="contained"
          sx={{
            height: '48px',
            minWidth: '250px',
          }}
          onClick={() => {
            vadAudioRecorder.stop();
            onShowAnalyzeConversationModal();
          }}
        >
          {i18n._('Open results')}
        </Button>
      ) : (
        <>
          {isRecordingByButton || isProcessingTranscription ? (
            <>
              <FooterButton
                activeButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CircularProgress size={'24px'} />
                  ) : (
                    <DoneIcon />
                  )
                }
                inactiveButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CircularProgress size={'24px'} />
                  ) : (
                    <DoneIcon />
                  )
                }
                isActive={recorder.isTranscribing || isProcessingTranscription}
                label={i18n._('Done recording')}
                onClick={onDoneRecordingUsingButton}
              />

              <Stack
                sx={{
                  width: '185px',
                }}
              >
                {recorder.visualizerComponent}
              </Stack>

              <FooterButton
                activeButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CloseIcon style={{ opacity: 0.2 }} />
                  ) : (
                    <CloseIcon />
                  )
                }
                inactiveButton={
                  recorder.isTranscribing || isProcessingTranscription ? (
                    <CloseIcon style={{ opacity: 0.2 }} />
                  ) : (
                    <CloseIcon />
                  )
                }
                isActive={true}
                label={i18n._('Cancel recording')}
                onClick={cancelRecordingUsingButton}
              />
            </>
          ) : (
            <>
              {recordingVoiceMode === 'VAD' && (
                <FooterButton
                  activeButton={
                    <Stack
                      sx={{
                        position: 'relative',
                      }}
                    >
                      <MicIcon
                        sx={{
                          fontWeight: 'bold',
                          color: '#ff3d3d',
                        }}
                      />

                      <Stack
                        sx={{
                          opacity: waitingPercent > 0 ? 0.6 : 0,
                          position: 'absolute',
                          top: '-13px',
                          left: '-13px',
                          height: '50px',
                          width: '50px',
                        }}
                      >
                        <CircularProgress
                          size={'50px'}
                          thickness={1}
                          value={waitingPercent}
                          variant="determinate"
                        />
                      </Stack>

                      <Stack
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          overflow: 'hidden',
                          height: inActivePercent + '%',
                          width: '100%',
                        }}
                      >
                        <MicIcon
                          sx={{
                            fontWeight: 'bold',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            color: '#fff',
                          }}
                        />
                      </Stack>
                    </Stack>
                  }
                  inactiveButton={<MicOffIcon />}
                  isActive={vadAudioRecorder.isEnabled}
                  label={i18n._('Enable Microphone')}
                  onClick={isSendMessagesBlocked ? access.showPaymentModal : toggleVad}
                  isLocked={isSendMessagesBlocked}
                />
              )}

              {/*
              <FooterButton
                activeButton={<Undo2 />}
                inactiveButton={<Undo2 />}
                isActive={true}
                label={i18n._('Undo active message')}
                onClick={isShowUndo ? cancelActiveMessage : () => {}}
              />
              */}

              {recordingVoiceMode === 'RealTimeConversation' && (
                <FooterButton
                  activeButton={<MicIcon />}
                  inactiveButton={<MicOffIcon />}
                  isActive={isMuted === false}
                  label={i18n._('Enable microphone')}
                  onClick={
                    isSendMessagesBlocked ? access.showPaymentModal : () => setIsMuted(!isMuted)
                  }
                  isLocked={isSendMessagesBlocked}
                />
              )}

              {recordingVoiceMode === 'PushToTalk' && (
                <FooterButton
                  activeButton={<MicIcon />}
                  inactiveButton={<MicOffIcon />}
                  isActive={false}
                  label={i18n._('Record Message')}
                  onClick={
                    isSendMessagesBlocked ? access.showPaymentModal : startRecordingUsingButton
                  }
                  isLocked={isSendMessagesBlocked}
                />
              )}

              <FooterButton
                activeButton={<VolumeUpIcon />}
                inactiveButton={<VolumeOffIcon />}
                isActive={isVolumeOnToDisplay}
                label={isVolumeOnToDisplay ? i18n._('Turn off volume') : i18n._('Turn on volume')}
                onClick={toggleVolume}
                isLocked={isLimited}
              />

              <FooterButton
                activeButton={<ClosedCaptionIcon />}
                inactiveButton={<ClosedCaptionDisabledIcon />}
                isActive={isSubtitlesEnabled}
                label={
                  isSubtitlesEnabled ? i18n._('Turn off subtitles') : i18n._('Turn on subtitles')
                }
                onClick={() => toggleSubtitles(!isSubtitlesEnabled)}
              />

              <FooterButton
                activeButton={<VideocamIcon />}
                inactiveButton={<VideocamOffIcon />}
                isActive={isWebCamEnabled}
                label={isWebCamEnabled ? i18n._('Turn off video') : i18n._('Turn on video')}
                onClick={() => toggleWebCam(!isWebCamEnabled)}
              />

              <IconButton
                size="large"
                onClick={() => {
                  vadAudioRecorder.stop();
                  exit();
                }}
                sx={{
                  width: '70px',
                  borderRadius: '30px',
                  backgroundColor: '#dc362e',
                  ':hover': { backgroundColor: 'rgba(255, 0, 0, 0.7)' },
                }}
              >
                <CallEndIcon />
              </IconButton>
            </>
          )}

          {isShowVolumeWarning && (
            <CustomModal
              isOpen={true}
              onClose={() => {
                setIsShowVolumeWarning(false);
                recorder.cancelRecording();
                recorder.removeTranscript();
              }}
            >
              <Stack
                sx={{
                  maxWidth: '600px',
                  gap: '40px',
                  alignItems: 'center',
                  paddingTop: '25px',
                }}
              >
                <Stack
                  sx={{
                    maxWidth: '600px',
                    gap: '0px',
                  }}
                >
                  <Typography variant="h5">
                    {isShowVolumeWarning ? i18n._('AI voice') : i18n._('Real-time conversation')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    {isShowVolumeWarning
                      ? i18n._(
                          'Enabling ai voice is a premium feature. Please upgrade your plan to access this feature.',
                        )
                      : i18n._(
                          'Using real-time microphone is a premium feature. Please upgrade your plan to access this feature or use recorded audio.',
                        )}
                  </Typography>
                </Stack>

                <FeatureBlocker onLimitedClick={onLimitedClick} />
                <Button
                  fullWidth
                  onClick={() => {
                    setIsShowVolumeWarning(false);
                  }}
                >
                  {i18n._('Close')}
                </Button>
              </Stack>
            </CustomModal>
          )}
        </>
      )}
    </Stack>
  );
};
