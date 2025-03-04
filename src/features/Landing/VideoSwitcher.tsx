"use client";

import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeOff } from "lucide-react";

interface VideoBlock {
  src: string;
  description: string;
  buttonTitle: string;
}

const blocks: VideoBlock[] = [
  {
    src: "/begin.mp4",
    buttonTitle: "Beginner",
    description:
      "Practice slow, guided conversations with simpler vocabulary. Perfect for building a solid foundation in any language.",
  },
  {
    src: "/correct.mp4",
    buttonTitle: "Instant Corrections",
    description:
      "Speak freely while the AI teacher highlights mistakes in real time—ideal for fast improvement and building confidence.",
  },
  {
    src: "/advance.mp4",
    buttonTitle: "Advanced",
    description:
      "Enjoy fast-paced, natural conversations to refine fluency and sound like a native speaker. Perfect for challenging your skills.",
  },
];

export const VideoSwitcher = () => {
  const [activePlayingBlock, setActivePlayingBlock] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const onPlayNext = () => {
    setActivePlayingBlock((prev) => (prev + 1) % blocks.length);
  };
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return;

    const timeUpdateHandler = () => {
      const percentage = Math.round((videoNode.currentTime / videoNode.duration) * 100);
      if (percentage >= 99) {
        onPlayNext();
      }
    };

    videoNode.addEventListener("timeupdate", timeUpdateHandler);
    return () => {
      videoNode.removeEventListener("timeupdate", timeUpdateHandler);
    };
  }, []);

  return (
    <Stack
      sx={{
        maxWidth: "1000px",
        width: "100vw",
        flexDirection: "column",
        gap: "20px",
        alignItems: "center",
        paddingBottom: "20px",
        border: "1px solid rgb(43 35 88)",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "rgba(43, 35, 88, 0.01)",
        "@media (max-width: 600px)": {
          borderRadius: "0",
        },
      }}
    >
      <Stack
        sx={{
          width: "100%",
          height: "auto",
          aspectRatio: "4 / 3",
          overflow: "hidden",

          backgroundColor: "rgba(10, 18, 30, 1)",
          position: "relative",
        }}
      >
        <Stack
          sx={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => setIsMuted((prev) => !prev)}
            sx={{
              padding: "90px",
              opacity: isMuted ? 1 : 0,
              backgroundColor: isMuted ? "rgba(0, 0, 0, 0.2)" : "transparent",
              ":hover": {
                opacity: 1,
              },
            }}
          >
            {isMuted ? (
              <Volume2 size={"80px"} color="#fff" />
            ) : (
              <VolumeOff size={"80px"} color="#fff" />
            )}
            <p
              style={{
                position: "absolute",
                color: "transparent",
                fontSize: "0",
              }}
            >
              {isMuted ? "Unmute" : "Mute"}
            </p>
          </IconButton>
        </Stack>
        <video
          src={blocks[activePlayingBlock].src}
          ref={videoRef}
          loop
          autoPlay
          muted={isMuted}
          playsInline
          width="100%"
          style={{
            width: "100%",
            backgroundColor: "rgba(10, 18, 30, 1)",
          }}
        />
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          gap: "10px",
          alignItems: "center",
          "@media (max-width: 600px)": {
            flexDirection: "column",
          },
        }}
      >
        {blocks.map((block, index) => {
          const isPlaying = activePlayingBlock === index;

          return (
            <Button
              key={index}
              size="large"
              color="inherit"
              variant={isPlaying ? "contained" : "outlined"}
              sx={{
                padding: "10px 30px",
                borderRadius: "50px",
                boxShadow: "none",

                backgroundColor: isPlaying ? "rgb(43 35 88)" : "transparent",
                color: isPlaying ? "#fff" : "rgb(43 35 88)",
              }}
              onClick={() => setActivePlayingBlock(index)}
            >
              {block.buttonTitle}
            </Button>
          );
        })}
      </Stack>
      <Stack
        sx={{
          minHeight: "80px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          align="center"
          sx={{
            padding: "0 10px",
            maxWidth: "700px",
            fontSize: "1.1rem",
          }}
        >
          {blocks[activePlayingBlock].description}
        </Typography>
      </Stack>
    </Stack>
  );
};
