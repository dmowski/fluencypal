"use client";
import { createContext, useContext, useRef, useState, ReactNode, JSX, RefObject } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendImageAiRequest } from "../Ai/sendImageAiRequest";
import { useSettings } from "../Settings/useSettings";

interface WebCamContextType {
  init: () => Promise<void>;
  screenshot: () => string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  isWebCamEnabled: boolean;
  getImageDescription: () => Promise<string | null>;
}

const WebCamContext = createContext<WebCamContextType | null>(null);

function useProvideWebCam(): WebCamContextType {
  const videoRef = useRef<HTMLVideoElement>(null);
  const auth = useAuth();
  const [stream, setStream] = useState<MediaStream | null>(null);

  const settings = useSettings();

  const init = async () => {
    if (stream) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const screenshotJpg = (): string | null => {
    const maxWidth = 640;
    const quality = 0.6;
    if (!videoRef.current) return null;

    const video = videoRef.current;

    const scale = maxWidth / video.videoWidth;
    const width = Math.min(video.videoWidth, maxWidth);
    const height = video.videoHeight * scale;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);

    // Convert to JPEG with reduced quality
    return canvas.toDataURL("image/jpeg", quality); // 0.6 = 60% quality
  };

  const screenshot = (): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  const getImageDescription = async () => {
    const authKey = await auth.getToken();
    const screenShot = screenshot();
    if (!screenShot) {
      console.error("No screenshot available");
      return "";
    }

    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error("Language is not set | useProvideTextAi.generate");
    }

    const response = await sendImageAiRequest(
      {
        imageBase64: screenShot,
        languageCode,
      },
      authKey
    );

    return response.aiImageResponse;
  };

  return {
    init,
    screenshot,
    videoRef,
    isWebCamEnabled: !!stream,
    getImageDescription,
  };
}

export function WebCamProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideWebCam();
  return <WebCamContext.Provider value={hook}>{children}</WebCamContext.Provider>;
}

export const useWebCam = (): WebCamContextType => {
  const context = useContext(WebCamContext);
  if (!context) {
    throw new Error("useWebCam must be used within a WebCamProvider");
  }
  return context;
};
