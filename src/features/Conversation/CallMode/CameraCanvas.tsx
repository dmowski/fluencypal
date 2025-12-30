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
import { WebCamView } from "@/features/webCam/WebCamView";
import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { sleep } from "@/libs/sleep";

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
  onWebCamDescription,
}: {
  conversation: ChatMessage[];
  stopCallMode: () => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  voice: AiVoice | null;
  isAiSpeaking: boolean;
  messageOrder: MessagesOrderMap;
  onWebCamDescription: (description: string) => void;
}) => {
  const sizes = useWindowSizes();
  const { i18n } = useLingui();
  const webCam = useWebCam();

  const [isWebCamEnabled, setIsWebCamEnabled] = useState<boolean>(true);

  const auth = useAuth();
  const userPhoto = auth.userInfo?.photoURL || "";
  const myUserName = auth.userInfo?.displayName || auth.userInfo?.email || "You";
  const aiVideo: AvatarVideo | null = voice ? (girlVoices.includes(voice) ? girl1 : boy1) : null;

  const footerHeight = `calc(80px + ${sizes.bottomOffset})`;

  const topHeight = `50dvh`;
  const topHeightMobile = `40dvh`;

  const isTimeToScreenshots =
    isWebCamEnabled &&
    webCam.isWebCamEnabled &&
    !webCam.loading &&
    !webCam.isError &&
    conversation.length > 0;

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [screenshotTimer, setScreenshotTimer] = useState<number>(0);

  const analyzeWebcam = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const imageDescription = await webCam.getImageDescription();
      if (imageDescription) {
        console.log("WEBCAM DESCRIPTION", imageDescription);
        onWebCamDescription(imageDescription);
      }
    } catch (err) {
      console.log("Error getting webcam description:", err);
    } finally {
      setIsAnalyzing(false);
    }

    await sleep(isAiSpeaking ? 3000 : 1000);
    setScreenshotTimer((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isTimeToScreenshots) return;
    analyzeWebcam();
  }, [isTimeToScreenshots, isAiSpeaking, screenshotTimer]);

  return (
    <>
      <Stack
        sx={{
          gap: "0px",
          width: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            padding: "10px 10px 0px 10px",
            boxShadow: "0 14px 20px 5px rgba(10, 18, 30, 1)",
            backgroundColor: "rgba(10, 18, 30, 0.91)",
            borderRadius: "0px",
            gap: "10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            position: "fixed",
            top: 0,
            height: topHeight,
            zIndex: 1,
            "@media (max-width: 800px)": {
              height: topHeightMobile,
            },
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
            onClick={async () => {
              console.log("CLICK ON WEBCAM TO GET IMAGE DESCRIPTION");
              const start = performance.now();
              const imageDescription = await webCam.getImageDescription();
              const end = performance.now();
              console.log("Image description time:", end - start, "ms");
              console.log(imageDescription);
              if (imageDescription) {
                onWebCamDescription(imageDescription);
              }
            }}
          >
            <Stack
              sx={{
                position: "absolute",
                top: "20px",
                left: "20px",
                zIndex: 2,
                opacity: isAnalyzing ? 1 : 0,
              }}
            >
              <ScanLine size={"13px"} color="#fff" />
            </Stack>
            {isWebCamEnabled && <WebCamView />}
            {!isWebCamEnabled && (
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
            paddingTop: topHeight,
            paddingBottom: footerHeight,
            "@media (max-width: 800px)": {
              paddingTop: topHeightMobile,
            },
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
            isWebCamEnabled={isWebCamEnabled}
            toggleWebCam={(isToggleOn: boolean) => {
              if (isToggleOn) {
                setIsWebCamEnabled(true);
              } else {
                setIsWebCamEnabled(false);
              }
            }}
            exit={stopCallMode}
          />
        </Stack>
      </Stack>
    </>
  );
};
