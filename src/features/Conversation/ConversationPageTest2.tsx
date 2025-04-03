"use client";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { SupportedLanguage } from "@/common/lang";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { ChatMessage } from "@/common/conversation";
import { Markdown } from "../uiKit/Markdown/Markdown";
import { ArrowUp, Mic, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { sendTranscriptRequest } from "@/app/api/transcript/sendTranscriptRequest";
import { useAuth } from "../Auth/useAuth";
import { useSettings } from "../Settings/useSettings";
import { useRef } from "react";
import { AudioPlayIcon } from "../Audio/AudioPlayIcon";
import { useAudioRecorder } from "../Audio/useAudioRecorder";

interface ConversationPageTestProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPageTest2({ rolePlayInfo, lang }: ConversationPageTestProps) {
  const messages: ChatMessage[] = [];
  const recorder = useAudioRecorder();

  for (let i = 20; i < 40; i++) {
    messages.push({
      isBot: i % 2 === 0,
      text: `Hello. I do well, thank **you**! How are you? Nice to meet you!
`,
      id: `${i}`,
    });
  }

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

  return (
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
          paddingBottom: "130px",
          boxSizing: "border-box",
          width: "100%",
          gap: "20px",
          alignItems: "center",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          "@media (max-width: 600px)": {
            border: "none",
          },
        }}
      >
        <Stack
          sx={{
            gap: "20px",
            width: "100%",
          }}
        >
          {messages.map((message) => {
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
                <AudioPlayIcon
                  text={message.text}
                  voice="shimmer"
                  instructions="Say it politely and clearly."
                />
              </Stack>
            );
          })}
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
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
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
                  onClick={() => {
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
                  alignItems: "center",
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
                  }}
                  onClick={async () => {
                    if (recorder.isRecording) {
                      await stopRecording();
                    } else {
                      await startRecording();
                    }
                  }}
                >
                  {recorder.isRecording ? "Send" : "Record Answer"}
                </Button>
                {recorder.isRecording && (
                  <Typography variant="caption">{recorder.recordingSeconds} sec</Typography>
                )}
              </Stack>

              <Stack>
                {recorder.isRecording ? (
                  <Tooltip title="Cancel">
                    <IconButton size="large" color="error" onClick={() => cancelRecording()}>
                      <Trash2 size={"18px"} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton size="large">
                    <Settings size={"18px"} />
                  </IconButton>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
