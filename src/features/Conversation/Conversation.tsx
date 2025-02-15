"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../Markdown/Markdown";
import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { TalkingWaves } from "../Animations/TalkingWaves";
import { MicroButton } from "../Button/MicroButton";
import { Textarea } from "../Input/Textarea";
import { KeyboardButton } from "../Button/KeyboardButton";
import { Button, Card, IconButton, Paper, Stack, Typography } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { StarContainer } from "../Layout/StarContainer";
import { SendHorizontal } from "lucide-react";
import MicIcon from "@mui/icons-material/Mic";
import { useUsage } from "../Usage/useUsage";

export function Conversation() {
  const auth = useAuth();

  const aiConversation = useAiConversation();
  const [userMessage, setUserMessage] = useState("");
  const usage = useUsage();
  const submitMessage = () => {
    if (!userMessage) return;
    aiConversation.addUserMessage(userMessage);
    setUserMessage("");
  };

  if (auth.loading) {
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
              height: "calc(100vh - 600px)",
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
                      maxWidth: "650px",
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

          {!!aiConversation.errorInitiating && (
            <Typography color="error">{aiConversation.errorInitiating}</Typography>
          )}
        </StarContainer>
      )}
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
                {new Intl.NumberFormat().format(usage.tokenUsed)}
              </Typography>
              <Typography variant="caption">Tokens used</Typography>
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
                ${new Intl.NumberFormat().format(usage.tokenUsedPrice)}
              </Typography>
              <Typography variant="caption">AI price</Typography>
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
                ${new Intl.NumberFormat().format(usage.tokenUsedPrice * 2)}
              </Typography>
              <Typography variant="caption">Price for user (+100%)</Typography>
            </Card>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
