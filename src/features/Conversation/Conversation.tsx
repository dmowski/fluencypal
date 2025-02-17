"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";
import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { TalkingWaves } from "../Animations/TalkingWaves";
import { MicroButton } from "../Button/MicroButton";
import { Textarea } from "../Input/Textarea";
import { KeyboardButton } from "../Button/KeyboardButton";
import { Button, Card, IconButton, Stack, Typography } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { StarContainer } from "../Layout/StarContainer";
import { SendHorizontal } from "lucide-react";
import MicIcon from "@mui/icons-material/Mic";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { LangSelector } from "../Lang/LangSelector";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import DoneIcon from "@mui/icons-material/Done";
import { NoBalanceBlock } from "../Usage/NoBalanceBlock";
import { useHomework } from "./useHomework";
import { ConversationMode } from "@/common/ai";

const conversationModeLabel: Record<ConversationMode, string> = {
  beginner: "Beginner",
  talk: "Just talk",
  "talk-and-correct": "Talk & Correct",
};

export function Conversation() {
  const auth = useAuth();
  const settings = useSettings();
  const homework = useHomework();
  const aiConversation = useAiConversation();
  const [userMessage, setUserMessage] = useState("");
  const usage = useUsage();
  const submitMessage = () => {
    if (!userMessage) return;
    aiConversation.addUserMessage(userMessage);
    setUserMessage("");
  };

  const lastBotMessage = aiConversation.conversation
    .filter((message) => message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  if (auth.loading || settings.loading) return <></>;
  if (!auth.isAuthorized) return <SignInForm />;
  if (usage.balance <= 0) return <NoBalanceBlock />;
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
            <Stack
              sx={{
                width: "650px",
                gap: "20px",
              }}
            >
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
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
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
              </Stack>

              {aiConversation.isClosing || aiConversation.isSavingHomework ? (
                <Button variant="outlined" disabled onClick={() => aiConversation.finishLesson()}>
                  {aiConversation.isSavingHomework ? "Saving homework..." : "Finishing..."}
                </Button>
              ) : (
                <>
                  {aiConversation.isClosed ? (
                    <Button
                      variant="contained"
                      onClick={() => aiConversation.stopConversation()}
                      startIcon={<DoneIcon />}
                    >
                      Done
                    </Button>
                  ) : (
                    <>
                      {aiConversation.conversation.length > 0 && (
                        <Button variant="outlined" onClick={() => aiConversation.finishLesson()}>
                          Finish the Lesson
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </Stack>
          )}
        </Stack>
      ) : (
        <Stack
          sx={{
            minHeight: "calc(100vh - 0px)",
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
                      onClick={() => aiConversation.startConversation({ mode: "talk" })}
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
                      onClick={() => aiConversation.startConversation({ mode: "talk-and-correct" })}
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
                      onClick={() => aiConversation.startConversation({ mode: "beginner" })}
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
          {homework.incompleteHomeworks.length > 0 && (
            <Stack
              sx={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "20px",
                padding: "0 0 90px 0",
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: "550px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "30px",
                }}
              >
                <Typography variant="h4">Homework</Typography>
                <Stack sx={{ gap: "30px" }}>
                  {homework.incompleteHomeworks.map((homework) => {
                    return (
                      <Stack
                        key={homework.conversationId}
                        sx={{
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography>{conversationModeLabel[homework.mode]}</Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.5,
                          }}
                        >
                          {new Date(homework.createdAt).toLocaleDateString()}
                        </Typography>
                        <Stack sx={{ opacity: 0.9 }}>
                          <Markdown size="small">{homework.homework}</Markdown>
                        </Stack>

                        <Button
                          sx={{
                            marginTop: "5px",
                          }}
                          variant="outlined"
                          onClick={() => {
                            aiConversation.startConversation({
                              mode: homework.mode,
                              homework,
                            });
                          }}
                        >
                          Continue
                        </Button>
                      </Stack>
                    );
                  })}
                </Stack>
              </Card>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}
