import { Button, IconButton, Stack, Typography } from "@mui/material";
import { WebcamDemoSection } from "../../types";
import { Theme, themeMap } from "./theme";
import { H2, SubTitle } from "./Typography";
import { ColorIconTextList } from "@/features/Survey/ColorIconTextList";
import { ArrowRight, CircleArrowRight, CircleCheckBig, Users } from "lucide-react";

import CallEndIcon from "@mui/icons-material/CallEnd";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

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
            width: "max-content",
          }}
        >
          <Stack
            sx={{
              //backgroundColor: "rgba(0, 0, 0, 1)",
              position: "relative",
            }}
          >
            <Stack
              component={"video"}
              width="864"
              height="486"
              autoPlay
              loop
              playsInline
              controls={false}
              muted
              sx={{
                width: "864px",
                height: "486px",
                borderRadius: "12px",
                objectFit: "cover",
                boxShadow: "0 0 20px rgba(0, 0, 0, 1)",
              }}
              src={props.data.webCamPreview.videoUrl}
            />

            <Stack
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
                position: "absolute",
                top: "calc(50% - 60px)",
                left: "-200px",
                width: "calc(100% + 400px)",
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
              }}
            >
              <Typography variant="h6">{props.data.webCamPreview.title}</Typography>
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
                sx={{
                  backgroundColor: true ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
                  color: true ? "#fff" : "#222",
                  ":hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                }}
                size="large"
              >
                {true ? <MicOffIcon /> : <MicIcon />}
              </IconButton>

              <IconButton
                size="large"
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
                sx={{
                  backgroundColor: true ? "rgba(100, 100, 100, 0.4)" : "rgb(250 222 220)",
                  color: true ? "#fff" : "#222",
                  ":hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" },
                }}
                size="large"
              >
                {true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Stack>
          </Stack>
          <Stack
            sx={{
              width: "100%",
              gap: "25px",
              paddingTop: "20px",
            }}
          >
            <Typography
              align="left"
              sx={{
                width: "100%",
                maxWidth: "700px",
                fontSize: "20px",
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
                    fontSize: "16px",
                    padding: "12px 30px",
                  }}
                  startIcon={<VideocamIcon />}
                  endIcon={<ArrowRight />}
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
      }}
    >
      {isDone && <CircleCheckBig size={"27px"} color="rgb(96, 165, 250)" />}
      {!isDone && <CircleArrowRight size={"27px"} color="rgba(255, 255, 255, 0.6)" />}

      <Typography align="center" sx={{ fontSize: "18px", fontWeight: 500, paddingTop: "10px" }}>
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
