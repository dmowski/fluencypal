"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useEffect, useState } from "react";
import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import { Textarea } from "../uiKit/Input/Textarea";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ArrowUp, Mic, SendHorizontal, Settings, Trash2, Wand, X } from "lucide-react";
import DoneIcon from "@mui/icons-material/Done";
import { MicroButton } from "../uiKit/Button/MicroButton";
import { KeyboardButton } from "../uiKit/Button/KeyboardButton";
import { UserMessage } from "./UserMessage";
import AddCardIcon from "@mui/icons-material/AddCard";
import { HelpButton } from "../uiKit/Button/HelpButton";
import { TextAiRequest, useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";
import { useSettings } from "../Settings/useSettings";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { useUsage } from "../Usage/useUsage";
import { AliasGamePanel } from "./AliasGamePanel";
import { VolumeButton } from "../uiKit/Button/VolumeButton";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { ChatMessage } from "@/common/conversation";
import { GuessGameStat } from "./types";
import { useWebCam } from "../webCam/useWebCam";
import { useAudioRecorder } from "../Audio/useAudioRecorder";
import dayjs from "dayjs";

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

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) return;

    // scroll window down
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    };
    scrollToBottom();
  }, [conversation.length]);

  const recorder = useAudioRecorder();

  const [isAnalyzingResponse, setIsAnalyzingResponse] = useState(false);

  const startRecording = async () => {
    recorder.startRecording();
  };

  const stopRecording = async () => {
    setIsAnalyzingResponse(true);
    recorder.stopRecording();
  };

  const cancelRecording = async () => {
    recorder.cancelRecording();
  };

  const submitTranscript = async () => {
    if (!recorder.transcription) return;
    addUserMessage(recorder.transcription || "");
  };

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
            padding: "0 20px",
            paddingTop: "80px",
            paddingBottom: "100px",
            boxSizing: "border-box",
            width: "100%",
            gap: "20px",
            alignItems: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            minHeight: "100vh",
            "@media (max-width: 600px)": {
              border: "none",
            },
            backgroundColor: "rgba(10, 18, 30, 0.2)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Stack
            sx={{
              gap: "20px",
              width: "100%",
            }}
          >
            {conversation.map((message) => {
              const isBot = message.isBot;
              return (
                <Stack key={message.id}>
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
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            position: "fixed",
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(10, 18, 30, 0.6)",
            backdropFilter: "blur(8px)",
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
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderTop: "none",
              borderBottom: "none",
              "@media (max-width: 600px)": {
                border: "none",
              },
              alignItems: "flex-end",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            {isSavingHomework || isClosing || isClosed ? (
              <>
                <Stack
                  sx={{
                    alignItems: "flex-start",
                    gap: "15px",
                  }}
                >
                  {isClosing && <Typography>Finishing lesson...</Typography>}
                  {isSavingHomework && <Typography>Saving homework...</Typography>}
                  {isClosed && (
                    <Button
                      onClick={() => {
                        doneConversation();
                      }}
                      variant="contained"
                    >
                      Close
                    </Button>
                  )}
                </Stack>
              </>
            ) : (
              <>
                {isAnalyzingResponse ? (
                  <>
                    <Stack
                      sx={{
                        alignItems: "flex-start",
                        gap: "15px",
                      }}
                    >
                      <Stack>
                        <Typography variant="caption">Your Message</Typography>
                        <Typography>
                          {recorder.isTranscribing ? "Loading..." : recorder.transcription}
                        </Typography>
                      </Stack>

                      <Button
                        variant="contained"
                        disabled={recorder.isTranscribing}
                        onClick={() => {
                          submitTranscript();
                          setIsAnalyzingResponse(false);
                        }}
                      >
                        Send
                      </Button>
                    </Stack>

                    <Stack>
                      <Tooltip title="Cancel">
                        <IconButton
                          size="large"
                          color="error"
                          onClick={() => {
                            setIsAnalyzingResponse(false);
                          }}
                        >
                          <Trash2 size={"18px"} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Stack
                      sx={{
                        flexDirection: "row",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        width: "100%",

                        gap: "15px",
                      }}
                    >
                      <Button
                        color={recorder.isRecording ? "error" : "info"}
                        startIcon={recorder.isRecording ? <ArrowUp /> : <Mic />}
                        size="large"
                        variant="contained"
                        sx={{
                          minWidth: "200px",
                          position: "relative",
                          zIndex: 1,
                        }}
                        onClick={async () => {
                          if (recorder.isRecording) {
                            await stopRecording();
                          } else {
                            await startRecording();
                          }
                        }}
                      >
                        {recorder.isRecording ? "Done" : "Record Message"}
                      </Button>

                      {recorder.isRecording && (
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
                            {recorder.visualizerComponent}
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
                              {dayjs(recorder.recordingSeconds * 1000).format("mm:ss")}
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
                      {recorder.isRecording ? (
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
                  </>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </Stack>
      <TalkingWaves inActive={isAiSpeaking} />
    </Stack>
  );
};
