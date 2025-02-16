"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";
import { use, useEffect, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { TalkingWaves } from "../Animations/TalkingWaves";
import { MicroButton } from "../Button/MicroButton";
import { Textarea } from "../Input/Textarea";
import { KeyboardButton } from "../Button/KeyboardButton";
import { Button, Card, IconButton, Stack, Typography } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { StarContainer } from "../Layout/StarContainer";
import { SendHorizontal, Sparkles } from "lucide-react";
import MicIcon from "@mui/icons-material/Mic";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { LangSelector } from "../Lang/LangSelector";
import AddCardIcon from "@mui/icons-material/AddCard";
import { useNotifications } from "@toolpad/core/useNotifications";
import { correctUserAnswer } from "./correctAnswer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ChildCareIcon from "@mui/icons-material/ChildCare";

export function Conversation() {
  const auth = useAuth();
  const settings = useSettings();
  const notifications = useNotifications();
  const aiConversation = useAiConversation();
  const [userMessage, setUserMessage] = useState("");
  const usage = useUsage();
  const submitMessage = () => {
    if (!userMessage) return;
    aiConversation.addUserMessage(userMessage);
    setUserMessage("");
  };

  const inProgressMark = "Analyzing...";
  const [analyzeResults, setAnalyzeResults] = useState<Record<string, string | undefined>>({});

  const lastBotMessage = aiConversation.conversation
    .filter((message) => message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  const lastUserMessage = aiConversation.conversation
    .filter((message) => !message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  const getMessageBeforeId = (id: string) => {
    const messageIndex = aiConversation.conversation.findIndex((message) => message.id === id);
    if (messageIndex === -1 || messageIndex === 0) return;

    return aiConversation.conversation[messageIndex - 1];
  };

  const analyzeMessages = async (messageId: string) => {
    if (!settings.language) throw new Error("Language is not set");
    const isAlreadyAnalyzed = analyzeResults[messageId];
    if (isAlreadyAnalyzed) return;

    setAnalyzeResults((prev) => ({
      ...prev,
      [messageId]: inProgressMark,
    }));

    const messageBefore = getMessageBeforeId(messageId);
    const message = aiConversation.conversation.find((message) => message.id === messageId);
    if (!messageBefore || !message) return;

    const correctedMessageResult = await correctUserAnswer({
      botMessages: messageBefore,
      userMessages: message,
      language: settings.language,
    });

    if (correctedMessageResult.correctAnswer) {
      setAnalyzeResults((prev) => ({
        ...prev,
        [messageId]: correctedMessageResult.correctAnswer,
      }));
    } else {
      setAnalyzeResults((prev) => ({
        ...prev,
        [messageId]: "No corrections found",
      }));
    }
  };

  useEffect(() => {
    if (!lastUserMessage?.id) return;
    //analyzeMessages(lastUserMessage.id);
  }, [lastUserMessage?.id]);

  if (auth.loading || settings.loading) return <></>;
  if (!auth.isAuthorized) return <SignInForm />;
  return (
    <Stack sx={{ gap: "40px" }}>
      <TalkingWaves inActive={aiConversation.isAiSpeaking} />
      {aiConversation.isStarted ? (
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            height: "calc(100vh - 0px)",
          }}
        >
          <Stack
            sx={{
              minHeight: "300px",
              alignItems: "center",
              justifyContent: "flex-end",

              maxWidth: "1200px",
              width: "100%",
              padding: "10px",
            }}
          >
            {aiConversation.isClosing && !aiConversation.isClosed && (
              <Typography variant="h4">Finishing the Lesson...</Typography>
            )}

            <Stack
              sx={{
                width: "650px",
                gap: "20px",
              }}
            >
              {lastUserMessage &&
                !aiConversation.isAiSpeaking &&
                analyzeResults[lastUserMessage.id] &&
                analyzeResults[lastUserMessage.id] !== inProgressMark && (
                  <Stack
                    sx={{
                      gap: "10px",
                    }}
                  >
                    <Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.5,
                        }}
                      >
                        Corrected Version of: {lastUserMessage.text}
                      </Typography>
                      <Stack
                        sx={{
                          opacity: 0.9,
                        }}
                      >
                        <Markdown>{`${analyzeResults[lastUserMessage.id]}\n`}</Markdown>
                      </Stack>
                    </Stack>
                  </Stack>
                )}

              {lastBotMessage && (
                <Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.5,
                    }}
                  >
                    Teacher:
                  </Typography>
                  <Markdown>{lastBotMessage.text || ""}</Markdown>
                </Stack>
              )}
            </Stack>
          </Stack>

          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              flexDirection: "row",
              minHeight: "100px",
            }}
          >
            {aiConversation.conversation.length > 0 && aiConversation.isShowUserInput && (
              <>
                <Textarea value={userMessage} onChange={setUserMessage} onSubmit={submitMessage} />
                <IconButton disabled={!userMessage} onClick={submitMessage}>
                  <SendHorizontal />
                </IconButton>
              </>
            )}
          </Stack>

          {aiConversation.conversation.length > 0 && (
            <Stack
              sx={{
                width: "100%",
                maxWidth: "680px",
              }}
            >
              <Stack
                style={{
                  animationDelay: "0.5s",
                }}
                sx={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "10px",
                }}
              >
                <MicroButton
                  isMuted={!!aiConversation.isMuted}
                  isPlaying={aiConversation.isUserSpeaking}
                  onClick={() => aiConversation.toggleMute(!aiConversation.isMuted)}
                />
                <KeyboardButton
                  isEnabled={!!aiConversation.isShowUserInput}
                  onClick={() => aiConversation.setIsShowUserInput(!aiConversation.isShowUserInput)}
                />

                {aiConversation.conversation.length > 0 &&
                  !aiConversation.isClosed &&
                  !aiConversation.isClosing && (
                    <Typography
                      variant="caption"
                      sx={{
                        padding: "0 15px",
                        opacity: 0.7,
                      }}
                    >
                      When you get tired, just say <b>"Let's finish the Lesson"</b>
                    </Typography>
                  )}
              </Stack>
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack
          sx={{
            height: "calc(100vh - 0px)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StarContainer>
            {aiConversation.isInitializing ? (
              <Typography>Loading...</Typography>
            ) : (
              <>
                {!settings.language ? (
                  <Stack
                    sx={{
                      maxWidth: "400px",
                      gap: "20px",
                    }}
                  >
                    <Typography variant="h5">Select language to learn</Typography>
                    <LangSelector
                      value={settings.language}
                      onDone={(lang) => settings.setLanguage(lang)}
                      confirmButtonLabel="Continue"
                    />
                    <Typography variant="caption">
                      You can change the language later in the settings
                    </Typography>
                  </Stack>
                ) : (
                  <Stack
                    gap={"10px"}
                    sx={{
                      width: "300px",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => aiConversation.startConversation("talk")}
                      startIcon={
                        <MicIcon
                          sx={{
                            fontSize: "30px",
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      }
                    >
                      Just talk
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => aiConversation.startConversation("talk-and-correct")}
                      startIcon={
                        <TrendingUpIcon
                          sx={{
                            fontSize: "30px",
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      }
                    >
                      Talk & Correct
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => aiConversation.startConversation("beginner")}
                      startIcon={
                        <ChildCareIcon
                          sx={{
                            fontSize: "30px",
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      }
                    >
                      Beginner
                    </Button>
                  </Stack>
                )}
              </>
            )}

            {!!aiConversation.errorInitiating && (
              <Typography color="error">{aiConversation.errorInitiating}</Typography>
            )}
          </StarContainer>
        </Stack>
      )}

      {settings.language && (
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <Stack sx={{ padding: "20px", width: "100%", maxWidth: "1200px", marginTop: "00px" }}>
            <Stack
              sx={{
                flexDirection: "row",
                gap: "20px",
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  padding: "20px",
                  gap: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="h3">
                  ${new Intl.NumberFormat().format(usage.usedBalance)}
                </Typography>
                <Typography variant="caption">Total used</Typography>
              </Card>

              <Card
                sx={{
                  width: "100%",
                  padding: "20px",
                  gap: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography variant="h3">
                  ${new Intl.NumberFormat().format(usage.balance)}
                </Typography>
                <Typography variant="caption">My Balance</Typography>
                <Button
                  onClick={() => {
                    const amount =
                      usage.balance >= 0
                        ? parseFloat(prompt("Enter amount to update", `${usage.balance}`) || "0")
                        : Math.abs(usage.balance);
                    usage.addBalance(amount);
                    notifications.show(`Added $${amount} to your balance`, {
                      severity: "success",
                      autoHideDuration: 7000,
                    });
                  }}
                  startIcon={<AddCardIcon />}
                  variant="contained"
                >
                  Buy More
                </Button>
              </Card>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
