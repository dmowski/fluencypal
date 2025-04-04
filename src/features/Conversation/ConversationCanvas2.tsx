"use client";

import { Markdown } from "../uiKit/Markdown/Markdown";
import { JSX, useEffect, useRef, useState } from "react";
import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  ArrowUp,
  BadgeAlert,
  BadgeCheck,
  Check,
  FlaskConical,
  Loader,
  Mic,
  SendHorizontal,
  Settings,
  Trash2,
  Wand,
  X,
} from "lucide-react";

import { UserInputMessage } from "./UserInputMessage";
import AddCardIcon from "@mui/icons-material/AddCard";
import { TextAiRequest, useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";
import { AliasGamePanel } from "./AliasGamePanel";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";
import dayjs from "dayjs";
import { StringDiff } from "react-string-diff";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { useLingui } from "@lingui/react";

const loadingHelpMessage = `Generating help message...`;

interface ConversationCanvasProps {
  conversation: ChatMessage[];
  isAiSpeaking: boolean;
  gameWords: GuessGameStat | null;
  isShowUserInput: boolean;
  setIsShowUserInput: (isShowUserInput: boolean) => void;
  isMuted: boolean;
  isVolumeOn: boolean;
  toggleVolume: (isVolumeOn: boolean) => void;
  isClosed: boolean;
  isClosing: boolean;
  isSavingHomework: boolean;
  isUserSpeaking: boolean;
  toggleMute: (isMuted: boolean) => void;
  closeConversation: () => Promise<void>;
  addUserMessage: (message: string) => Promise<void>;
  fullLanguageName: string;
  generateText: (conversationDate: TextAiRequest) => Promise<string>;
  balanceHours: number;
  togglePaymentModal: (isOpen: boolean) => void;
  analyzeUserMessage: ({
    previousBotMessage,
    message,
  }: {
    previousBotMessage: string;
    message: string;
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
}
export const ConversationCanvas2: React.FC<ConversationCanvasProps> = ({
  conversation,
  isAiSpeaking,
  gameWords,
  isShowUserInput,
  setIsShowUserInput,
  isMuted,
  isVolumeOn,
  toggleVolume,
  isClosed,
  isClosing,
  isSavingHomework,
  isUserSpeaking,
  toggleMute,
  closeConversation,
  addUserMessage,
  fullLanguageName,
  generateText,
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
}) => {
  const { i18n } = useLingui();

  const isSmallBalance = balanceHours < 0.1;
  const isExtremelySmallBalance = balanceHours < 0.05;

  const isNeedToShowBalanceWarning =
    (isSmallBalance && conversation.length > 1) || isExtremelySmallBalance;

  const isFinishingProcess = isClosing || isSavingHomework || isClosed;

  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const messageAnalyzing = useRef("");
  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] = useState(false);

  const [isNeedToShowCorrection, setIsNeedToShowCorrection] = useState(false);
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);

  const [newWords, setNewWords] = useState<string[]>([]);

  const isAnalyzingResponse = isAnalyzingMessageWithAi || isTranscribing;

  const analyzeMessage = async () => {
    if (transcriptMessage === messageAnalyzing.current || !transcriptMessage) {
      return;
    }

    messageAnalyzing.current = transcriptMessage;

    setIsAnalyzingMessageWithAi(true);
    setIsNeedToShowCorrection(false);
    setDescription(null);
    setCorrectedMessage(null);
    setNewWords([]);
    try {
      const userMessage = transcriptMessage;
      const previousBotMessage = conversation[conversation.length - 1].text;
      const { sourceMessage, correctedMessage, description, newWords } = await analyzeUserMessage({
        previousBotMessage,
        message: userMessage,
      });
      setNewWords(newWords || []);
      if (transcriptMessage !== sourceMessage) {
        return;
      }

      const isBad =
        !!description &&
        !!correctedMessage?.trim() &&
        correctedMessage.toLowerCase().trim() !== sourceMessage.toLowerCase().trim();
      setIsNeedToShowCorrection(isBad);

      setCorrectedMessage(correctedMessage || null);
      setDescription(description || null);
      setIsAnalyzingMessageWithAi(false);
    } catch (error) {
      setIsAnalyzingError(true);
      setIsAnalyzingMessageWithAi(false);
      throw error;
    }
  };

  const isLowBalance = balanceHours < 0.01;

  useEffect(() => {
    if (isLowBalance) {
      return;
    }

    if (transcriptMessage) {
      analyzeMessage();
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
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [conversation, isAnalyzingResponse, isRecording]);

  return (
    <Stack sx={{ gap: "40px" }}>
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
            borderRadius: "10px 10px 0 0",
            paddingBottom: "0px",
            boxSizing: "border-box",
            width: "100%",
            gap: "0px",
            alignItems: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minHeight: "calc(100dvh - 100px)",
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
                  <Markdown size="conversation">{message.text || ""}</Markdown>
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
              borderTop: transcriptMessage
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(255, 255, 255, 0.1)",

              position: "sticky",
              bottom: "-2px",
              left: 0,

              "--section-bg": "#252b33",
              backgroundColor: "var(--section-bg)",
              alignItems: "center",
              justifyContent: "center",
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
              {(transcriptMessage || isTranscribing || isAnalyzingResponse) && (
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
                            ? "#121214"
                            : isNeedToShowCorrection
                              ? "#c4574f"
                              : "linear-gradient(45deg, #63b187 0%, #7bd5a1 100%)",
                        }}
                      >
                        {isNeedToShowCorrection ? (
                          <X color="#fff" size={"20px"} />
                        ) : (
                          <>
                            {isAnalyzingResponse ? (
                              <>
                                <Loader color="#fff" size={"20px"} />
                              </>
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
                            <Typography variant="h6">{i18n._("Analyzing...")}</Typography>
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
                            sx={{
                              fontWeight: 400,
                              fontSize: "1.1rem",
                              paddingBottom: "3px",
                              opacity: isTranscribing ? 0.7 : 1,
                            }}
                          >
                            <StringDiff
                              oldValue={
                                isTranscribing ? i18n._("Transcribing...") : transcriptMessage || ""
                              }
                              newValue={
                                isTranscribing ? i18n._("Transcribing...") : transcriptMessage || ""
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
                            }}
                          >
                            {isTranscribing || isAnalyzingResponse ? (
                              <Loader color="#c2c2c2" size={"12px"} />
                            ) : (
                              <>
                                {correctedMessage && (
                                  <AudioPlayIcon
                                    text={correctedMessage}
                                    instructions="Calm and clear"
                                    voice={"coral"}
                                  />
                                )}
                              </>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>

                      {isNeedToShowCorrection && (
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
                                      : transcriptMessage || ""
                                }
                                newValue={
                                  isTranscribing
                                    ? i18n._("Transcribing...")
                                    : isAnalyzingResponse
                                      ? i18n._("Analyzing...")
                                      : correctedMessage || transcriptMessage || ""
                                }
                              />
                            </Typography>

                            <Stack>
                              {isTranscribing || isAnalyzingResponse ? (
                                <Loader color="#c2c2c2" size={"12px"} />
                              ) : (
                                <>
                                  {correctedMessage && (
                                    <AudioPlayIcon
                                      text={correctedMessage}
                                      instructions="Calm and clear"
                                      voice={"coral"}
                                    />
                                  )}
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
                              {i18n._(`New Words to Vocabulary:`)} {i18n._(`+${newWords.length}`)}
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
                        startIcon={<ArrowUp />}
                        size="large"
                        variant="contained"
                        sx={{
                          minWidth: "200px",
                          position: "relative",
                          zIndex: 1,
                        }}
                        disabled
                      >
                        {i18n._("Analyzing")}
                      </Button>
                    )}

                    {transcriptMessage && !isRecording && !isAnalyzingResponse && (
                      <Button
                        startIcon={<ArrowUp />}
                        size="large"
                        variant="contained"
                        sx={{
                          minWidth: "200px",
                          position: "relative",
                          zIndex: 1,
                        }}
                        onClick={async () => addUserMessage(transcriptMessage)}
                      >
                        {i18n._("Send")}
                      </Button>
                    )}

                    {isRecording && !isAnalyzingResponse && (
                      <Button
                        startIcon={<Check />}
                        size="large"
                        variant="contained"
                        sx={{
                          minWidth: "200px",
                          position: "relative",
                          zIndex: 1,
                        }}
                        onClick={async () => stopRecording()}
                      >
                        {i18n._("Done")}
                      </Button>
                    )}

                    {!transcriptMessage && !isRecording && !isAnalyzingResponse && (
                      <Button
                        startIcon={<Mic />}
                        size="large"
                        variant="contained"
                        sx={{
                          minWidth: "200px",
                          position: "relative",
                          zIndex: 1,
                        }}
                        onClick={async () => startRecording()}
                      >
                        {i18n._("Record Message")}
                      </Button>
                    )}

                    {transcriptMessage && !isRecording && (
                      <Button
                        size="large"
                        startIcon={<Mic />}
                        onClick={async () => await startRecording()}
                      >
                        {i18n._("Re-record")}
                      </Button>
                    )}

                    {isRecording && (
                      <>
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
                            left: "-20px",
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
                              boxShadow:
                                "inset 0 0 10px 10px var(--section-bg, rgba(20, 28, 40, 1))",
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
                      </>
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
                        <Tooltip title="Cancel">
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
