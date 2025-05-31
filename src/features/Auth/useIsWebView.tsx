"use client";

import { useEffect, useState } from "react";

export const isInAppBrowser = (ua: string): boolean => {
  return (
    ua.includes("instagram") ||
    ua.includes("tginternal") || // Telegram Android in-app
    ua.includes("tgapp") || // Possible Telegram identifier
    ua.includes("telegram") ||
    ua.includes("fbav") || // Facebook app
    ua.includes("fb_iab") // Facebook in-app browser
  );
};

export const getIsTelegram = () => {
  return {
    isTgAndroid: "TelegramWebview" in window,
    isTgIos: "TelegramWebviewProxy" in window || "TelegramWebviewProxyProto" in window,
  };
};

export const isTikTokWebView = () => {
  const isWindow = typeof window !== "undefined";
  if (!isWindow) return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("tiktok") ||
    ua.includes("bytedance") ||
    ua.includes("bytelocale") ||
    ua.includes("musical_ly")
  );
};

export const useIsWebView = () => {
  const [isAndroid, setIsAndroid] = useState(false);
  const [agent, setAgent] = useState("");
  const [isTelegram, setIsTelegram] = useState(false);

  const [inWebView, setIsWebView] = useState(false);
  const [isTiktok, setIsTikTok] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isTelegramWebView = getIsTelegram();
      const ua = navigator.userAgent.toLowerCase();
      const supportsWebRTC = !!window.RTCPeerConnection;
      console.log("supportsWebRTC", supportsWebRTC);
      //const result = inAppSpy();
      /*
      setAgent(
        ua +
          " | supportsWebRTC:" +
          (supportsWebRTC ? "TRUE" : "FALSE") +
          "| INFO" +
          JSON.stringify(result)
      );*/

      const isTiktokWebView = isTikTokWebView();
      setIsWebView(
        isTelegramWebView.isTgAndroid ||
          isTelegramWebView.isTgIos ||
          isInAppBrowser(ua) ||
          isTiktokWebView
      );
      setIsTelegram(isTelegramWebView.isTgAndroid || isTelegramWebView.isTgIos);
      setIsAndroid(isTelegramWebView.isTgAndroid || ua.includes("android"));
      setIsTikTok(isTiktokWebView);
    }
  }, []);

  return {
    isAndroid,
    agent,
    inWebView,
    isTelegram,
  };
};
