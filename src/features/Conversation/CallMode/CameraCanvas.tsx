import { AiVoice } from "@/common/ai";
import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { useWebCam } from "../../webCam/useWebCam";
import { useAuth } from "../../Auth/useAuth";
import { Stack } from "@mui/material";
import { Messages } from "../Messages";
import { WebCamFooter } from "./WebCamFooter";
import { UserPreviewStatic } from "./UserPreviewStatic";
import { AvatarVideo } from "./types";
import { AiAvatarVideo } from "./AiAvatarVideo";
import { CallButtons } from "./CallButtons";

const girlVoices: AiVoice[] = ["alloy", "coral", "sage", "shimmer"];

const girl1: AvatarVideo = {
  sitVideoUrl: ["/call/girl_2/sit.webm", "/call/girl_2/sit2.webm"],
  talkVideoUrl: ["/call/girl_2/talk.webm", "/call/girl_2/talk2.webm"],
};

const boy1: AvatarVideo = {
  sitVideoUrl: ["/call/boy_1/sit.webm"],
  talkVideoUrl: ["/call/boy_1/talk.webm", "/call/boy_1/talk2.webm"],
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
              boxShadow:
                "0 14px 20px 5px rgba(10, 18, 30, 1), inset 0 0 0 10px rgba(10, 18, 30, 1)",
              borderRadius: "0px",
              gap: "10px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              position: "relative",
              zIndex: 1,
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
                paddingBottom: "30px",
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
          <CallButtons
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isWebCamEnabled={webCam.isWebCamEnabled}
            toggleWebCam={(isToggleOn: boolean) => {
              if (isToggleOn) {
                webCam.init();
              } else {
                webCam.disconnect();
              }
            }}
            exit={stopCallMode}
          />
        </Stack>
      </Stack>
    </>
  );
};
