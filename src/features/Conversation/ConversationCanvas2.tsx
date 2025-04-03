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
  finishLesson: () => Promise<void>;
  doneConversation: () => Promise<void>;
  addUserMessage: (message: string) => Promise<void>;
  fullLanguageName: string;
  generateText: (conversationDate: TextAiRequest) => Promise<string>;
  balanceHours: number;
  togglePaymentModal: (isOpen: boolean) => void;
  analyzeUserMessage: (message: string) => Promise<{
    sourceMessage: string;
    correctedMessage: string;
    description: string;
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
  finishLesson,
  doneConversation,
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
  const [userMessage, setUserMessage] = useState("");
  const [helpMessage, setHelpMessage] = useState("");

  const isSmallBalance = balanceHours < 0.1;
  const isExtremelySmallBalance = balanceHours < 0.05;

  const isNeedToShowBalanceWarning =
    (isSmallBalance && conversation.length > 1) || isExtremelySmallBalance;

  const lastUserMessage = conversation
    .filter((message) => !message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  const lastBotMessage = conversation
    .filter((message) => message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  useEffect(() => {
    if (helpMessage && helpMessage !== loadingHelpMessage) {
      setHelpMessage("");
    }
  }, [lastUserMessage?.text]);

  const generateHelpMessage = async () => {
    setHelpMessage(loadingHelpMessage);
    const last4Messages = conversation.slice(-4);

    const systemInstructions = `You are grammar, language learning helper system.
User wants to create his message.
Last part of conversations: ${JSON.stringify(last4Messages)}.
Generate one simple short sentences. 5-10 words maximum.
Use ${fullLanguageName || "English"} language.
`;
    const aiResult = await generateText({
      systemMessage: systemInstructions,
      userMessage: lastBotMessage?.text || "",
      model: MODELS.gpt_4o,
    });

    console.log("Help message result", aiResult);
    setHelpMessage(aiResult || "Error");
  };

  const isFinishingProcess = isClosing || isSavingHomework || isClosed;

  const [correctedMessage, setCorrectedMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const messageAnalyzing = useRef("");
  const [isAnalyzingMessageWithAi, setIsAnalyzingMessageWithAi] = useState(false);

  const [isNeedToShowCorrection, setIsNeedToShowCorrection] = useState(false);
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);

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
    try {
      const { sourceMessage, correctedMessage, description } =
        await analyzeUserMessage(transcriptMessage);
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

    // scroll window down
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.body.scrollHeight + 200,
        behavior: "smooth",
      });
    };
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  }, [conversation.length, isAnalyzingResponse]);

  return (
    <Stack sx={{ gap: "40px" }}>
      <Stack
        sx={{
          width: "100%",
          height: "100%",

          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          sx={{
            maxWidth: "900px",
            padding: "0",
            paddingTop: "80px",
            paddingBottom: "0px",
            boxSizing: "border-box",
            width: "100%",
            gap: "20px",
            alignItems: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",

            "@media (max-width: 600px)": {
              border: "none",
            },
            backgroundColor: "rgba(37, 54, 66, 0.1)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Stack
            sx={{
              gap: "40px",
              width: "100%",
              minHeight: "calc(100vh - 200px)",
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
                    {isBot ? "Teacher:" : "You:"}
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
                  borderRadius: "10px",
                  padding: "10px",
                  boxSizing: "border-box",
                }}
              >
                <Stack
                  sx={{
                    width: "100%",
                    maxWidth: "898px",
                    //borderTop: "1px solid rgba(255, 255, 255, 0.1)",
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
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              position: "sticky",
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(20, 28, 40, 1)",
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
                        gap: "10px",
                        paddingBottom: "10px",
                      }}
                    >
                      <Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                          }}
                        >
                          Your Message
                        </Typography>

                        <Typography
                          variant="body2"
                          component={"div"}
                          sx={{
                            fontWeight: 400,
                            fontSize: "20px",
                            paddingBottom: "3px",
                            opacity: isTranscribing ? 0.7 : 1,
                          }}
                        >
                          <StringDiff
                            oldValue={isTranscribing ? "Transcribing..." : transcriptMessage || ""}
                            newValue={isTranscribing ? "Transcribing..." : transcriptMessage || ""}
                          />
                        </Typography>
                      </Stack>

                      <Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                          }}
                        >
                          Your Corrected Message:
                        </Typography>
                        <Stack
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-end",
                          }}
                        >
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
                                fontSize: "20px",
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
                                    //display: "none",
                                    textDecoration: "line-through",
                                    opacity: 0.4,
                                  },
                                  default: {},
                                }}
                                oldValue={
                                  isTranscribing
                                    ? "Transcribing..."
                                    : isAnalyzingResponse
                                      ? "Analyzing..."
                                      : transcriptMessage || ""
                                }
                                newValue={
                                  isTranscribing
                                    ? "Transcribing..."
                                    : isAnalyzingResponse
                                      ? "Analyzing..."
                                      : correctedMessage || transcriptMessage || ""
                                }
                              />
                            </Typography>

                            <Stack>
                              {isTranscribing || isAnalyzingResponse ? (
                                <Loader color="#c2c2c2" size={"12px"} />
                              ) : (
                                <>
                                  {isNeedToShowCorrection ? (
                                    <FlaskConical color="#fa8500" size={"18px"} />
                                  ) : (
                                    <BadgeCheck color="#2bb6f6" size={"19px"} />
                                  )}
                                </>
                              )}
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                          }}
                        >
                          Review:
                        </Typography>
                        <Stack
                          sx={{
                            flexDirection: "row",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          {isTranscribing || isAnalyzingResponse ? (
                            <Typography
                              sx={{
                                opacity: 0.7,
                              }}
                            >
                              {isTranscribing ? "Transcribing..." : "Analyzing..."}
                            </Typography>
                          ) : (
                            <>
                              <Typography sx={{}}>{description || "Great!"}</Typography>
                              {isNeedToShowCorrection ? (
                                <FlaskConical color="transparent" size={"14px"} />
                              ) : (
                                <BadgeCheck color="#2bb6f6" size={"19px"} />
                              )}
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              )}

              {isFinishingProcess && (
                <>
                  <Stack
                    sx={{
                      alignItems: "flex-start",
                      gap: "15px",
                      width: "100%",
                    }}
                  >
                    {isClosing && <Typography>Finishing lesson...</Typography>}
                    {isSavingHomework && <Typography>Saving homework...</Typography>}
                    {isClosed && (
                      <Button onClick={() => doneConversation()} variant="contained">
                        Close
                      </Button>
                    )}
                  </Stack>
                </>
              )}

              {!isFinishingProcess && (
                <Stack
                  sx={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      width: "100%",

                      gap: "15px",
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
                        Analyzing
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
                        Send
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
                        Done
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
                        Record Message
                      </Button>
                    )}

                    {transcriptMessage && !isRecording && (
                      <Button
                        size="large"
                        startIcon={<Mic />}
                        onClick={async () => await startRecording()}
                      >
                        Re-record
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
                              boxShadow: "inset 0 0 10px 10px rgba(10, 18, 30, 1)",
                            }}
                          ></Stack>
                          <Typography variant="caption">
                            {dayjs(recordingMilliSeconds).format("mm:ss")}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Stack>

                  <Stack
                    sx={{
                      width: "100%",
                      alignItems: "flex-end",
                    }}
                  >
                    {isRecording || isAnalyzingResponse ? (
                      <Tooltip title="Cancel">
                        <IconButton size="large" color="error" onClick={() => cancelRecording()}>
                          <Trash2 size={"18px"} />
                        </IconButton>
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
                              You have a low balance |{" "}
                              {`${convertHoursToHumanFormat(balanceHours)}`} <br />
                              It makes sense to top up your balance.
                            </Typography>
                            <Button
                              startIcon={<AddCardIcon />}
                              onClick={() => togglePaymentModal(true)}
                              variant="contained"
                            >
                              Top up
                            </Button>
                          </Stack>
                        )}
                      </>
                    )}
                  </Stack>
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
