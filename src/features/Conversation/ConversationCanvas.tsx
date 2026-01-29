'use client';

import { Markdown } from '../uiKit/Markdown/Markdown';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowUp,
  Check,
  CircleEllipsis,
  Keyboard,
  Lightbulb,
  Loader,
  LockIcon,
  LogOut,
  Mic,
  Send,
  Trash2,
  Trophy,
} from 'lucide-react';
import VideocamIcon from '@mui/icons-material/Videocam';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import { AliasGamePanel } from './AliasGamePanel';
import { ConversationMessage, MessagesOrderMap } from '@/common/conversation';
import { GuessGameStat, RecordingUserMessageMode } from './types';
import dayjs from 'dayjs';
import { useLingui } from '@lingui/react';
import { ConversationResult } from '../Plan/types';
import { useTranslate } from '../Translation/useTranslate';
import { useResizeElement } from '../Layout/useResizeElement';
import { Messages } from './Messages';
import { AiVoice } from '@/common/ai';
import { CameraCanvas } from './CallMode/CameraCanvas';
import { ConversationMode } from '@/common/user';
import { ProcessUserInput } from './ProcessUserInput';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { ConversationReviewModal } from './ConversationReviewModal';
import { LessonPlanAnalysis } from '../LessonPlan/type';
import { RecordingCanvasMenu } from './RecordingCanvasMenu';

interface ConversationCanvasProps {
  conversation: ConversationMessage[];
  isAiSpeaking: boolean;
  gameWords: GuessGameStat | null;
  isClosed: boolean;
  isClosing: boolean;

  addUserMessage: (message: string) => Promise<void>;
  balanceHours: number;
  recordingError: string;
  togglePaymentModal: (isOpen: boolean) => void;
  closeConversation: () => void;
  transcriptMessage?: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  isTranscribing: boolean;
  isRecording: boolean;
  recordingMilliSeconds: number;
  recordVisualizerComponent: ReactNode;

  isMuted: boolean;
  setIsMuted: (newState: boolean) => void;

  isShowMessageProgress: boolean;
  conversationAnalysisResult: ConversationResult | null;
  analyzeConversation: () => Promise<void>;
  toggleConversationMode: (mode: ConversationMode) => void;
  conversationMode: ConversationMode;
  voice: AiVoice;

  messageOrder: MessagesOrderMap;

  onWebCamDescription: (description: string) => void;

  isVolumeOn: boolean;
  setIsVolumeOn: (value: boolean) => void;
  isLimited: boolean;
  onLimitedClick: () => void;
  pointsEarned: number;
  openCommunityPage: () => void;

  lessonPlanAnalysis: LessonPlanAnalysis | null;

  openNextLesson: () => void;

  addTranscriptDelta: (transcripts: string) => void;
  completeUserMessageDelta: ({ removeMessage }: { removeMessage?: boolean }) => void;

  recordingVoiceMode: RecordingUserMessageMode;

  isSendMessagesBlocked: boolean;
}
export const ConversationCanvas: React.FC<ConversationCanvasProps> = ({
  toggleConversationMode,
  conversation,
  isAiSpeaking,
  gameWords,
  isClosed,
  isClosing,
  addUserMessage,
  togglePaymentModal,

  transcriptMessage,
  startRecording,
  stopRecording,
  cancelRecording,
  isTranscribing,
  isRecording,
  recordingMilliSeconds,
  recordVisualizerComponent,
  recordingError,

  isMuted,
  setIsMuted,
  closeConversation,
  conversationAnalysisResult,
  analyzeConversation,

  isVolumeOn,
  setIsVolumeOn,
  isLimited,
  onLimitedClick,
  voice,
  messageOrder,
  onWebCamDescription,
  conversationMode,
  pointsEarned,
  openCommunityPage,

  lessonPlanAnalysis,
  openNextLesson,

  completeUserMessageDelta,
  addTranscriptDelta,

  recordingVoiceMode,
  isSendMessagesBlocked,
}) => {
  const { i18n } = useLingui();
  const isChatMode = conversationMode === 'chat';
  const isCallMode = conversationMode === 'call';

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const closeMenus = () => setAnchorElUser(null);

  const isFinishingProcess = isClosing || isClosed;
  const { ref, size } = useResizeElement<HTMLDivElement>();
  const height = size.height || 0;

  const bottomSectionHeight = `${height + 40}px`;

  const messageAnalyzing = useRef('');
  const [internalUserInput, setInternalUserInput] = useState<string>('');
  const [isConfirmedUserKeyboardInput, setIsConfirmedUserKeyboardInput] = useState(false);

  const confirmedUserInput =
    transcriptMessage || (isConfirmedUserKeyboardInput ? internalUserInput : '');
  const isAnalyzingResponse = isTranscribing;

  const analyzeUserKeyboardInput = async () => {
    if (internalUserInput === messageAnalyzing.current || !internalUserInput) {
      return;
    }
    setIsConfirmedUserKeyboardInput(true);
  };

  useEffect(() => {
    const isWindow = typeof window !== 'undefined';
    if (!isWindow) return;

    const scrollToBottom = () => {
      const scrollElement =
        document.querySelector('#conversation-canvas-modal') ||
        document.querySelector('#messages-call-mode');

      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight + 1000,
          behavior: 'smooth',
        });
      }
    };
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [conversation, isAnalyzingResponse, isRecording, isCallMode]);

  const [isShowAnalyzeConversationModal, setIsShowAnalyzeConversationModal] = useState(false);
  const [isConversationContinueAfterAnalyze, setIsConversationContinueAfterAnalyze] =
    useState(false);

  const showAnalyzeConversationModal = () => {
    analyzeConversation();
    setIsShowAnalyzeConversationModal(true);
  };

  const translator = useTranslate();

  const loadingMessage = i18n._(`Loading...`);

  const lastBotMessage = useMemo(() => {
    for (let i = conversation.length - 1; i >= 0; i--) {
      if (conversation[i].isBot) {
        return conversation[i].text;
      }
    }
    return '';
  }, [conversation]);

  const modals = (
    <>
      {translator.translateModal}
      {isShowAnalyzeConversationModal && (
        <ConversationReviewModal
          setIsShowAnalyzeConversationModal={setIsShowAnalyzeConversationModal}
          conversationAnalysisResult={conversationAnalysisResult}
          openNextLesson={() => {
            setIsShowAnalyzeConversationModal(false);
            closeConversation();
            openNextLesson();
          }}
          setIsConversationContinueAfterAnalyze={setIsConversationContinueAfterAnalyze}
          pointsEarned={pointsEarned}
          openCommunityPage={() => {
            setIsShowAnalyzeConversationModal(false);
            closeConversation();
            openCommunityPage();
          }}
        />
      )}
    </>
  );

  const isCompletedLesson =
    !isConversationContinueAfterAnalyze &&
    (lessonPlanAnalysis ? (lessonPlanAnalysis.progress || 0) > 99 : false);

  if (isCallMode) {
    return (
      <Modal
        open={true}
        sx={{
          height: '100dvh',
          width: '100%',
          overflow: 'auto',
          zIndex: 992,
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0)',
            },
          },
        }}
      >
        <CameraCanvas
          lessonPlanAnalysis={lessonPlanAnalysis}
          messageOrder={messageOrder}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isAiSpeaking={isAiSpeaking}
          voice={voice}
          conversation={conversation}
          stopCallMode={() => toggleConversationMode('record')}
          onWebCamDescription={onWebCamDescription}
          isVolumeOn={isVolumeOn}
          setIsVolumeOn={setIsVolumeOn}
          isLimited={isLimited}
          onLimitedClick={onLimitedClick}
          onSubmitTranscription={addUserMessage}
          isCompletedLesson={isCompletedLesson}
          recordingVoiceMode={recordingVoiceMode}
          onShowAnalyzeConversationModal={() => {
            toggleConversationMode('record');
            showAnalyzeConversationModal();
          }}
          addTranscriptDelta={addTranscriptDelta}
          completeUserMessageDelta={completeUserMessageDelta}
          isSendMessagesBlocked={isSendMessagesBlocked}
        />
      </Modal>
    );
  }

  const progress = lessonPlanAnalysis ? lessonPlanAnalysis.progress || 0 : 0;

  return (
    <>
      <Modal
        open={true}
        id="conversation-canvas-modal"
        sx={{
          height: '100dvh',
          width: '100dvw',
          overflow: 'scroll',
          zIndex: 992,
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0)',
            },
          },
        }}
      >
        <Stack id="messages-list">
          <Stack
            sx={{
              width: '100%',
              alignItems: 'center',
              opacity: isFinishingProcess ? 0.2 : 1,
            }}
          >
            <Stack
              sx={{
                maxWidth: '900px',
                padding: '0',

                boxSizing: 'border-box',
                gap: '0px',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minHeight: 'calc(100dvh - 0px)',
                justifyContent: 'space-between',

                '@media (max-width: 600px)': {
                  border: 'none',
                },
                backgroundColor: '#1c2128',
                width: '100%',
              }}
            >
              <Messages
                conversation={conversation}
                messageOrder={messageOrder}
                isAiSpeaking={isAiSpeaking}
                voice={voice}
              />
              <Stack
                sx={{
                  height: bottomSectionHeight,
                  //backgroundColor: "rgba(255, 33, 40, 0.1)",
                  width: '100%',
                }}
              />
            </Stack>

            <Stack
              ref={ref}
              sx={{
                flexDirection: 'column',
                width: '100%',
                borderTop: confirmedUserInput
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.1)',

                position: 'fixed',
                bottom: '0px',
                left: 0,

                '--section-bg': '#252b33',
                backgroundColor: 'var(--section-bg)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stack
                sx={{
                  position: 'absolute',
                  top: '-5px',
                  left: '0px',
                  width: 'calc(100% - 0px)',
                  height: '4px',
                  borderRadius: '0',
                  overflow: 'hidden',
                }}
              >
                <Stack
                  sx={{
                    width: `${progress}%`,
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: '0px',
                    background:
                      'linear-gradient(90deg, rgba(46, 193, 233, 1), rgba(0, 166, 255, 1))',
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </Stack>

              {gameWords?.wordsUserToDescribe && (
                <Stack
                  sx={{
                    width: '100%',
                    alignItems: 'center',
                    padding: '10px',
                    boxSizing: 'border-box',
                  }}
                >
                  <Stack
                    sx={{
                      width: '100%',
                      maxWidth: '900px',
                      maxHeight: '40vh',
                      overflowY: 'auto',
                    }}
                  >
                    <AliasGamePanel gameWords={gameWords} conversation={conversation} />
                  </Stack>
                </Stack>
              )}

              <Stack
                sx={{
                  width: '100%',
                  boxSizing: 'border-box',
                  maxWidth: '900px',
                  padding: '20px 20px',
                  borderTop: 'none',
                  borderBottom: 'none',
                  '@media (max-width: 600px)': {
                    border: 'none',
                  },
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {recordingError && (
                  <Stack>
                    <Alert
                      severity="error"
                      variant="filled"
                      sx={{
                        width: '100%',
                        maxWidth: '900px',
                        backgroundColor: '#c4574f',
                        color: '#fff',
                        boxSizing: 'border-box',
                      }}
                    >
                      {recordingError || i18n._('Error during analyzing message')}
                    </Alert>
                  </Stack>
                )}

                {(confirmedUserInput || isTranscribing || isAnalyzingResponse) && (
                  <ProcessUserInput
                    isTranscribing={isTranscribing}
                    userMessage={confirmedUserInput}
                    previousBotMessage={lastBotMessage}
                    isRecording={isRecording}
                  />
                )}

                {!isFinishingProcess && (
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',

                      width: '100%',
                      '@media (max-width: 600px)': {
                        alignItems: 'center',
                        gap: '10px',
                      },
                    }}
                  >
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%',
                        gap: '15px',
                        '@media (max-width: 600px)': {
                          flexDirection: 'column-reverse',
                          alignItems: 'flex-start',
                        },
                      }}
                    >
                      {isAnalyzingResponse && (
                        <Button
                          startIcon={<Loader />}
                          size="large"
                          variant="contained"
                          sx={{
                            minWidth: '200px',
                          }}
                          disabled
                        >
                          {i18n._('Analyzing')}
                        </Button>
                      )}

                      {confirmedUserInput && !isRecording && !isAnalyzingResponse && (
                        <Button
                          startIcon={<ArrowUp />}
                          size="large"
                          variant={'contained'}
                          sx={{
                            minWidth: '200px',
                          }}
                          onClick={async () => {
                            addUserMessage(confirmedUserInput);
                            setIsConfirmedUserKeyboardInput(false);
                            setInternalUserInput('');
                          }}
                        >
                          {i18n._('Send')}
                        </Button>
                      )}

                      {isRecording && !isAnalyzingResponse && (
                        <Button
                          startIcon={<Check />}
                          size="large"
                          variant="contained"
                          sx={{
                            minWidth: '200px',
                          }}
                          onClick={async () => stopRecording()}
                        >
                          {i18n._('Done')}
                        </Button>
                      )}

                      {!transcriptMessage &&
                        !isRecording &&
                        !isAnalyzingResponse &&
                        !isCallMode &&
                        !isCompletedLesson &&
                        !isChatMode && (
                          <Stack
                            sx={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '100%',
                              gap: '10px',
                            }}
                          >
                            <Button
                              startIcon={<Mic />}
                              endIcon={isSendMessagesBlocked ? <LockIcon size="22px" /> : null}
                              size="large"
                              color={isSendMessagesBlocked ? 'secondary' : 'primary'}
                              variant="contained"
                              sx={{
                                minWidth: '200px',
                              }}
                              onClick={
                                isSendMessagesBlocked
                                  ? () => {
                                      togglePaymentModal(true);
                                    }
                                  : async () => startRecording()
                              }
                            >
                              {i18n._('Record Message')}
                            </Button>

                            <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                              <CircleEllipsis />
                            </IconButton>
                          </Stack>
                        )}

                      <RecordingCanvasMenu
                        anchorElUser={anchorElUser}
                        setAnchorElUser={setAnchorElUser}
                        isFinishingProcess={isFinishingProcess}
                        isRecording={isRecording}
                        isAnalyzingResponse={isAnalyzingResponse}
                        isCallMode={isCallMode}
                        isChatMode={isChatMode}
                        isLimited={isLimited}
                        toggleConversationMode={toggleConversationMode}
                        closeConversation={closeConversation}
                        closeMenus={closeMenus}
                      />

                      {!confirmedUserInput &&
                        !isRecording &&
                        !isAnalyzingResponse &&
                        !isCompletedLesson &&
                        isChatMode && (
                          <Stack
                            sx={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '100%',
                              gap: '5px',
                            }}
                          >
                            <TextField
                              autoFocus
                              value={internalUserInput}
                              onChange={(e) => setInternalUserInput(e.target.value)}
                              placeholder={i18n._('Your message...')}
                              multiline
                              minRows={1}
                              onKeyDown={(e) => {
                                const isEnter = e.key === 'Enter' && !e.shiftKey;
                                if (isEnter) {
                                  e.preventDefault();
                                  analyzeUserKeyboardInput();
                                }
                              }}
                              sx={{
                                width: '100%',
                                minHeight: '40px',
                                maxWidth: '500px',
                              }}
                              slotProps={{
                                input: {
                                  sx: {
                                    height: '100%',
                                    padding: '4px 0 3px 0',
                                  },
                                  inputProps: {
                                    style: {
                                      padding: '2px 8px',
                                    },
                                  },
                                },
                              }}
                            />
                            <IconButton
                              onClick={() => analyzeUserKeyboardInput()}
                              disabled={!internalUserInput}
                            >
                              <Send size={'20px'} />
                            </IconButton>

                            <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                              <CircleEllipsis />
                            </IconButton>
                          </Stack>
                        )}

                      {isCompletedLesson && (
                        <Stack
                          sx={{
                            alignItems: 'flex-start',
                            gap: '5px',
                          }}
                        >
                          <Typography>{i18n._('Mission complete')}</Typography>
                          <Button
                            startIcon={<Trophy />}
                            size="large"
                            color="info"
                            variant="contained"
                            onClick={async () => showAnalyzeConversationModal()}
                          >
                            {i18n._('Open results')}
                          </Button>
                        </Stack>
                      )}

                      {transcriptMessage && !isRecording && !isAnalyzingResponse && (
                        <Button
                          size="large"
                          startIcon={<Mic />}
                          onClick={async () => await startRecording()}
                        >
                          {i18n._('Re-record')}
                        </Button>
                      )}

                      {confirmedUserInput && !isRecording && !transcriptMessage && (
                        <Button
                          size="large"
                          startIcon={<Keyboard />}
                          onClick={async () => {
                            setIsConfirmedUserKeyboardInput(false);
                            messageAnalyzing.current = '';
                          }}
                        >
                          {i18n._('Re-write')}
                        </Button>
                      )}

                      {isRecording && (
                        <Stack
                          sx={{
                            width: 'max-content',
                            overflow: 'hidden',
                            height: '40px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0 10px 10px 0',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                            flexDirection: 'row',
                            gap: '10px',
                            padding: '0 10px 0 0px',
                            left: '-16px',
                            zIndex: 0,
                            '@media (max-width: 600px)': {
                              left: 0,
                              borderRadius: '10px',
                            },
                          }}
                        >
                          <Stack
                            sx={{
                              width: '150px',
                            }}
                          >
                            {recordVisualizerComponent}
                          </Stack>
                          <Stack
                            sx={{
                              position: 'absolute',
                              width: 'calc(100% - 45px)',
                              height: '120%',
                              top: '-10%',
                              left: 0,
                              boxShadow:
                                'inset 0 0 10px 10px var(--section-bg, rgba(20, 28, 40, 1))',
                            }}
                          ></Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              width: '30px',
                            }}
                          >
                            {dayjs(recordingMilliSeconds).format('mm:ss')}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {(isRecording || isLimited || transcriptMessage) && (
                      <Stack
                        sx={{
                          width: 'max-content',
                          height: '100%',
                          alignItems: 'flex-end',
                          justifyContent: 'flex-end',

                          '@media (max-width: 600px)': {
                            alignItems: 'flex-end',
                          },
                        }}
                      >
                        {isRecording || transcriptMessage ? (
                          <Tooltip title={i18n._('Cancel recording')}>
                            <Stack>
                              <IconButton
                                sx={{}}
                                size="large"
                                color="error"
                                onClick={() => cancelRecording()}
                              >
                                <Trash2 size={'18px'} />
                              </IconButton>
                            </Stack>
                          </Tooltip>
                        ) : (
                          <>
                            {isLimited && (
                              <Stack
                                sx={{
                                  alignItems: 'flex-end',
                                  boxSizing: 'border-box',
                                  gap: '5px',

                                  width: 'max-content',
                                }}
                              >
                                <IconButton
                                  sx={{
                                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.11)',
                                    background:
                                      'linear-gradient(130deg, rgba(229, 8, 8, 0.77), rgba(240, 128, 24, 0.93))',
                                  }}
                                  onClick={() => togglePaymentModal(true)}
                                >
                                  <VolumeOffIcon />
                                </IconButton>
                              </Stack>
                            )}
                          </>
                        )}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Modal>
      {modals}
    </>
  );
};
