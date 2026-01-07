"use client";
import { Button, Stack, Typography } from "@mui/material";
import { Check, ChevronRight, Loader, Telescope } from "lucide-react";

import { ReactNode, useEffect, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { goFullScreen } from "@/libs/fullScreen";
import { useUrlParam } from "../Url/useUrlParam";
import { useWebCam } from "../webCam/useWebCam";
import { WebCamView } from "../webCam/WebCamView";
import { ConversationMode } from "@/common/user";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";

interface PlanCardProps {
  id: string;
  title: string;
  subTitle: string;
  details: string;
  description: string;
  onClick: ({
    conversationMode,
    webCamDescription,
  }: {
    conversationMode: ConversationMode;
    webCamDescription?: string;
  }) => Promise<void>;
  startColor: string;
  endColor: string;
  bgColor: string;
  icon: ReactNode;
  actionLabel: string;
  progressPercent?: number;
  delayToShow: number;
  isDone: boolean;
  isActive?: boolean;
  isLast?: boolean;
  isContinueLabel: boolean;
  viewOnly?: boolean;

  isLimited?: boolean;
  onLimitedClick?: () => void;
}

export const PlanCard = ({
  id,
  title,
  subTitle,
  description,
  progressPercent,
  onClick,
  startColor,
  endColor,
  bgColor,
  icon,
  details,
  isDone,
  delayToShow,
  isActive,
  isLast,
  isContinueLabel,
  viewOnly = false,
  isLimited,
  onLimitedClick,
}: PlanCardProps) => {
  const uniqKey = `plan-start-${id}`;
  const [showModal, setShowModal] = useUrlParam(uniqKey);
  const { i18n } = useLingui();
  const webcam = useWebCam();

  const [isLoadingCall, setIsLoadingCall] = useState<boolean>(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false);
  const isNextInPlan = !isActive && !isDone;

  const [allowWebCam, setAllowWebCam] = useState<boolean | null>(null);
  useEffect(() => {
    if (allowWebCam === false) {
      setAllowWebCam(null);
    }
  }, [showModal]);

  const onStartCallMode = async () => {
    if (viewOnly) return;
    setIsLoadingCall(true);
    goFullScreen();
    let imageDescription = "";
    try {
      imageDescription = allowWebCam ? (await webcam.getImageDescription()) || "" : "";
    } catch (error) {
      console.error("Error getting image description:", error);
    }

    await onClick({
      conversationMode: "call",
      webCamDescription: imageDescription || "",
    });
    setIsLoadingCall(false);
    setShowModal(false);
  };

  const onStartVoiceOnly = async () => {
    if (viewOnly) return;
    setIsLoadingVoice(true);
    goFullScreen();

    await onClick({
      conversationMode: "record",
    });
    setIsLoadingVoice(false);
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <CustomModal isOpen={true} onClose={() => setShowModal(false)}>
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
                  disabled={
                    isLoadingCall || isLoadingVoice || webcam.loading || allowWebCam === null
                  }
                >
                  {i18n._(`Start Call`)}
                </Button>

                <Button
                  onClick={onStartVoiceOnly}
                  variant="text"
                  color="info"
                  startIcon={isLoadingVoice ? <Loader /> : <MicIcon />}
                  disabled={
                    isLoadingCall || isLoadingVoice || webcam.loading || allowWebCam === null
                  }
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
      )}

      <Stack
        onClick={() => {
          if (viewOnly) return;

          setShowModal(true);
        }}
        component={"button"}
        sx={{
          backgroundColor: isActive
            ? "rgba(13, 220, 196, 0.14)"
            : isDone
              ? "rgba(13, 220, 196, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          textDecoration: "none",
          padding: "9px 16px 11px 16px",
          display: "grid",

          gridTemplateColumns: "max-content 1fr max-content",
          gridTemplateRows: "auto",
          gridTemplateAreas: details
            ? `
            'icon title chevron'
            'icon details chevron'
          `
            : `
            'icon title chevron'
            'icon title chevron'
          `,
          gap: "0px 20px",
          borderRadius: "8px",

          alignItems: "center",
          justifyContent: "space-between",
          border:
            !isActive && !isDone
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.0)",
          maxWidth: "700px",
          position: "relative",

          opacity: 0,
          transition: "background 0.3s ease",
          transform: "scale(1)",
          animation: `fadeInOpacity  1.6s ease ${delayToShow}ms forwards`,

          userSelect: "text",
          color: "#fff",

          ...(viewOnly
            ? {}
            : {
                cursor: "pointer",
                ":hover": {
                  backgroundColor: isActive
                    ? "rgba(13, 220, 196, 0.2)"
                    : isDone
                      ? "rgba(13, 220, 196, 0.15)"
                      : "rgba(13, 220, 196, 0.008)",
                  "@media (max-width: 450px)": {
                    backgroundColor: "rgba(13, 220, 196, 0.1)",
                  },
                },
              }),

          "@media (max-width: 500px)": {
            gap: "13px 20px",
            padding: "16px 16px 26px 16px",
            gridTemplateAreas: isActive
              ? `
            'icon title chevron'
            ${details ? "'details details details'" : ""}
          `
              : `
            'icon title title'
            ${details ? "'details details details'" : ""}
          `,
          },
        }}
      >
        <Stack
          sx={{
            width: "2px",
            borderRadius: "0px",
            "--height": `100%`,
            top: "50%",
            left: "49px",
            height: "var(--height)",
            backgroundColor:
              isNextInPlan || isContinueLabel ? "rgba(255, 255, 255, 0)" : "rgba(13, 220, 196, 1)",
            position: "absolute",
            display: isLast ? "none" : "block",

            zIndex: 0,
            "@media (max-width: 500px)": {
              display: "none",
            },
          }}
        ></Stack>

        <Stack
          sx={{
            padding: "4px",
            borderRadius: "100px",
            gridArea: "icon",

            boxShadow: isDone
              ? "0px 0px 0 2px rgba(13, 220, 196, 1)"
              : isActive
                ? "0px 0px 0 2px rgba(13, 220, 196, 1)"
                : "0px 0px 0 1px rgba(255, 255, 255, 0.1)",
            boxSizing: "border-box",
            width: "max-content",
            position: "relative",
            backgroundColor: "#111",
          }}
        >
          {isDone && (
            <Stack
              sx={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                backgroundColor: "rgb(9, 108, 96)",
                boxShadow: "0px 0px 0 2px rgba(13, 220, 196, 1)",
                width: "20px",
                height: "20px",
                borderRadius: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 20000,
              }}
            >
              <Check size={"12px"} strokeWidth={"3px"} />
            </Stack>
          )}
          {isContinueLabel && (
            <Stack
              sx={{
                position: "absolute",
                top: "-20px",
                left: "0",
                right: "0",
                margin: "auto",

                width: "100%",

                boxSizing: "border-box",
                padding: "0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 20000,
              }}
            >
              <Typography
                sx={{
                  backgroundColor: "rgb(9, 108, 96)",
                  padding: "2px 5px",
                  borderRadius: "5px",
                }}
                variant="caption"
              >
                {i18n._("Continue")}
              </Typography>
              <Stack
                sx={{
                  position: "absolute",
                  bottom: "-4px",

                  margin: "auto",
                  left: "0px",
                  right: "0px",
                  width: "10px",
                  height: "10px",
                  backgroundColor: "rgb(9, 108, 96)",

                  borderRadius: "1px",
                  transform: "rotate(45deg)",
                  zIndex: -2,
                }}
              ></Stack>
            </Stack>
          )}

          <Stack
            sx={{
              boxSizing: "border-box",
              padding: "10px 5px 0px 5px",
              width: "max-content",
              bottom: "0px",
              right: "0px",
              zIndex: 2,
              position: "relative",
              overflow: "hidden",

              borderRadius: "100px",

              ".avatar": {
                transition: "all 0.4s ease",
                opacity: 1,

                img: {
                  width: "50px",
                  height: "50px",
                  "@media (max-width: 450px)": {
                    width: "35px",
                    height: "35px",
                  },
                },
              },
            }}
          >
            <Stack
              sx={{
                position: "relative",
                zIndex: 2,
                top: "0px",
                left: "0px",

                opacity: isActive || isDone ? 1 : 0.95,
              }}
            >
              {icon}
            </Stack>

            <Stack
              sx={{
                backgroundColor: startColor,
                width: "320px",
                height: "120px",
                borderRadius: "40px",
                filter: "blur(50px)",

                position: "absolute",
                top: "-40px",
                left: "-20px",
                zIndex: 1,
                opacity: isActive || isDone ? 0.9 : 0.8,
              }}
            ></Stack>

            {(isActive || isDone) && (
              <>
                <Stack
                  sx={{
                    backgroundColor: endColor,
                    width: "320px",
                    height: "120px",
                    borderRadius: "40px",
                    filter: "blur(80px)",

                    position: "absolute",
                    bottom: "-40px",
                    right: "-20px",
                    zIndex: 1,
                    opacity: 0.9,
                  }}
                ></Stack>

                <Stack
                  sx={{
                    backgroundColor: bgColor,
                    width: "100%",
                    height: "100%",

                    position: "absolute",
                    bottom: "0px",
                    left: "0px",
                    zIndex: 0,
                    opacity: 0.1,
                  }}
                ></Stack>

                <Stack
                  sx={{
                    backgroundColor: "rgba(10, 18, 30, 1)",
                    width: "100%",
                    height: "100%",

                    position: "absolute",
                    bottom: "0px",
                    left: "0px",
                    zIndex: -1,
                    opacity: 1,
                  }}
                ></Stack>
              </>
            )}
          </Stack>
        </Stack>

        <Stack
          sx={{
            gridArea: "title",

            width: "100%",
            maxWidth: "90%",
          }}
        >
          <Typography
            align="left"
            sx={{
              fontWeight: 600,
              fontSize: "0.82rem",
              color: isActive || isDone ? `rgba(67, 244, 223, 0.9)` : `rgba(67, 244, 223, 0.5)`,
            }}
          >
            {subTitle}
          </Typography>

          <Typography
            align="left"
            sx={{
              fontWeight: 500,
              fontSize: "1.2rem",
              lineHeight: "1.4rem",
              position: "relative",
              zIndex: 2,
              opacity: isActive || isDone ? 1 : 0.9,
              paddingBottom: "3px",

              "@media (max-width: 450px)": {
                fontSize: "0.8rem",
              },
            }}
          >
            {title}
          </Typography>
        </Stack>

        {details && (
          <Typography
            align="left"
            sx={{
              gridArea: "details",

              fontWeight: 400,
              fontSize: "0.82rem",
              lineHeight: "1.1rem",
              zIndex: 2,
              height: isNextInPlan ? "auto" : "54px",
              paddingBottom: isNextInPlan ? "8px" : 0,
              overflow: "hidden",
              opacity: isActive || isDone ? 0.9 : 0.8,

              "@media (max-width: 500px)": {
                overflow: "hidden",
                height: "auto",
                paddingTop: "10px",
                textOverflow: "ellipsis",
              },
            }}
          >
            {details}
          </Typography>
        )}

        {isActive && (
          <Stack
            sx={{
              borderRadius: "50%",

              gridArea: "chevron",
              display: isActive ? "flex" : "none",
              background: isActive
                ? "linear-gradient(45deg,rgb(13, 220, 196) 0%,rgba(13, 180, 236, 0.59) 100%)"
                : "",
              height: "45px",
              width: "45px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isActive ? <ChevronRight size={"25px"} /> : <Check />}
          </Stack>
        )}
      </Stack>
    </>
  );
};
