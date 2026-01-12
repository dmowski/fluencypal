"use client";
import { Button, Stack, Typography } from "@mui/material";
import { Loader } from "lucide-react";

import { ReactNode, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { goFullScreen } from "@/libs/fullScreen";
import { useWebCam } from "../webCam/useWebCam";
import { WebCamView } from "../webCam/WebCamView";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import { GoalElementInfo } from "./types";
import { useSettings } from "../Settings/useSettings";
import { useWords } from "../Words/useWords";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useRules } from "../Rules/useRules";

export const LessonStartModal = ({
  title,
  subTitle,
  description,
  icon,
  onClose,
  goalInfo,
}: {
  title: string;
  subTitle: string;
  description?: string;
  icon: ReactNode;
  onClose: () => void;
  goalInfo: GoalElementInfo;
}) => {
  const { i18n } = useLingui();
  const webcam = useWebCam();
  const settings = useSettings();
  const words = useWords();
  const rules = useRules();
  const aiConversation = useAiConversation();

  const [allowWebCam, setAllowWebCam] = useState<boolean | null>(null);

  const [isLoadingCall, setIsLoadingCall] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);

  const onStartCallMode = async () => {
    setIsLoadingCall(true);
    goFullScreen();
    let imageDescription = "";
    try {
      imageDescription = allowWebCam ? (await webcam.getImageDescription()) || "" : "";
    } catch (error) {
      console.error("Error getting image description:", error);
    }

    if (settings.conversationMode !== "call") {
      await settings.setConversationMode("call");
    }

    aiConversation.startConversation({
      mode: goalInfo.goalElement.mode === "play" ? "goal-role-play" : "goal-talk",
      goal: goalInfo,
      webCamDescription: imageDescription,
      conversationMode: "call",
    });
    setIsLoadingCall(false);
    onClose();
  };

  const onStartVoiceOnly = async () => {
    setIsLoadingVoice(true);
    goFullScreen();

    if (settings.conversationMode !== "call") {
      await settings.setConversationMode("call");
    }

    aiConversation.startConversation({
      mode: goalInfo.goalElement.mode === "play" ? "goal-role-play" : "goal-talk",
      goal: goalInfo,
      conversationMode: "record",
    });
    setIsLoadingVoice(false);
    onClose();
  };

  return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          width: "100%",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",

            img: {
              borderRadius: "100px",
              width: "100px",
              height: "100px",
            },
          }}
        >
          {icon}
        </Stack>
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
            paddingTop: "30px",
          }}
        >
          <Stack>
            <Typography
              align="center"
              variant="caption"
              sx={{
                color: `rgba(255, 255, 255, 0.5)`,
                textTransform: "uppercase",
              }}
            >
              {subTitle}
            </Typography>
            <Typography variant="h4" align="center" component="h2" className="decor-text">
              {title}
            </Typography>
            {description && (
              <Typography sx={{ paddingTop: "0px" }} align="center" variant="caption">
                {description}
              </Typography>
            )}
          </Stack>

          {allowWebCam !== false && (
            <Stack
              sx={{
                width: "350px",
                height: "220px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "9px",
                justifyContent: "center",
                alignItems: "center",
                margin: "20px 0",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {allowWebCam === true && <WebCamView />}

              {allowWebCam === null && (
                <Stack
                  sx={{
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <Button
                    color="info"
                    variant="contained"
                    onClick={() => setAllowWebCam(true)}
                    startIcon={<VideocamIcon />}
                  >
                    {i18n._(`Allow WebCam`)}
                  </Button>
                  <Button variant="text" onClick={() => setAllowWebCam(false)}>
                    {i18n._(`Skip for now`)}
                  </Button>
                </Stack>
              )}
            </Stack>
          )}

          <Stack
            sx={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              margin: "5px 0px 15px 0px",
              gap: "10px",
              marginTop: allowWebCam !== false ? "5px" : "20px",
            }}
          >
            <Button
              sx={{
                minWidth: "240px",
                padding: "10px 20px",
              }}
              onClick={onStartCallMode}
              size="large"
              variant="contained"
              color="info"
              startIcon={isLoadingCall ? <Loader /> : <VideocamIcon />}
              disabled={isLoadingCall || isLoadingVoice || webcam.loading || allowWebCam === null}
            >
              {i18n._(`Start Call`)}
            </Button>

            <Button
              onClick={onStartVoiceOnly}
              variant="text"
              color="info"
              startIcon={isLoadingVoice ? <Loader /> : <MicIcon />}
              disabled={isLoadingCall || isLoadingVoice || webcam.loading || allowWebCam === null}
            >
              {i18n._(`Start Voice Only`)}
            </Button>
          </Stack>

          <Typography
            align="center"
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._(`Send 6 messages to complete`)}
          </Typography>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
