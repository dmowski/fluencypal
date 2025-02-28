"use client";

import { Button, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { subTitleFontSize } from "./landingSettings";

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
        backgroundColor: "rgb(0, 0, 0, 0.01)",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          height: "auto",
          aspectRatio: "4 / 3",
          overflow: "hidden",

          backgroundColor: "rgba(10, 18, 30, 1)",
        }}
      >
        <video
          src={blocks[activePlayingBlock].src}
          ref={videoRef}
          loop
          autoPlay
          muted
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
            fontSize: subTitleFontSize,
          }}
        >
          {blocks[activePlayingBlock].description}
        </Typography>
      </Stack>
    </Stack>
  );
};
