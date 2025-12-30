"use client";
import { createContext, useContext, useRef, useState, ReactNode, JSX, RefObject } from "react";
import { useAuth } from "../Auth/useAuth";
import { sendImageAiRequest } from "../Ai/sendImageAiRequest";
import { useSettings } from "../Settings/useSettings";
import { sleep } from "@/libs/sleep";

interface WebCamContextType {
  init: () => Promise<void>;
  screenshot: () => string | null;
  component: JSX.Element;
  isWebCamEnabled: boolean;
  loading: boolean;
  getImageDescription: () => Promise<string | null>;
  disconnect: () => void;
}

const WebCamContext = createContext<WebCamContextType | null>(null);

function useProvideWebCam(): WebCamContextType {
  const videoRef = useRef<HTMLVideoElement>(null);
  const auth = useAuth();
  const stream = useRef<MediaStream | null>(null);
  const settings = useSettings();
  const [loading, setLoading] = useState<boolean>(false);
  const isInit = useRef<boolean>(false);

  const init = async () => {
    if (stream.current || isInit.current) return;
    isInit.current = true;
    setLoading(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.current = mediaStream;
      await sleep(3000);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 900);
    }
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
    if (!authKey) {
      console.error("No auth key available");
      return "";
    }
    const start = performance.now();
    const screenShot = screenshot();
    const end = performance.now();

    if (!screenShot) {
      console.error("No screenshot available");
      return "";
    }

    console.log("Screenshot time:", end - start, "ms");
    console.log("Screenshot size", (screenShot?.length || 10) / 1000);

    const languageCode = settings.languageCode || "en";

    const response = await sendImageAiRequest(
      {
        imageBase64: screenShot,
        languageCode,
      },
      authKey
    );
    return response.aiImageResponse;
  };

  const disconnect = () => {
    if (stream.current) {
      stream.current.getTracks().forEach((track) => {
        track.stop();
      });
      stream.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    isInit.current = false;
  };

  return {
    init,
    loading,
    screenshot,
    isWebCamEnabled: !!stream,
    getImageDescription,
    disconnect,
    component: (
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          display: stream ? "block" : "none",
        }}
        autoPlay
        controls={false}
        muted
        playsInline
      />
    ),
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
