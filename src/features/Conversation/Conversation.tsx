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
import AddCardIcon from "@mui/icons-material/AddCard";
import { useNotifications, NotificationsProvider } from "@toolpad/core/useNotifications";

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

  if (auth.loading || settings.loading) {
    return <></>;
  }
  if (!auth.isAuthorized) {
    return <SignInForm />;
  }
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
          }}
        >
          <Stack
            sx={{
              height: "calc(100vh - 450px)",
              minHeight: "300px",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "1200px",
              width: "100%",
              padding: "10px",
            }}
          >
            {aiConversation.isClosing && !aiConversation.isClosed && (
              <Typography variant="h4">Finishing the Lesson...</Typography>
            )}
            {aiConversation.conversation
              .filter((message) => message.isBot)
              .filter((_, index, arr) => index >= arr.length - 1)
              .map((message, index) => {
                return (
                  <Stack
                    key={message.text + index}
                    sx={{
                      width: "650px",
                    }}
                  >
                    <Markdown>{message.text || ""}</Markdown>
                  </Stack>
                );
              })}
          </Stack>

          <Stack
            sx={{
              alignItems: "flex-end",
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
          )}

          {aiConversation.conversation.length > 0 &&
            !aiConversation.isClosed &&
            !aiConversation.isClosing && (
              <Typography variant="caption">
                When you get tired, just say <b>"Let's finish the Lesson"</b>
              </Typography>
            )}
        </Stack>
      ) : (
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
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => aiConversation.startConversation()}
                  startIcon={
                    <MicIcon
                      sx={{
                        fontSize: "30px",
                        width: "30px",
                        height: "30px",
                      }}
                    />
                  }
                  sx={{
                    padding: "20px 50px",
                  }}
                >
                  Start Practice
                </Button>
              )}
            </>
          )}

          {!!aiConversation.errorInitiating && (
            <Typography color="error">{aiConversation.errorInitiating}</Typography>
          )}
        </StarContainer>
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
