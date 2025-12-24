import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { AiVoice } from "@/common/ai";
import { ChatMessage } from "@/common/conversation";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { useWebCam } from "../../webCam/useWebCam";
import { useAuth } from "../../Auth/useAuth";
import { IconButton, Stack } from "@mui/material";
import { Messages } from "../Messages";
import { WebCamFooter } from "./WebCamFooter";
import { UserPreviewStatic } from "./UserPreviewStatic";

const girlVoices: AiVoice[] = ["ash", "ballad", "coral", "shimmer"];

export const CallModeCanvas = ({
  conversation,
  stopCallMode,
  isMuted,
  setIsMuted,
  voice,
  isAiSpeaking,
}: {
  conversation: ChatMessage[];
  stopCallMode: () => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  voice: AiVoice | null;
  isAiSpeaking: boolean;
}) => {
  const sizes = useWindowSizes();
  const { i18n } = useLingui();
  const webCam = useWebCam();

  const auth = useAuth();
  const userPhoto = auth.userInfo?.photoURL || "";
  const myUserName = auth.userInfo?.displayName || auth.userInfo?.email || "You";

  const isShowVideo = voice ? girlVoices.includes(voice) : false;

  return (
    <>
      <Stack
        sx={{
          alignItems: "center",
          gap: "0px",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: "100%",
            height: `calc(100dvh - 310px - ${sizes.bottomOffset})`,
            overflow: "hidden",
            padding: "10px 10px 5px 10px",
            paddingTop: "10px",
            gap: "10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            position: "relative",
            zIndex: 10,
            "@media (max-width: 800px)": {
              height: `calc(42dvh - ${sizes.bottomOffset})`,
            },
          }}
        >
          <Stack
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            {isShowVideo ? (
              <>
                <video
                  src={"/call/girl1_sit_1.webm"}
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 1,
                  }}
                  autoPlay
                  controls={false}
                  muted
                  loop
                  playsInline
                />
                <video
                  src={"/call/girl1_talk_2.webm"}
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: isAiSpeaking ? 1 : 0,
                    transition: "opacity 0.7s ease-in-out",
                  }}
                  autoPlay
                  controls={false}
                  muted
                  loop
                  playsInline
                />
              </>
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
            maxHeight: "220px",
            overflow: "auto",
            "@media (max-width: 800px)": {
              maxHeight: `calc(40dvh - ${sizes.bottomOffset})`,
            },
          }}
        >
          <Stack
            sx={{
              maxWidth: "1000px",
              height: "max-content",
            }}
          >
            <Messages conversation={conversation} />
          </Stack>
        </Stack>
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            width: "100%",
            paddingTop: "20px",
            position: "fixed",
            backgroundColor: "rgba(10, 18, 30, 0.9)",
            paddingBottom: `calc(15px + ${sizes.bottomOffset})`,
            bottom: 0,
          }}
        >
          <IconButton
            sx={{
              backgroundColor: !isMuted ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
              color: !isMuted ? "#fff" : "#222",
              ":hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
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
              ":hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
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
    </>
  );
};
