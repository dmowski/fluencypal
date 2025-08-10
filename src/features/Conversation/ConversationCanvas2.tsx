"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { JSX, useEffect, useRef, useState } from "react";
import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import { Alert, Button, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import {
  ArrowUp,
  Check,
  Keyboard,
  Languages,
  Lightbulb,
  Loader,
  Mic,
  Phone,
  Send,
  ShieldAlert,
  Trash2,
  Trophy,
} from "lucide-react";

import AddCardIcon from "@mui/icons-material/AddCard";

import { AliasGamePanel } from "./AliasGamePanel";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
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
import { useGame } from "../Game/useGame";
import { useTranslate } from "../Translation/useTranslate";

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
  isMuted?: boolean;
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
}
export const ConversationCanvas2: React.FC<ConversationCanvasProps> = ({
  isOnboarding,
  isCallMode,
  toggleCallMode,
  conversation,
  isAiSpeaking,
  gameWords,
  isClosed,
  isClosing,
  addUserMessage,
  balanceHours,
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
}) => {
  const { i18n } = useLingui();

  const sound = useSound();
  const [isShowKeyboard, setIsShowKeyboard] = useState(false);

  const game = useGame();

  const startCallMode = () => {
    toggleCallMode(true);
  };

  const stopCallMode = () => {
    toggleCallMode(false);
  };

  const isSmallBalance = balanceHours < 0.1 && !game.isGameWinner;
  const isExtremelySmallBalance = balanceHours < 0.05 && !game.isGameWinner;

  const isNeedToShowBalanceWarning =
    (isSmallBalance && conversation.length > 1) || isExtremelySmallBalance;

  const isFinishingProcess = isClosing || isClosed;

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

  const isLowBalance = balanceHours < 0.01 && !game.isGameWinner;

  useEffect(() => {
    if (isLowBalance) {
      return;
    }

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

  const [isShowAnalyzeConversationModal, setIsShowAnalyzeConversationModal] = useState(false);
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

  const [isOpenHelpModel, setIsOpenHelpModel] = useState(false);
  const [helpMessage, setHelpMessage] = useState("");
  const openHelpAnswer = async () => {
    setHelpMessage("");
    setIsOpenHelpModel(true);
    const mess = await generateHelpMessage();
    setHelpMessage(mess);
  };

  return (
    <Stack sx={{ gap: "40px" }}>
      {translator.translateModal}

      {isOpenHelpModel && (
        <CustomModal isOpen={true} onClose={() => setIsOpenHelpModel(false)} padding="40px 20px">
          <Typography variant="caption">{i18n._("Idea for your message")}</Typography>
          <Stack
            sx={{
              gap: "10px",
              width: "100%",
            }}
          >
            <Stack className={`decor-text ${!helpMessage ? "loading-shimmer" : ""}`}>
              <Markdown
                variant="conversation"
                onWordClick={
                  translator.isTranslateAvailable
                    ? (word) => translator.translateWithModal(word)
                    : undefined
                }
              >
                {!helpMessage ? i18n._("Loading...") : helpMessage}
              </Markdown>
            </Stack>

            <Button
              variant="outlined"
              onClick={() => setIsOpenHelpModel(false)}
              sx={{ marginTop: "20px" }}
            >
              {i18n._("Close")}
            </Button>
          </Stack>
        </CustomModal>
      )}
      {isShowAnalyzeConversationModal && (
        <>
          <CustomModal
            isOpen={true}
            onClose={() => setIsShowAnalyzeConversationModal(false)}
            padding="40px 20px"
          >
            <Stack
              sx={{
                gap: "30px",
                width: "100%",
              }}
            >
              <Stack
                sx={{
                  gap: "10px",
                }}
              >
                <Typography sx={{}}>{i18n._("Review")}</Typography>
                {conversationAnalysisResult ? (
                  <Stack
                    sx={{
                      gap: "15px",
                    }}
                  >
                    <Markdown>{conversationAnalysisResult}</Markdown>
                  </Stack>
                ) : (
                  <Stack
                    sx={{
                      gap: "15px",
                    }}
                  >
                    <Stack>
                      <Typography variant="h6">{i18n._(`Language level:`)}</Typography>
                      <Typography className="loading-shimmer">{i18n._(`Analyzing...`)}</Typography>
                    </Stack>

                    <Stack>
                      <Typography variant="h6">{i18n._(`What was great:`)}</Typography>
                      <Typography className="loading-shimmer">{i18n._(`Analyzing...`)}</Typography>
                    </Stack>

                    <Stack>
                      <Typography variant="h6">{i18n._(`Areas to improve:`)}</Typography>
                      <Typography className="loading-shimmer">{i18n._(`Analyzing...`)}</Typography>
                    </Stack>
                  </Stack>
                )}
              </Stack>

              <Stack gap="10px">
                <Button
                  sx={{}}
                  onClick={() => {
                    closeConversation();
                    setIsShowAnalyzeConversationModal(false);
                  }}
                  variant="contained"
                  color="info"
                  size="large"
                  disabled={!conversationAnalysisResult}
                >
                  {i18n._(`Start new lesson`)}
                </Button>
                <Button
                  disabled={!conversationAnalysisResult}
                  onClick={() => {
                    setIsShowAnalyzeConversationModal(false);
                    setIsConversationContinueAfterAnalyze(true);
                  }}
                  variant="outlined"
                >
                  {i18n._(`Continue conversation`)}
                </Button>
              </Stack>
            </Stack>
          </CustomModal>
        </>
      )}
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
          height: "100%",

          alignItems: "center",
          justifyContent: "center",
          paddingTop: "95px",
        }}
      >
        <Stack
          sx={{
            maxWidth: "900px",
            padding: "0",
            paddingTop: "25px",
            borderRadius: "10px",
            paddingBottom: "0px",
            boxSizing: "border-box",
            width: "100%",
            gap: "0px",
            alignItems: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minHeight: "calc(100dvh - 110px)",
            justifyContent: "space-between",

            "@media (max-width: 600px)": {
              border: "none",
            },
            //backgroundColor: "rgba(37, 54, 66, 0.1)",
            //backgroundColor: "rgba(20, 28, 40, 1)",
            backgroundColor: "#1c2128",
          }}
        >
          <Stack
            sx={{
              gap: "40px",
              paddingBottom: gameWords?.wordsUserToDescribe ? "0" : "40px",
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
                          ? (word) => {
                              translator.translateWithModal(word);
                            }
                          : undefined
                      }
                      variant="conversation"
                    >
                      {message.text || ""}
                    </Markdown>

                    {translator.isTranslateAvailable && (
                      <IconButton onClick={() => translator.translateWithModal(message.text)}>
                        <Languages size={"16px"} color="#eee" />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              );
            })}

            {gameWords?.wordsUserToDescribe && (
              <Stack
                sx={{
                  width: "100%",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "10px",
                  boxSizing: "border-box",
                }}
              >
                <Stack
                  sx={{
                    width: "100%",
                    maxWidth: "898px",
                    //borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    maxHeight: "40vh",
                    overflowY: "auto",
                  }}
                >
                  <AliasGamePanel gameWords={gameWords} conversation={conversation} />
                </Stack>
              </Stack>
            )}
          </Stack>

          <Stack
            sx={{
              flexDirection: "row",
              width: "100%",
              borderTop: confirmedUserInput
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(255, 255, 255, 0.1)",

              position: "sticky",
              bottom: "0px",
              left: 0,

              "--section-bg": "#252b33",
              backgroundColor: "var(--section-bg)",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0 0 10px 10px",
            }}
          >
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
                                isTranscribing
                                  ? i18n._("Transcribing...")
                                  : confirmedUserInput || ""
                              }
                              newValue={
                                isTranscribing
                                  ? i18n._("Transcribing...")
                                  : confirmedUserInput || ""
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
                                  onClick={() => translator.translateWithModal(correctedMessage)}
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
                                    onClick={() => translator.translateWithModal(correctedMessage)}
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
                      <Button
                        startIcon={<Phone />}
                        variant="outlined"
                        size="large"
                        onClick={async () => stopCallMode()}
                      >
                        {i18n._("Stop")}
                      </Button>
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
                          <IconButton onClick={() => setIsShowKeyboard(!isShowKeyboard)}>
                            <Keyboard size={"20px"} />
                          </IconButton>

                          <IconButton
                            onClick={() => {
                              startCallMode();
                            }}
                          >
                            <Phone size={"20px"} />
                          </IconButton>
                        </Stack>
                      )}

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

                          <IconButton
                            onClick={() => {
                              setIsShowKeyboard(false);
                            }}
                          >
                            <Mic size={"20px"} />
                          </IconButton>
                        </Stack>
                      )}

                    {isCompletedLesson && (
                      <Stack
                        sx={{
                          alignItems: "flex-start",
                          gap: "5px",
                        }}
                      >
                        <Typography>{i18n._("Mission complete")}</Typography>
                        <Button
                          startIcon={<Trophy />}
                          size="large"
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

                  {!isRecording && !isAnalyzingResponse && !isNeedToShowBalanceWarning && (
                    <Stack
                      sx={{
                        width: "max-content",
                        alignItems: "flex-end",
                        "@media (max-width: 600px)": {
                          alignItems: "flex-start",
                        },
                      }}
                    >
                      <Tooltip title={i18n._("Help with answer")}>
                        <Stack>
                          <IconButton sx={{}} size="large" onClick={() => openHelpAnswer()}>
                            <Lightbulb size={"20px"} />
                          </IconButton>
                        </Stack>
                      </Tooltip>
                    </Stack>
                  )}

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
                              <Typography
                                variant="caption"
                                color={
                                  isExtremelySmallBalance
                                    ? "error"
                                    : isSmallBalance
                                      ? "warning"
                                      : "primary"
                                }
                                align="right"
                              >
                                {i18n._("You have a low balance")} |{" "}
                                {`${convertHoursToHumanFormat(balanceHours)}`} <br />
                                {i18n._("It makes sense to top up your balance.")}
                              </Typography>
                              <Button
                                startIcon={<AddCardIcon />}
                                onClick={() => togglePaymentModal(true)}
                                variant="contained"
                              >
                                {i18n._("Top up")}
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
      </Stack>
      <TalkingWaves inActive={isAiSpeaking} />
    </Stack>
  );
};
