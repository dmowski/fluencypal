'use client';

import { isTMA } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';

export const isInAppBrowser = (ua: string): boolean => {
  return (
    ua.includes('instagram') ||
    ua.includes('tginternal') || // Telegram Android in-app
    ua.includes('tgapp') || // Possible Telegram identifier
    ua.includes('telegram') ||
    ua.includes('fbav') || // Facebook app
    ua.includes('fb_iab') // Facebook in-app browser
  );
};

export const getIsTelegram = () => {
  return {
    isTgAndroid: 'TelegramWebview' in window,
    isTgIos: 'TelegramWebviewProxy' in window || 'TelegramWebviewProxyProto' in window,
  };
};

export const isTikTokWebView = () => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('tiktok') ||
    ua.includes('bytedance') ||
    ua.includes('bytelocale') ||
    ua.includes('musical_ly')
  );
};

export const useIsWebView = () => {
  const [isAndroid, setIsAndroid] = useState(false);
  const [agent, setAgent] = useState('');
  const [isTelegram, setIsTelegram] = useState(false);

  const [inWebView, setIsWebView] = useState(false);
  const [isTiktok, setIsTikTok] = useState(false);

  const initCheck = async () => {
    const isTelegramApp = isTMA();
    const isTelegramData = getIsTelegram();
    const ua = navigator.userAgent.toLowerCase();
    //const supportsWebRTC = !!window.RTCPeerConnection;
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
    const isTelegramWebView = isTelegramData.isTgAndroid || isTelegramData.isTgIos;

    if (!isTelegramApp) {
      setIsWebView(isTelegramWebView || isInAppBrowser(ua) || isTiktokWebView);
    }

    setIsTelegram(isTelegramWebView);
    setIsAndroid(isTelegramData.isTgAndroid || ua.includes('android'));
    setIsTikTok(isTiktokWebView);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCheck();
    }
  }, []);

  return {
    isAndroid,
    agent,
    inWebView,
    isTelegram,
    isTiktok,
  };
};
