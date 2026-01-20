"use client";

import { Button, IconButton, Stack, Typography } from "@mui/material";
import { RefObject, useEffect, useRef, useState } from "react";
import { Volume2, VolumeOff } from "lucide-react";

export interface VideoBlock {
  src: string;
  description: string;
  buttonTitle: string;
}

export function useIsVisible(ref?: RefObject<HTMLDivElement | null> | null) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref || !ref.current) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}

interface VideoSwitcherProps {
  blocks: VideoBlock[];
}
export const VideoSwitcher: React.FC<VideoSwitcherProps> = ({ blocks }) => {
  const [activePlayingBlock, setActivePlayingBlock] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVisible = useIsVisible(containerRef);

  const onPlayNext = () => {
    setActivePlayingBlock((prev) => (prev + 1) % blocks.length);
  };
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return;

    const timeUpdateHandler = () => {
      const percentage = Math.round(
        (videoNode.currentTime / videoNode.duration) * 100,
      );
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
      ref={containerRef}
      sx={{
        maxWidth: "900px",
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
          muted={isMuted || !isVisible}
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
