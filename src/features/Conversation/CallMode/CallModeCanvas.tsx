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
import { Avatar, IconButton, Stack, Typography } from "@mui/material";
import { Messages } from "../Messages";
import { WebCamFooter } from "./WebCamFooter";

const girlVoices: AiVoice[] = ["ash", "ballad", "coral", "shimmer"];

export const CallModeCanvas = ({
  conversation,
  stopCallMode,
  isMuted,
  setIsMuted,
  voice,
}: {
  conversation: ChatMessage[];
  stopCallMode: () => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  voice: AiVoice | null;
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
              <video
                src={"/call/3.mp4"}
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                autoPlay
                controls={false}
                muted
                loop
                playsInline
              />
            ) : (
              <>
                <Stack
                  sx={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    background: "url('/blur/2.jpg')",
                    backgroundSize: "cover",
                    opacity: 0.57,
                  }}
                ></Stack>

                <Stack
                  sx={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack
                    sx={{
                      borderRadius: "50%",
                      overflow: "hidden",
                      padding: "0",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <Avatar
                      alt={""}
                      src={"/blog/whippet-prediction.png"}
                      sx={{
                        width: "110px",
                        height: "110px",
                        borderRadius: "50%",
                        fontSize: "10px",
                      }}
                    />
                  </Stack>
                </Stack>
              </>
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
              <>
                <Stack
                  sx={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    background: "url('/blur/5.jpg')",
                    backgroundSize: "cover",
                    opacity: 0.57,
                  }}
                ></Stack>

                <Stack
                  sx={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack
                    sx={{
                      borderRadius: "50%",
                      overflow: "hidden",
                      padding: "0",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <Avatar
                      alt={""}
                      src={userPhoto}
                      sx={{
                        width: "110px",
                        height: "110px",
                        borderRadius: "50%",
                        fontSize: "10px",
                      }}
                    />
                  </Stack>
                </Stack>
              </>
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
                webCam.resetWebCam();
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
