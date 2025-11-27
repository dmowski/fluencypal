"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { JSX, useEffect, useRef, useState } from "react";
import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import {
  Alert,
  Avatar,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import {
  ArrowUp,
  Check,
  CircleEllipsis,
  Keyboard,
  Languages,
  Lightbulb,
  Loader,
  LogOut,
  Mic,
  Phone,
  Send,
  ShieldAlert,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";

import AddCardIcon from "@mui/icons-material/AddCard";

import { AliasGamePanel } from "./AliasGamePanel";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";
import dayjs from "dayjs";
import { StringDiff } from "react-string-diff";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { useLingui } from "@lingui/react";
import { useSound } from "../Audio/useSound";
import { GoalPlan } from "../Plan/types";
import { GradingProgressBar } from "../uiKit/Progress/GradingProgressBar";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useTranslate } from "../Translation/useTranslate";
import { useUrlParam } from "../Url/useUrlParam";
import { useResizeElement } from "../Layout/useResizeElement";
import { useWindowSizes } from "../Layout/useWindowSizes";
import { useWebCam } from "../webCam/useWebCam";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { useAuth } from "../Auth/useAuth";

interface ConversationCanvasProps {
  conversation: ChatMessage[];
  isAiSpeaking: boolean;
  gameWords: GuessGameStat | null;
  isClosed: boolean;
  isClosing: boolean;

  addUserMessage: (message: string) => Promise<void>;
  balanceHours: number;
  recordingError: string;
  togglePaymentModal: (isOpen: boolean) => void;
  conversationId: string;
  closeConversation: () => void;
  analyzeUserMessage: ({
    previousBotMessage,
    message,
    conversationId,
  }: {
    previousBotMessage: string;
    message: string;
    conversationId: string;
  }) => Promise<{
    sourceMessage: string;
    correctedMessage: string;
    description: string;
    newWords: string[];
  }>;
  transcriptMessage?: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  isTranscribing: boolean;
  isRecording: boolean;
  recordingMilliSeconds: number;
  recordVisualizerComponent: JSX.Element | null;

  isMuted: boolean;
  setIsMuted: (newState: boolean) => void;

  isVolumeOn: boolean;
  setIsVolumeOn: (newState: boolean) => void;

  isProcessingGoal: boolean;
  temporaryGoal: GoalPlan | null;
  confirmGoal: (isConfirm: boolean) => Promise<void>;
  goalSettingProgress: number;
  isSavingGoal: boolean;
  toggleVolume: (isVolumeOn: boolean) => void;
  isOnboarding?: boolean;
  isShowMessageProgress: boolean;
  conversationAnalysisResult: string;
  analyzeConversation: () => Promise<void>;
  messagesToComplete: number;
  generateHelpMessage: () => Promise<string>;
  isCallMode: boolean;
  toggleCallMode: (newStateIsCallMode: boolean) => void;
  isNeedToShowBalanceWarning: boolean;
}
export const ConversationCanvas2: React.FC<ConversationCanvasProps> = ({
  isCallMode,
  toggleCallMode,
  conversation,
  isAiSpeaking,
  gameWords,
  isClosed,
  isClosing,
  addUserMessage,
  togglePaymentModal,
  analyzeUserMessage,
  transcriptMessage,
  startRecording,
  stopRecording,
  cancelRecording,
  isTranscribing,
  isRecording,
  recordingMilliSeconds,
  recordVisualizerComponent,
  recordingError,
  conversationId,
  isMuted,
  setIsMuted,
  isProcessingGoal,
  temporaryGoal,
  confirmGoal,
  goalSettingProgress,
  isSavingGoal,
  toggleVolume,
  closeConversation,
  isShowMessageProgress,
  conversationAnalysisResult,
  analyzeConversation,
  messagesToComplete,
  generateHelpMessage,
  isNeedToShowBalanceWarning,

  isVolumeOn,
  setIsVolumeOn,
}) => {
  const { i18n } = useLingui();
  const sound = useSound();
  const [isShowKeyboard, setIsShowKeyboard] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const auth = useAuth();
  const userPhoto = auth.userInfo?.photoURL || "";
  const myUserName = auth.userInfo?.displayName || auth.userInfo?.email || "You";
  const closeMenus = () => setAnchorElUser(null);
  const startCallMode = () => toggleCallMode(true);
  const stopCallMode = () => toggleCallMode(false);
  const sizes = useWindowSizes();

  const isFinishingProcess = isClosing || isClosed;
  const { ref, size } = useResizeElement<HTMLDivElement>();
  const height = size.height || 0;
  const webCam = useWebCam();

  useEffect(() => {
    if (isCallMode && !webCam.isWebCamEnabled) {
      setTimeout(() => {
        webCam.init();
      }, 500);
    }
  }, [isCallMode]);

  const bottomSectionHeight = `${height + 40}px`;

  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const messageAnalyzing = useRef("");
  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] = useState(false);
  const [isNeedToShowCorrection, setIsNeedToShowCorrection] = useState(false);
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);
  const [internalUserInput, setInternalUserInput] = useState<string>("");
  const [isConfirmedUserKeyboardInput, setIsConfirmedUserKeyboardInput] = useState(false);

  const confirmedUserInput =
    transcriptMessage || (isConfirmedUserKeyboardInput ? internalUserInput : "");

  const [newWords, setNewWords] = useState<string[]>([]);

  const isAnalyzingResponse = isAnalyzingMessageWithAi || isTranscribing;

  useEffect(() => {
    if (isTranscribing) {
      setDescription(null);
      setNewWords([]);
      setCorrectedMessage(null);
    }
  }, [isTranscribing]);

  const analyzeUserInput = async (usersNewMessage: string) => {
    messageAnalyzing.current = usersNewMessage;

    setIsAnalyzingMessageWithAi(true);
    setIsNeedToShowCorrection(false);
    setDescription(null);
    setCorrectedMessage(null);
    setNewWords([]);

    try {
      const userMessage = usersNewMessage;
      const previousBotMessage = conversation.length
        ? conversation[conversation.length - 1].text
        : "";

      const { sourceMessage, correctedMessage, description, newWords } = await analyzeUserMessage({
        previousBotMessage,
        message: userMessage,
        conversationId,
      });
      setNewWords(newWords || []);
      if (usersNewMessage !== sourceMessage) {
        return;
      }

      const isBad =
        !!description &&
        !!correctedMessage?.trim() &&
        correctedMessage.toLowerCase().trim() !== sourceMessage.toLowerCase().trim();
      setIsNeedToShowCorrection(isBad);

      setCorrectedMessage(isBad ? correctedMessage || null : null);
      setDescription(isBad ? description || null : null);
      setIsAnalyzingMessageWithAi(false);

      if (!isMuted) {
        if (!isBad) {
          sound.play("win3", 0.2);
        }
      }
    } catch (error) {
      console.error("Error during analyzing message", error);
      setIsAnalyzingError(true);
      setIsAnalyzingMessageWithAi(false);
      throw error;
    }
  };

  const analyzeMessageAudioTranscript = async () => {
    if (transcriptMessage === messageAnalyzing.current || !transcriptMessage) {
      return;
    }
    await analyzeUserInput(transcriptMessage);
  };

  const analyzeUserKeyboardInput = async () => {
    if (internalUserInput === messageAnalyzing.current || !internalUserInput) {
      return;
    }
    setIsConfirmedUserKeyboardInput(true);
    await analyzeUserInput(internalUserInput);
  };

  useEffect(() => {
    if (transcriptMessage) {
      analyzeMessageAudioTranscript();
    }
  }, [transcriptMessage]);

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    const scrollToBottom = () => {
      window.scrollTo({
        top: document.body.scrollHeight + 200,
        behavior: "smooth",
      });

      const callModeMessagesElement = document.getElementById("messages-call-mode");
      if (callModeMessagesElement) {
        callModeMessagesElement.scrollTo({
          top: callModeMessagesElement.scrollHeight,
          behavior: "smooth",
        });
      }
    };
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [conversation, isAnalyzingResponse, isRecording]);

  const actualCountOfUserMessages = conversation.filter((message) => !message.isBot).length;
  const progress = Math.max(
    4,
    Math.min((actualCountOfUserMessages / messagesToComplete) * 100, 100)
  );

  const [isShowAnalyzeConversationModal, setIsShowAnalyzeConversationModal] = useUrlParam(
    "showAnalyzeConversationModal"
  );
  const [isConversationContinueAfterAnalyze, setIsConversationContinueAfterAnalyze] =
    useState(false);

  const isCompletedLesson =
    !isConversationContinueAfterAnalyze &&
    !!isShowMessageProgress &&
    actualCountOfUserMessages >= messagesToComplete;

  const showAnalyzeConversationModal = () => {
    // todo: move to useEffect
    analyzeConversation();

    setIsShowAnalyzeConversationModal(true);
  };

  const translator = useTranslate();

  const [isOpenHelpModelAnchor, setIsOpenHelpModelAnchor] = useState<HTMLElement | null>(null);
  const [helpMessage, setHelpMessage] = useState("");
  const openHelpAnswer = async (element: HTMLElement) => {
    setHelpMessage("");
    setIsOpenHelpModelAnchor(element);
    const mess = await generateHelpMessage();
    setHelpMessage(mess);
  };

  const loadingMessage = i18n._(`Loading...`);

  const modals = (
    <>
      {translator.translateModal}
      {isOpenHelpModelAnchor && (
        <Popover
          anchorEl={isOpenHelpModelAnchor}
          open={!!isOpenHelpModelAnchor}
          onClose={() => setIsOpenHelpModelAnchor(null)}
          slotProps={{
            backdrop: {
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              },
            },
          }}
        >
          <Stack
            sx={{
              gap: "0px",
              backgroundColor: "#333",
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "600px",
              padding: "10px 15px",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._("Idea for your message")}
            </Typography>

            <Stack
              className={`decor-text ${!helpMessage ? "loading-shimmer" : ""}`}
              sx={{
                flexDirection: "row",
                gap: "10px",
                minHeight: "35px",
              }}
            >
              <Markdown
                variant="conversation"
                onWordClick={
                  translator.isTranslateAvailable
                    ? (word, element) => translator.translateWithModal(word, element)
                    : undefined
                }
              >
                {!helpMessage ? loadingMessage : helpMessage}
              </Markdown>
              {helpMessage && (
                <AudioPlayIcon text={helpMessage} instructions="Calm and clear" voice={"coral"} />
              )}
            </Stack>
          </Stack>
        </Popover>
      )}
      {isShowAnalyzeConversationModal && (
        <>
          <CustomModal isOpen={true} onClose={() => setIsShowAnalyzeConversationModal(false)}>
            <Stack
              sx={{
                gap: "30px",
                width: "100dvw",
                alignItems: "center",
              }}
            >
              <Stack
                sx={{
                  maxWidth: "600px",
                  gap: "30px",
                  width: "100%",
                }}
              >
                <Stack
                  sx={{
                    gap: "10px",
                  }}
                >
                  <Typography
                    sx={{
                      paddingBottom: "20px",
                    }}
                    align="center"
                    variant="h5"
                    component={"h2"}
                  >
                    {i18n._("Lesson Review")}
                  </Typography>
                  {conversationAnalysisResult ? (
                    <Stack
                      sx={{
                        gap: "15px",
                        padding: "0 10px",
                        boxSizing: "border-box",
                      }}
                    >
                      <Markdown>{conversationAnalysisResult}</Markdown>
                    </Stack>
                  ) : (
                    <Stack
                      sx={{
                        gap: "15px",
                        padding: "0 10px",
                        boxSizing: "border-box",
                      }}
                    >
                      <Stack>
                        <Typography variant="body1">{i18n._(`Language level:`)}</Typography>
                        <Typography className="loading-shimmer">
                          {i18n._(`Analyzing...`)}
                        </Typography>
                      </Stack>

                      <Stack>
                        <Typography variant="h6">{i18n._(`What was great:`)}</Typography>
                        <Typography className="loading-shimmer">
                          {i18n._(`Analyzing...`)}
                        </Typography>
                      </Stack>

                      <Stack>
                        <Typography variant="h6">{i18n._(`Areas to improve:`)}</Typography>
                        <Typography className="loading-shimmer">
                          {i18n._(`Analyzing...`)}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>

                <Stack
                  gap="10px"
                  sx={{
                    alignItems: "center",
                    padding: "0 10px",
                    boxSizing: "border-box",
                  }}
                >
                  <Button
                    disabled={!conversationAnalysisResult}
                    onClick={() => {
                      setIsShowAnalyzeConversationModal(false);
                      setIsConversationContinueAfterAnalyze(true);
                    }}
                    variant="text"
                  >
                    {i18n._(`Continue conversation`)}
                  </Button>

                  <Button
                    sx={{
                      width: "100%",
                    }}
                    onClick={() => closeConversation()}
                    variant="contained"
                    color="info"
                    size="large"
                    disabled={!conversationAnalysisResult}
                  >
                    {i18n._(`Start new lesson`)}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </CustomModal>
        </>
      )}
    </>
  );

  const messages = (
    <>
      <Stack
        sx={{
          gap: "40px",
          paddingTop: "60px",
          width: "100%",
        }}
      >
        {conversation.map((message) => {
          const isBot = message.isBot;
          return (
            <Stack
              key={message.id}
              sx={{
                padding: "0 20px",
                boxSizing: "border-box",
                color: "#e1e1e1",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.5,
                }}
              >
                {isBot ? i18n._("Teacher:") : i18n._("You:")}
              </Typography>
              <Stack
                sx={{
                  display: "inline-block",
                }}
              >
                <Markdown
                  onWordClick={
                    translator.isTranslateAvailable
                      ? (word, element) => {
                          translator.translateWithModal(word, element);
                        }
                      : undefined
                  }
                  variant="conversation"
                >
                  {message.text || ""}
                </Markdown>

                {translator.isTranslateAvailable && (
                  <IconButton
                    onClick={(e) => translator.translateWithModal(message.text, e.currentTarget)}
                  >
                    <Languages size={"16px"} color="#eee" />
                  </IconButton>
                )}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </>
  );

  if (isCallMode && !gameWords?.wordsUserToDescribe) {
    return (
      <>
        {modals}
        <Stack
          sx={{
            alignItems: "center",
            gap: "0px",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: `calc(100dvh - 210px - ${sizes.bottomOffset})`,
              overflow: "hidden",
              padding: "10px 10px 5px 10px",
              paddingTop: "10px",
              gap: "10px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              position: "relative",
              zIndex: 10,
              "@media (max-width: 800px)": {
                height: `calc(42dvh - ${sizes.bottomOffset})`,
              },
            }}
          >
            <Stack
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              <video
                src={"/call/3.mp4"}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                autoPlay
                controls={false}
                muted
                loop
                playsInline
              />

              <Stack
                sx={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  width: "100%",
                  height: "80px",
                  background: "linear-gradient(0deg, rgba(0,0,0,0.31), rgba(0,0,0,0))",
                }}
              ></Stack>
              <Stack
                sx={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  gap: "5px",
                }}
              >
                <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
                  {i18n._("Teacher")}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              }}
            >
              <video
                ref={webCam.videoRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                  display: webCam.isWebCamEnabled ? "block" : "none",
                }}
                autoPlay
                controls={false}
                muted
                playsInline
              />

              {!webCam.isWebCamEnabled && (
                <>
                  <Stack
                    sx={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      width: "100%",
                      height: "100%",
                      background: "url('/blur/5.jpg')",
                      backgroundSize: "cover",
                      opacity: 0.57,
                    }}
                  ></Stack>

                  <Stack
                    sx={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Stack
                      sx={{
                        borderRadius: "50%",
                        overflow: "hidden",
                        padding: "0",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <Avatar
                        alt={""}
                        src={userPhoto}
                        sx={{
                          width: "110px",
                          height: "110px",
                          borderRadius: "50%",
                          fontSize: "10px",
                        }}
                      />
                    </Stack>
                  </Stack>
                </>
              )}

              <Stack
                sx={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  width: "100%",
                  height: "80px",
                  background: "linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0,0,0,0))",
                }}
              ></Stack>

              <Stack
                sx={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  gap: "1px",
                }}
              >
                <Typography variant="body2" sx={{ color: "#fff", opacity: 0.9 }}>
                  {myUserName || i18n._("You")}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            id="messages-call-mode"
            sx={{
              maxWidth: "1000px",
              maxHeight: "120px",
              overflow: "auto",
              "@media (max-width: 800px)": {
                maxHeight: `calc(40dvh - ${sizes.bottomOffset})`,
              },
            }}
          >
            {messages}
          </Stack>
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              width: "100%",
              paddingTop: "20px",
              position: "fixed",
              backgroundColor: "rgba(10, 18, 30, 0.9)",
              paddingBottom: `calc(15px + ${sizes.bottomOffset})`,
              bottom: 0,
            }}
          >
            <IconButton
              sx={{
                backgroundColor: !isMuted ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
                color: !isMuted ? "#fff" : "#222",
                ":hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              }}
              size="large"
              onClick={async () => {
                setIsMuted(!isMuted);
              }}
            >
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>

            <IconButton
              sx={{
                backgroundColor: webCam.isWebCamEnabled
                  ? "rgba(100, 100, 100, 0.4)"
                  : "rgb(250 222 220)",
                color: webCam.isWebCamEnabled ? "#fff" : "#222",
                ":hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              }}
              size="large"
              onClick={async () => {
                if (webCam.isWebCamEnabled) {
                  webCam.resetWebCam();
                } else {
                  await webCam.init();
                }
              }}
            >
              {webCam.isWebCamEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton
              size="large"
              onClick={async () => stopCallMode()}
              sx={{
                width: "70px",
                borderRadius: "30px",
                backgroundColor: "#dc362e",
                ":hover": { backgroundColor: "rgba(255, 0, 0, 0.7)" },
              }}
            >
              <CallEndIcon />
            </IconButton>
          </Stack>
        </Stack>
      </>
    );
  }

  return (
    <Stack>
      {modals}
      {isShowMessageProgress && (
        <Stack
          sx={{
            zIndex: 100,
            width: "100%",
            height: "max-content",
            padding: "0px 0px",
            boxSizing: "border-box",
            backgroundColor: "rgba(20, 28, 40, 0.9)",
            backdropFilter: "blur(10px)",

            position: "fixed",
            top: "-4px",
            "@media (max-width: 600px)": {
              top: "0px",
            },
          }}
        >
          <GradingProgressBar value={progress} />
        </Stack>
      )}
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          opacity: isFinishingProcess ? 0.2 : 1,
        }}
      >
        <Stack
          sx={{
            maxWidth: "900px",
            padding: "0",
            paddingBottom: bottomSectionHeight,
            boxSizing: "border-box",
            width: "100%",
            gap: "0px",
            alignItems: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minHeight: "calc(100dvh - 0px)",
            justifyContent: "space-between",

            "@media (max-width: 600px)": {
              border: "none",
            },
            backgroundColor: "#1c2128",
          }}
        >
          {messages}
        </Stack>

        <Stack
          ref={ref}
          sx={{
            flexDirection: "column",
            width: "100%",
            borderTop: confirmedUserInput
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.1)",

            position: "fixed",
            bottom: "0px",
            left: 0,

            "--section-bg": "#252b33",
            backgroundColor: "var(--section-bg)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {gameWords?.wordsUserToDescribe && (
            <Stack
              sx={{
                width: "100%",
                alignItems: "center",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                  maxWidth: "900px",
                  maxHeight: "40vh",
                  overflowY: "auto",
                }}
              >
                <AliasGamePanel gameWords={gameWords} conversation={conversation} />
              </Stack>
            </Stack>
          )}

          <Stack
            sx={{
              width: "100%",
              boxSizing: "border-box",
              maxWidth: "900px",
              padding: "20px 20px",
              borderTop: "none",
              borderBottom: "none",
              "@media (max-width: 600px)": {
                border: "none",
              },
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {(recordingError || isAnalyzingError) && (
              <Stack>
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{
                    width: "100%",
                    maxWidth: "900px",
                    backgroundColor: "#c4574f",
                    color: "#fff",
                    boxSizing: "border-box",
                  }}
                >
                  {recordingError || i18n._("Error during analyzing message")}
                </Alert>
              </Stack>
            )}

            {(confirmedUserInput || isTranscribing || isAnalyzingResponse) && (
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Stack
                  sx={{
                    alignItems: "flex-start",
                    gap: "15px",
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <Stack
                      sx={{
                        height: "40px",
                        width: "40px",
                        borderRadius: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isAnalyzingResponse
                          ? "rgba(255, 255, 255, 0.06)"
                          : isNeedToShowCorrection
                          ? "#c29f2b"
                          : "linear-gradient(45deg, #63b187 0%, #7bd5a1 100%)",
                      }}
                    >
                      {isNeedToShowCorrection && !isAnalyzingResponse ? (
                        <ShieldAlert color="#fff" size={"20px"} />
                      ) : (
                        <>
                          {isAnalyzingResponse ? (
                            <Loader color="#fff" size={"20px"} />
                          ) : (
                            <Check color="#fff" size={"20px"} />
                          )}
                        </>
                      )}
                    </Stack>

                    {isNeedToShowCorrection && !isAnalyzingResponse ? (
                      <Typography variant="h6">{i18n._("Almost correct")}</Typography>
                    ) : (
                      <>
                        {isAnalyzingResponse ? (
                          <Typography
                            className="loading-shimmer"
                            sx={{
                              color: "#fff",
                              display: "inline",
                            }}
                            variant="h6"
                          >
                            {i18n._("Analyzing...")}
                          </Typography>
                        ) : (
                          <Typography variant="h6">{i18n._("Great!")}</Typography>
                        )}
                      </>
                    )}
                  </Stack>
                  {isNeedToShowCorrection && (
                    <Stack>{description && <Typography>{description}</Typography>}</Stack>
                  )}

                  <Stack
                    sx={{
                      gap: "10px",
                      paddingBottom: "10px",
                    }}
                  >
                    <Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          fontWeight: 350,
                        }}
                      >
                        {i18n._("Your Message")}
                      </Typography>
                      <Stack
                        sx={{
                          width: "100%",
                          gap: "12px",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          component={"div"}
                          className={isTranscribing ? "loading-shimmer" : ""}
                          sx={{
                            fontWeight: 400,
                            fontSize: "1.1rem",
                            paddingBottom: "3px",
                            opacity: isTranscribing ? 0.7 : 1,
                          }}
                        >
                          <StringDiff
                            oldValue={
                              isTranscribing ? i18n._("Transcribing...") : confirmedUserInput || ""
                            }
                            newValue={
                              isTranscribing ? i18n._("Transcribing...") : confirmedUserInput || ""
                            }
                          />
                        </Typography>
                        <Stack
                          sx={{
                            opacity:
                              isTranscribing || isAnalyzingResponse
                                ? 0
                                : isNeedToShowCorrection
                                ? 0
                                : 1,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          {!isTranscribing && !isAnalyzingResponse && !!correctedMessage && (
                            <>
                              <AudioPlayIcon
                                text={correctedMessage}
                                instructions="Calm and clear"
                                voice={"coral"}
                              />
                              <IconButton
                                onClick={(e) =>
                                  translator.translateWithModal(correctedMessage, e.currentTarget)
                                }
                              >
                                <Languages size={"16px"} style={{ opacity: 0.8 }} />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>

                    {(isNeedToShowCorrection || isAnalyzingResponse) && (
                      <Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            fontWeight: 350,
                          }}
                        >
                          {i18n._("Corrected")}
                        </Typography>

                        <Stack
                          sx={{
                            width: "100%",
                            gap: "12px",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            component={"div"}
                            className={
                              isTranscribing || isAnalyzingResponse ? "loading-shimmer" : ""
                            }
                            sx={{
                              fontWeight: 400,
                              fontSize: "1.1rem",
                              paddingBottom: "3px",
                              opacity: isTranscribing || isAnalyzingResponse ? 0.7 : 1,
                            }}
                          >
                            <StringDiff
                              styles={{
                                added: {
                                  color: "#81e381",
                                  fontWeight: 600,
                                },
                                removed: {
                                  display: "none",
                                  textDecoration: "line-through",
                                  opacity: 0.4,
                                },
                                default: {},
                              }}
                              oldValue={
                                isTranscribing
                                  ? i18n._("Transcribing...")
                                  : isAnalyzingResponse
                                  ? i18n._("Analyzing...")
                                  : confirmedUserInput || ""
                              }
                              newValue={
                                isTranscribing
                                  ? i18n._("Transcribing...")
                                  : isAnalyzingResponse
                                  ? i18n._("Analyzing...")
                                  : correctedMessage || confirmedUserInput || ""
                              }
                            />
                          </Typography>

                          <Stack
                            sx={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "2px",
                            }}
                          >
                            {!isTranscribing && !isAnalyzingResponse && !!correctedMessage && (
                              <>
                                <AudioPlayIcon
                                  text={correctedMessage}
                                  instructions="Calm and clear"
                                  voice={"coral"}
                                />
                                <IconButton
                                  onClick={(e) =>
                                    translator.translateWithModal(correctedMessage, e.currentTarget)
                                  }
                                >
                                  <Languages size={"16px"} style={{ opacity: 0.8 }} />
                                </IconButton>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    )}

                    {!!newWords.length && (
                      <Tooltip title={newWords.join(", ")} placement="top" arrow>
                        <Stack
                          sx={{
                            width: "max-content",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#b6d5f3",
                            }}
                          >
                            {i18n._(`New Words to Vocabulary:`)} +{newWords.length}
                          </Typography>
                        </Stack>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            )}

            {!isFinishingProcess && (
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  "@media (max-width: 600px)": {
                    alignItems: "flex-end",
                    gap: "10px",
                  },
                }}
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: "15px",
                    "@media (max-width: 600px)": {
                      flexDirection: "column-reverse",
                      alignItems: "flex-start",
                    },
                  }}
                >
                  {isAnalyzingResponse && (
                    <Button
                      startIcon={<Loader />}
                      size="large"
                      variant="contained"
                      sx={{
                        minWidth: "200px",
                      }}
                      disabled
                    >
                      {i18n._("Analyzing")}
                    </Button>
                  )}

                  {isProcessingGoal && !temporaryGoal && (
                    <Stack>
                      <Typography className="loading-shimmer">
                        {i18n._(`Preparing Goal`)}
                      </Typography>
                    </Stack>
                  )}

                  {isProcessingGoal && temporaryGoal && (
                    <Stack
                      sx={{
                        flexDirection: "column",
                        width: "100%",
                        gap: "20px",
                      }}
                    >
                      <Stack
                        sx={{
                          gap: "10px",
                          alignItems: "flex-start",
                        }}
                      >
                        <Stack>
                          <Typography variant="caption">{i18n._(`Goal is created`)}:</Typography>
                          <Typography variant="h5" className="decor-text">
                            {temporaryGoal.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#b6d5f3",
                            }}
                          >
                            {i18n._(`Lessons added:`)} {temporaryGoal.elements.length}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack
                        sx={{
                          width: "100%",
                          gap: "10px",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          onClick={() => !isSavingGoal && confirmGoal(true)}
                          color={isSavingGoal ? "primary" : "info"}
                          size="large"
                          variant="contained"
                          startIcon={isSavingGoal ? <Loader /> : <Check />}
                        >
                          {i18n._("Open plan")}
                        </Button>
                        <IconButton onClick={() => confirmGoal(false)}>
                          <Trash2 size={"14px"} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  )}

                  {confirmedUserInput && !isRecording && !isAnalyzingResponse && (
                    <Button
                      startIcon={<ArrowUp />}
                      size="large"
                      variant={"contained"}
                      sx={{
                        minWidth: "200px",
                      }}
                      onClick={async () => {
                        addUserMessage(confirmedUserInput);
                        setIsConfirmedUserKeyboardInput(false);
                        setInternalUserInput("");
                      }}
                    >
                      {i18n._("Send")}
                    </Button>
                  )}

                  {transcriptMessage &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    isNeedToShowCorrection && (
                      <Button
                        size="large"
                        variant="outlined"
                        startIcon={<Mic />}
                        onClick={async () => await startRecording()}
                        sx={{
                          minWidth: "200px",
                        }}
                      >
                        {i18n._("Re-record")}
                      </Button>
                    )}

                  {isRecording && !isAnalyzingResponse && (
                    <Button
                      startIcon={<Check />}
                      size="large"
                      variant="contained"
                      sx={{
                        minWidth: "200px",
                      }}
                      onClick={async () => stopRecording()}
                    >
                      {i18n._("Done")}
                    </Button>
                  )}

                  {isCallMode && !isCompletedLesson && (
                    <Stack
                      sx={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                        gap: "10px",
                      }}
                    >
                      <Button
                        startIcon={<Phone />}
                        variant="outlined"
                        size="large"
                        onClick={async () => stopCallMode()}
                      >
                        {i18n._("Stop")}
                      </Button>
                      <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                        <CircleEllipsis />
                      </IconButton>
                    </Stack>
                  )}

                  {!transcriptMessage &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    !isCallMode &&
                    !isProcessingGoal &&
                    !isCompletedLesson &&
                    !isShowKeyboard && (
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          gap: "10px",
                        }}
                      >
                        <Button
                          startIcon={<Mic />}
                          size="large"
                          variant="contained"
                          sx={{
                            minWidth: "200px",
                          }}
                          onClick={async () => startRecording()}
                        >
                          {i18n._("Record Message")}
                        </Button>

                        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                          <CircleEllipsis />
                        </IconButton>
                      </Stack>
                    )}

                  <Menu
                    sx={{
                      marginBottom: "130px",
                    }}
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    keepMounted
                    open={Boolean(anchorElUser)}
                    onClose={() => setAnchorElUser(null)}
                  >
                    <MenuItem
                      sx={{}}
                      disabled={isFinishingProcess}
                      onClick={() => {
                        closeConversation();
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <LogOut />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Finish conversation")}</Typography>
                      </ListItemText>
                    </MenuItem>

                    <Divider />

                    <MenuItem
                      sx={{}}
                      disabled={isFinishingProcess}
                      onClick={() => {
                        setIsVolumeOn(!isVolumeOn);
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>{!isVolumeOn ? <Volume2 /> : <VolumeX />}</ListItemIcon>
                      <ListItemText>
                        <Typography>
                          {isVolumeOn ? i18n._("Turn Volume Off") : i18n._("Turn Volume On")}
                        </Typography>
                      </ListItemText>
                    </MenuItem>

                    <Divider />

                    <MenuItem
                      disabled={
                        isRecording || isAnalyzingResponse || (!isCallMode && !isShowKeyboard)
                      }
                      onClick={() => {
                        setIsShowKeyboard(false);
                        stopCallMode();
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <Mic />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Voice record mode")}</Typography>
                      </ListItemText>

                      {!isCallMode && !isShowKeyboard && (
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                      )}
                    </MenuItem>

                    <MenuItem
                      sx={{}}
                      disabled={isRecording || isAnalyzingResponse || isShowKeyboard}
                      onClick={() => {
                        setIsShowKeyboard(!isShowKeyboard);
                        stopCallMode();
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <Keyboard />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Keyboard mode")}</Typography>
                      </ListItemText>

                      {isShowKeyboard && (
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                      )}
                    </MenuItem>

                    <MenuItem
                      sx={{}}
                      disabled={isRecording || isAnalyzingResponse || isCallMode}
                      onClick={() => {
                        startCallMode();
                        setIsShowKeyboard(false);
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Phone call mode")}</Typography>
                      </ListItemText>

                      {isCallMode && (
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                      )}
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      sx={{}}
                      disabled={isRecording || isAnalyzingResponse || isNeedToShowBalanceWarning}
                      onClick={(e) => {
                        openHelpAnswer(e.currentTarget);
                        closeMenus();
                      }}
                    >
                      <ListItemIcon>
                        <Lightbulb />
                      </ListItemIcon>
                      <ListItemText>
                        <Typography>{i18n._("Help with answer")}</Typography>
                      </ListItemText>
                    </MenuItem>
                  </Menu>

                  {!confirmedUserInput &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    !isProcessingGoal &&
                    !isCompletedLesson &&
                    isShowKeyboard && (
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: "100%",
                          gap: "5px",
                        }}
                      >
                        <TextField
                          autoFocus
                          value={internalUserInput}
                          onChange={(e) => setInternalUserInput(e.target.value)}
                          placeholder={i18n._("Your message...")}
                          multiline
                          minRows={1}
                          onKeyDown={(e) => {
                            const isEnter = e.key === "Enter" && !e.shiftKey;
                            if (isEnter) {
                              e.preventDefault();
                              analyzeUserKeyboardInput();
                            }
                          }}
                          sx={{
                            width: "100%",
                            minHeight: "40px",
                            maxWidth: "500px",
                          }}
                          slotProps={{
                            input: {
                              sx: {
                                height: "100%",
                                padding: "4px 0 3px 0",
                              },
                              inputProps: {
                                style: {
                                  padding: "2px 8px",
                                },
                              },
                            },
                          }}
                        />
                        <IconButton
                          onClick={() => analyzeUserKeyboardInput()}
                          disabled={!internalUserInput}
                        >
                          <Send size={"20px"} />
                        </IconButton>

                        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                          <CircleEllipsis />
                        </IconButton>
                      </Stack>
                    )}

                  {isCompletedLesson && (
                    <Stack
                      sx={{
                        alignItems: "flex-start",
                        gap: "5px",
                        opacity: isAiSpeaking ? 0.7 : 1,
                      }}
                    >
                      <Typography>
                        {isAiSpeaking ? i18n._("Loading...") : i18n._("Mission complete")}
                      </Typography>
                      <Button
                        startIcon={<Trophy />}
                        size="large"
                        disabled={isAiSpeaking}
                        variant="contained"
                        sx={{
                          minWidth: "200px",
                        }}
                        onClick={async () => showAnalyzeConversationModal()}
                      >
                        {i18n._("Open results")}
                      </Button>
                    </Stack>
                  )}

                  {!!goalSettingProgress &&
                    !transcriptMessage &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    !isProcessingGoal && (
                      <Stack>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {i18n._("Goal")}: {goalSettingProgress}%
                        </Typography>
                      </Stack>
                    )}

                  {transcriptMessage &&
                    !isRecording &&
                    !isAnalyzingResponse &&
                    !isNeedToShowCorrection && (
                      <Button
                        size="large"
                        startIcon={<Mic />}
                        onClick={async () => await startRecording()}
                      >
                        {i18n._("Re-record")}
                      </Button>
                    )}

                  {confirmedUserInput &&
                    !isRecording &&
                    !transcriptMessage &&
                    isNeedToShowCorrection && (
                      <Button
                        size="large"
                        startIcon={<Keyboard />}
                        onClick={async () => {
                          setIsConfirmedUserKeyboardInput(false);
                          messageAnalyzing.current = "";
                        }}
                      >
                        {i18n._("Re-write")}
                      </Button>
                    )}

                  {isRecording && (
                    <Stack
                      sx={{
                        width: "max-content",
                        overflow: "hidden",
                        height: "40px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "0 10px 10px 0",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "relative",
                        flexDirection: "row",
                        gap: "10px",
                        padding: "0 10px 0 0px",
                        left: "-16px",
                        zIndex: 0,
                        "@media (max-width: 600px)": {
                          left: 0,
                          borderRadius: "10px",
                        },
                      }}
                    >
                      {recordVisualizerComponent}
                      <Stack
                        sx={{
                          position: "absolute",
                          width: "calc(100% - 45px)",
                          height: "120%",
                          top: "-10%",
                          left: 0,
                          boxShadow: "inset 0 0 10px 10px var(--section-bg, rgba(20, 28, 40, 1))",
                        }}
                      ></Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          width: "30px",
                        }}
                      >
                        {dayjs(recordingMilliSeconds).format("mm:ss")}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                {(isRecording || isAnalyzingResponse || isNeedToShowBalanceWarning) && (
                  <Stack
                    sx={{
                      width: "100%",
                      alignItems: "flex-end",
                      "@media (max-width: 600px)": {
                        alignItems: "flex-start",
                      },
                    }}
                  >
                    {isRecording || isAnalyzingResponse ? (
                      <Tooltip title={i18n._("Cancel recording")}>
                        <Stack>
                          <IconButton
                            sx={{}}
                            size="large"
                            color="error"
                            onClick={() => cancelRecording()}
                          >
                            <Trash2 size={"18px"} />
                          </IconButton>
                        </Stack>
                      </Tooltip>
                    ) : (
                      <>
                        {isNeedToShowBalanceWarning && (
                          <Stack
                            sx={{
                              alignItems: "flex-end",
                              boxSizing: "border-box",
                              gap: "5px",
                              width: "100%",
                            }}
                          >
                            <Button
                              color={"warning"}
                              startIcon={<AddCardIcon />}
                              onClick={() => togglePaymentModal(true)}
                              variant="contained"
                            >
                              {i18n._("Subscribe")}
                            </Button>
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
      <TalkingWaves inActive={isAiSpeaking} />
    </Stack>
  );
};
