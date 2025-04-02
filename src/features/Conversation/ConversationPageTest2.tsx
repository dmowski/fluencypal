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

interface ConversationPageTestProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}

export function ConversationPageTest2({ rolePlayInfo, lang }: ConversationPageTestProps) {
  const messages: ChatMessage[] = [];
  const auth = useAuth();

  for (let i = 20; i < 40; i++) {
    messages.push({
      isBot: i % 2 === 0,
      text: `I do well, thank **you**! Hello.I do well, thank **you**! Hello I do well, thank **you**! Hello .I do well, thank **you**! Hello 
`,
      id: `${i}`,
    });
  }

  const [isRecording, setIsRecording] = useState(false);
  const maxRecordingSeconds = 40;
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const timeout = setTimeout(() => {
      setRecordingSeconds((prev) => {
        if (prev >= maxRecordingSeconds) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isRecording, recordingSeconds]);

  const getRecordTranscript = async (recordedAudioBlog: Blob) => {
    if (!recordedAudioBlog) {
      return;
    }

    const token = await auth.getToken();
    const transcriptResponse = await sendTranscriptRequest(recordedAudioBlog, token);
    console.log("transcriptResponse", transcriptResponse);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        getRecordTranscript(blob);
        setAudioChunks([]);
      };

      recorder.start();
      setAudioChunks([]);
      setMediaRecorder(recorder);
      setRecordingSeconds(0);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const cancelRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setAudioBlob(null);
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
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <Button
              color={isRecording ? "error" : "info"}
              startIcon={isRecording ? <ArrowUp /> : <Mic />}
              size="large"
              variant="contained"
              sx={{
                minWidth: "200px",
              }}
              onClick={async () => {
                if (isRecording) {
                  await stopRecording();
                } else {
                  await startRecording();
                }
              }}
            >
              {isRecording ? "Send" : "Record Answer"}
            </Button>
            {isRecording && <Typography variant="caption">{recordingSeconds} sec</Typography>}
          </Stack>

          <Stack>
            {isRecording ? (
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
        </Stack>
      </Stack>
    </Stack>
  );
}
