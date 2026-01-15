"use client";
import { Button, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { AiAvatarVideo } from "@/features/Conversation/CallMode/AiAvatarVideo";
import { AvatarVideo } from "@/features/Conversation/CallMode/types";

interface ActiveLessonCardProps {
  title: string;
  subTitle: string;
  descriptionTop?: string;
  descriptionBottom?: string;
  actionLabel: string;
  onAction: () => void;
  aiVideo: AvatarVideo;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  delayToShow?: number;
}

export const ActiveLessonCard = ({
  title,
  subTitle,
  descriptionTop,
  descriptionBottom,
  actionLabel,
  onAction,
  aiVideo,
  startIcon,
  endIcon,
  delayToShow = 0,
}: ActiveLessonCardProps) => {
  return (
    <Stack
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        textDecoration: "none",

        borderRadius: "16px",
        gap: "20px",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative",
        overflow: "hidden",

        minHeight: "380px",
        opacity: 0,
        animation: `fadeInOpacity  1.2s ease ${delayToShow}ms forwards`,

        userSelect: "text",
        color: "#fff",

        display: "grid",
        gridTemplateColumns: "1fr 1fr",

        padding: "0px 20px 0px 0px",
        gridTemplateRows: "auto",
        gridTemplateAreas: `
					'preview content'
				`,
        "@media (max-width: 600px)": {
          border: "none",
          borderRadius: "0",
          backgroundColor: "rgba(255, 255, 255, 0.01)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "0px 0px 25px 0px",
          gridTemplateColumns: "1fr",

          gridTemplateAreas: `
						'preview'
						'content'
					`,
        },
      }}
    >
      {/* Left preview */}
      <Stack
        className="preview"
        sx={{
          gridArea: "preview",
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          minHeight: "300px",
          height: "100%",
          backgroundColor: "#0a121e",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
          transition: "transform 0.3s ease",
          "@media (max-width: 600px)": {
            borderRadius: "0px",
          },
        }}
      >
        <Stack
          sx={{
            position: "absolute",
            inset: 0,
          }}
        >
          <AiAvatarVideo aiVideo={aiVideo} isSpeaking={false} />
        </Stack>
      </Stack>

      {/* Right content */}
      <Stack
        sx={{
          gridArea: "content",
          gap: "16px",
          alignItems: "flex-start",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
          padding: "10px",
          "@media (max-width: 600px)": {
            padding: "20px 15px 0px 15px",
          },
        }}
      >
        <Stack>
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "0.92rem",
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            {subTitle}
          </Typography>

          <Typography
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: "1.9rem",
              lineHeight: "2.3rem",
              paddingTop: "6px",
              "@media (max-width: 750px)": {
                fontSize: "1.6rem",
                lineHeight: "1.9rem",
              },
            }}
          >
            {title}
          </Typography>

          {descriptionTop && (
            <Typography
              sx={{
                opacity: 0.85,
                paddingTop: "10px",
                fontSize: "1.05rem",
                lineHeight: "1.5rem",
              }}
            >
              {descriptionTop}
            </Typography>
          )}

          {descriptionBottom && (
            <Typography
              sx={{
                opacity: 0.85,
                paddingTop: "10px",
                fontSize: "1.05rem",
                lineHeight: "1.5rem",
              }}
            >
              {descriptionBottom}
            </Typography>
          )}
        </Stack>

        <Stack sx={{ paddingTop: "6px" }}>
          <Button
            startIcon={startIcon}
            endIcon={endIcon}
            variant="contained"
            onClick={onAction}
            size="large"
            sx={{
              minWidth: "130px",
              //borderRadius: "14px",
              //padding: "14px 22px",
              //fontWeight: 600,
              //textTransform: "none",
              //background: "linear-gradient(90deg, rgba(46, 193, 233, 1), rgba(0, 166, 255, 1))",
            }}
            color="info"
          >
            {actionLabel}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
