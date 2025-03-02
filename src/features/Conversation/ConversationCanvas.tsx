"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useState } from "react";
import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import { Textarea } from "../uiKit/Input/Textarea";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { SendHorizontal } from "lucide-react";
import DoneIcon from "@mui/icons-material/Done";
import { MicroButton } from "../uiKit/Button/MicroButton";
import { KeyboardButton } from "../uiKit/Button/KeyboardButton";
import { UserMessage } from "./UserMessage";

export function ConversationCanvas() {
  const aiConversation = useAiConversation();
  const [userMessage, setUserMessage] = useState("");
  const submitMessage = () => {
    if (!userMessage) return;
    aiConversation.addUserMessage(userMessage);
    setUserMessage("");
  };

  const lastUserMessage = aiConversation.conversation
    .filter((message) => !message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  const lastBotMessage = aiConversation.conversation
    .filter((message) => message.isBot)
    .find((_, index, arr) => index >= arr.length - 1);

  return (
    <Stack sx={{ gap: "40px" }}>
      <TalkingWaves inActive={aiConversation.isAiSpeaking} />
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
          minHeight: "calc(100vh - 20px)",
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
            boxSizing: "border-box",
          }}
        >
          <Stack
            sx={{
              width: "650px",
              maxWidth: "calc(100vw - 33px)",
              gap: "20px",
            }}
          >
            {lastUserMessage && <UserMessage message={lastUserMessage?.text} />}

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
            boxSizing: "border-box",
            padding: "0 10px",
          }}
        >
          {aiConversation.isShowUserInput && (
            <>
              <Textarea value={userMessage} onChange={setUserMessage} onSubmit={submitMessage} />
              <IconButton disabled={!userMessage} onClick={submitMessage}>
                <SendHorizontal />
              </IconButton>
            </>
          )}
        </Stack>

        <Stack
          sx={{
            width: "100%",
            maxWidth: "680px",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            boxSizing: "border-box",
            padding: "0 20px 0 0px",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              flexDirection: "row",
              gap: "10px",
              animationDelay: "0.5s",
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
                  onClick={() => aiConversation.doneConversation()}
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
      </Stack>
    </Stack>
  );
}
