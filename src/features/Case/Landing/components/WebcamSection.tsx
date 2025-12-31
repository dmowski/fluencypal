import { Button, IconButton, Stack, Typography } from "@mui/material";
import { WebcamDemoSection } from "../../types";
import { Theme, themeMap } from "./theme";
import { H2, SubTitle } from "./Typography";
import { ColorIconTextList } from "@/features/Survey/ColorIconTextList";
import { ArrowRight, CircleArrowRight, CircleCheckBig, MoveRight, Users } from "lucide-react";

import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";

import VideocamIcon from "@mui/icons-material/Videocam";

export const WebCamButtons = () => {
  return (
    <Stack
      sx={{
        position: "absolute",
        left: "0px",
        bottom: "0px",
        alignItems: "center",
        width: "100%",
        padding: "10px 0",
        flexDirection: "row",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <IconButton
        aria-label="Turn microphone"
        sx={{
          backgroundColor: "rgba(100, 100, 100, 0.4)",
          color: "#fff",
        }}
        size="large"
      >
        <MicOffIcon />
      </IconButton>

      <IconButton
        size="large"
        aria-label="End call"
        sx={{
          width: "70px",
          borderRadius: "30px",
          backgroundColor: "#dc362e",
          ":hover": { backgroundColor: "rgba(255, 0, 0, 0.7)" },
        }}
      >
        <CallEndIcon />
      </IconButton>

      <IconButton
        aria-label="Turn camera"
        sx={{
          backgroundColor: "rgba(100, 100, 100, 0.4)",
          color: "#fff",
        }}
        size="large"
      >
        <VideocamIcon />
      </IconButton>
    </Stack>
  );
};

export interface WebcamSectionProps {
  data: WebcamDemoSection;
  theme: Theme;
  id: string;
  buttonHref?: string;
}
export const WebcamSection = (props: WebcamSectionProps) => {
  const colors = themeMap[props.theme];

  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        width: "100%",
        backgroundColor: colors.sectionBgColor,
        color: colors.textColor,

        "@media (max-width: 600px)": {
          padding: "90px 0 50px 0",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "1300px",
          width: "100%",
          gap: "24px",
          padding: "0 10px",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
          }}
        >
          <H2>{props.data.title}</H2>
          <SubTitle>{props.data.subTitle}</SubTitle>
        </Stack>

        <Stack
          sx={{
            gap: "14px",
            marginTop: "26px",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              //backgroundColor: "rgba(0, 0, 0, 1)",
              position: "relative",
            }}
          >
            <Stack
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <Stack
                component={"video"}
                autoPlay
                loop
                playsInline
                controls={false}
                muted
                sx={{
                  width: "864px",
                  aspectRatio: "16/9",
                  maxWidth: "100%",
                  borderRadius: "12px",
                  objectFit: "cover",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 1)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  "@media (max-width: 1300px)": {
                    width: "calc(100vw - 420px)",
                  },

                  "@media (max-width: 1000px)": {
                    width: "100%",
                    borderRadius: "12px 12px 0 0",
                  },
                }}
                src={props.data.webCamPreview.videoUrl}
              />
              <WebCamButtons />
            </Stack>

            <Stack
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
                position: "absolute",
                top: "calc(50% - 60px)",
                left: "-200px",
                width: "calc(100% + 400px)",
                "@media (max-width: 1000px)": {
                  position: "relative",
                  top: "0",
                  left: "0",
                  width: "100%",
                  gap: "1px",
                },
              }}
            >
              <NavigationBlock
                title={props.data.webCamPreview.beforeSectionTitle}
                subTitle={props.data.webCamPreview.beforeSectionSubTitle}
                isDone
              />

              <NavigationBlock
                title={props.data.webCamPreview.afterSectionTitle}
                subTitle={props.data.webCamPreview.afterSectionSubTitle}
              />
            </Stack>

            <Stack
              sx={{
                position: "absolute",
                top: "15px",
                left: "20px",
                zIndex: 1,
              }}
            >
              <Typography variant="h6" component={"span"}>
                {props.data.webCamPreview.title}
              </Typography>
              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <Users size={"12px"} />
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                  }}
                >
                  {props.data.webCamPreview.participants}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            sx={{
              width: "auto",
              gap: "25px",
              paddingTop: "20px",
            }}
          >
            <Typography
              align="left"
              sx={{
                display: "flex",
                width: "100%",

                fontSize: "20px",
                maxWidth: "864px",
                "@media (max-width: 1300px)": {
                  maxWidth: "calc(100vw - 420px)",
                },
                "@media (max-width: 1000px)": {
                  maxWidth: "100vw",
                },
              }}
            >
              {props.data.content}
            </Typography>
            <ColorIconTextList listItems={props.data.infoList} iconSize="22px" />

            {props.data.buttonTitle && props.buttonHref && (
              <Stack>
                <Button
                  href={props.buttonHref}
                  variant="contained"
                  size="large"
                  color="info"
                  sx={{
                    marginTop: "12px",
                    width: "max-content",
                    borderRadius: "48px",
                    fontSize: "1rem",
                    padding: "12px 30px",
                  }}
                  startIcon={<VideocamIcon />}
                  endIcon={<MoveRight />}
                >
                  {props.data.buttonTitle}
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

const NavigationBlock = ({
  title,
  subTitle,
  isDone,
}: {
  title: string;
  subTitle: string;
  isDone?: boolean;
}) => {
  return (
    <Stack
      sx={{
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: "20px 12px 18px 12px",
        borderRadius: isDone ? "12px 0 0 12px" : "0 12px 12px 0",
        width: "200px",
        position: "relative",
        zIndex: 0,
        "@media (max-width: 1000px)": {
          width: "100%",
          borderRadius: isDone ? "0 0 0 12px" : "0 0 12px 0",
          padding: "32px 5px 18px 5px",
          marginTop: "-10px",
        },
      }}
    >
      {isDone && <CircleCheckBig size={"27px"} color="rgb(96, 165, 250)" />}
      {!isDone && <CircleArrowRight size={"27px"} color="rgba(255, 255, 255, 0.6)" />}

      <Typography
        align="center"
        sx={{
          fontSize: "18px",
          fontWeight: 500,
          paddingTop: "10px",
          "@media (max-width: 1100px)": {
            fontSize: "16px",
          },
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="caption"
        align="center"
        sx={{
          textTransform: "uppercase",
          opacity: 0.6,
        }}
      >
        {subTitle}
      </Typography>
    </Stack>
  );
};
