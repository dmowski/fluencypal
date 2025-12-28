import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { AiVoice } from "@/common/ai";
import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { useWebCam } from "../../webCam/useWebCam";
import { useAuth } from "../../Auth/useAuth";
import { IconButton, Stack } from "@mui/material";
import { Messages } from "../Messages";
import { WebCamFooter } from "./WebCamFooter";
import { UserPreviewStatic } from "./UserPreviewStatic";
import { AvatarVideo } from "./types";
import { AiAvatarVideo } from "./AiAvatarVideo";

const girlVoices: AiVoice[] = ["alloy", "coral", "sage", "shimmer"];

const girl1: AvatarVideo = {
  sitVideoUrl: "/call/girl_2/sit.webm",
  talkVideoUrl: "/call/girl_2/talk.webm",
};

const boy1: AvatarVideo = {
  sitVideoUrl: "/call/boy_1/sit.webm",
  talkVideoUrl: "/call/boy_1/talk2.webm",
};

export const CameraCanvas = ({
  conversation,
  stopCallMode,
  isMuted,
  setIsMuted,
  voice,
  isAiSpeaking,
  messageOrder,
}: {
  conversation: ChatMessage[];
  stopCallMode: () => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  voice: AiVoice | null;
  isAiSpeaking: boolean;
  messageOrder: MessagesOrderMap;
}) => {
  const sizes = useWindowSizes();
  const { i18n } = useLingui();
  const webCam = useWebCam();

  const auth = useAuth();
  const userPhoto = auth.userInfo?.photoURL || "";
  const myUserName = auth.userInfo?.displayName || auth.userInfo?.email || "You";
  const aiVideo: AvatarVideo | null = voice ? (girlVoices.includes(voice) ? girl1 : boy1) : null;

  const footerHeight = `calc(80px + ${sizes.bottomOffset})`;
  return (
    <>
      <Stack
        sx={{
          gap: "0px",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            display: "grid",
            height: "100dvh",
            gridTemplateRows: "1.2fr 1fr",
            paddingTop: sizes.topOffset,

            "@media (max-width: 1000px)": {
              gridTemplateRows: "1fr 1.5fr",
            },
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: `100%`,
              overflow: "hidden",
              padding: "10px 10px 0px 10px",
              gap: "10px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              position: "relative",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "20px",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              {aiVideo ? (
                <AiAvatarVideo aiVideo={aiVideo} isSpeaking={isAiSpeaking} />
              ) : (
                <UserPreviewStatic
                  bgUrl={"/blur/2.jpg"}
                  isSpeaking={isAiSpeaking}
                  avatarUrl={"/blog/whippet-prediction.png"}
                />
              )}

              <WebCamFooter name={i18n._("Teacher")} />
            </Stack>

            <Stack
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              }}
            >
              <video
                ref={webCam.videoRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                  display: webCam.isWebCamEnabled ? "block" : "none",
                }}
                autoPlay
                controls={false}
                muted
                playsInline
              />

              {!webCam.isWebCamEnabled && (
                <UserPreviewStatic bgUrl={"/blur/5.jpg"} avatarUrl={userPhoto} isSpeaking={false} />
              )}

              <WebCamFooter name={myUserName || i18n._("You")} />
            </Stack>
          </Stack>
          <Stack
            id="messages-call-mode"
            sx={{
              width: "100%",
              alignItems: "center",
              overflow: "auto",
              height: "100%",
              paddingBottom: footerHeight,
            }}
          >
            <Stack
              sx={{
                maxWidth: "1000px",
                height: "max-content",
                width: "100%",
                paddingBottom: "10px",
              }}
            >
              <Messages conversation={conversation} messageOrder={messageOrder} />
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            position: "fixed",
            bottom: 0,
            height: footerHeight,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Stack
            sx={{
              backgroundColor: "rgba(10, 18, 30, 1)",
              borderRadius: "90px",
              boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.3)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "max-content",
              padding: "10px 10px",
            }}
          >
            <IconButton
              sx={{
                backgroundColor: !isMuted ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
                color: !isMuted ? "#fff" : "#222",
                ":hover": {
                  backgroundColor: !isMuted
                    ? "rgba(100, 100, 100, 0.2)"
                    : "rgba(250, 222, 220, 0.8)",
                },
              }}
              size="large"
              onClick={async () => {
                setIsMuted(!isMuted);
              }}
            >
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>

            <IconButton
              sx={{
                backgroundColor: webCam.isWebCamEnabled
                  ? "rgba(100, 100, 100, 0.4)"
                  : "rgb(250 222 220)",
                color: webCam.isWebCamEnabled ? "#fff" : "#222",
                ":hover": {
                  backgroundColor: webCam.isWebCamEnabled
                    ? "rgba(100, 100, 100, 0.2)"
                    : "rgba(250, 222, 220, 0.8)",
                },
              }}
              size="large"
              onClick={async () => {
                if (webCam.isWebCamEnabled) {
                  webCam.disconnect();
                } else {
                  await webCam.init();
                }
              }}
            >
              {webCam.isWebCamEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton
              size="large"
              onClick={async () => stopCallMode()}
              sx={{
                width: "70px",
                borderRadius: "30px",
                backgroundColor: "#dc362e",
                ":hover": { backgroundColor: "rgba(255, 0, 0, 0.7)" },
              }}
            >
              <CallEndIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};
