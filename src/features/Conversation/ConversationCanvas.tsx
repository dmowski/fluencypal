"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { useState } from "react";
import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import { Textarea } from "../uiKit/Input/Textarea";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { SendHorizontal, Wand, X } from "lucide-react";
import DoneIcon from "@mui/icons-material/Done";
import { MicroButton } from "../uiKit/Button/MicroButton";
import { KeyboardButton } from "../uiKit/Button/KeyboardButton";
import { UserMessage } from "./UserMessage";
import { HelpButton } from "../uiKit/Button/HelpButton";
import { useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";

const loadingHelpMessage = `Generating help message...`;
export function ConversationCanvas() {
  const aiConversation = useAiConversation();
  const textAi = useTextAi();
  const [userMessage, setUserMessage] = useState("");
  const [helpMessage, setHelpMessage] = useState("");

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

  const generateHelpMessage = async () => {
    setHelpMessage(loadingHelpMessage);
    const last4Messages = aiConversation.conversation.slice(-4);

    const systemInstructions = `You are grammar, language learning helper system.
User wants to create his message.
Last part of conversations: ${JSON.stringify(last4Messages)}.
Generate simple sentences. 10 words maximum.
`;
    console.log("systemInstructions", systemInstructions);
    const aiResult = await textAi.generate({
      systemMessage: systemInstructions,
      userMessage: lastBotMessage?.text || "",
      model: MODELS.gpt_4o,
    });

    console.log("Help message result", aiResult);
    setHelpMessage(aiResult || "Error");
  };

  return (
    <Stack sx={{ gap: "40px" }}>
      <TalkingWaves inActive={aiConversation.isAiSpeaking} />
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
          minHeight: "calc(100vh - 90px)",
          paddingTop: "90px",
          boxSizing: "border-box",
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

        {helpMessage && (
          <Stack
            sx={{
              gap: "10px",
              flexDirection: "row",
              alignItems: "center",
              width: "650px",
              minHeight: "20px",
              maxWidth: "calc(100vw - 33px)",
              boxSizing: "border-box",
              padding: "10px 10px 10px 14px",
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              backgroundColor: `rgba(255, 255, 255, 0.04)`,
              borderRadius: "4px",
            }}
          >
            <Wand
              color={helpMessage === loadingHelpMessage ? "#fa8500" : "#558fdb"}
              size={"16px"}
              style={{
                paddingBottom: "2px",
              }}
            />
            <Typography
              sx={{
                maxWidth: "600px",
                paddingLeft: "3px",
                width: "100%",
                opacity: helpMessage === loadingHelpMessage ? 0.7 : 1,
              }}
            >
              {helpMessage}
            </Typography>

            <IconButton onClick={() => setHelpMessage("")}>
              <X
                size={"16px"}
                style={{
                  opacity: 0.7,
                }}
              />
            </IconButton>
          </Stack>
        )}

        <Stack
          sx={{
            width: "650px",
            maxWidth: "calc(100vw - 33px)",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            boxSizing: "border-box",
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
            <Stack
              sx={{
                gap: "27px",
                flexDirection: "row",
              }}
            >
              <KeyboardButton
                isEnabled={!!aiConversation.isShowUserInput}
                onClick={() => aiConversation.setIsShowUserInput(!aiConversation.isShowUserInput)}
              />
              <HelpButton
                isLoading={false}
                isEnabled={helpMessage !== loadingHelpMessage}
                onClick={generateHelpMessage}
              />
            </Stack>
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
                      Finish
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
