"use client";
import { createContext, useContext, useEffect, ReactNode, useState, useRef } from "react";
import { isDev } from "./isDev";
import { useAuth } from "../Auth/useAuth";
import * as Sentry from "@sentry/nextjs";

const RUN_ON_DEV_ENV = true;

const confirmGtag = async () => {
  if (isDev() && !RUN_ON_DEV_ENV) {
    console.log("Skipping gtag in dev mode");
    return;
  }
  const gtag = (window as any).gtag;
  if (!gtag) {
    console.error("gtag is not defined");
    Sentry.captureMessage("gtag is not defined");
    return;
  }

  try {
    console.log("Sending gtag event");
    function gtag_report_conversion() {
      var callback = function () {};
      gtag("event", "conversion", {
        send_to: "AW-16463260124/wRIsCLS2o7kaENzTpao9",
        value: 1.0,
        currency: "PLN",
        event_callback: callback,
      });
      return false;
    }

    gtag_report_conversion();
  } catch (error) {
    console.error("Error sending gtag event:", error);
    Sentry.captureException(error);
  }
};

const initHotjar = () => {
  (function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments);
      };
    h._hjSettings = { hjid: 6370217, hjsv: 6 };
    a = o.getElementsByTagName("head")[0];
    r = o.createElement("script");
    r.async = 1;
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
    a.appendChild(r);
  })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
};

const initGTag = () => {
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = "https://www.googletagmanager.com/gtag/js?id=G-K2X9LZJ50W";
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-K2X9LZJ50W'); 
      gtag('config', 'AW-16463260124');
    `;
  document.head.appendChild(script2);
};

interface AnalyticsContextType {
  isInitialized: boolean;
  confirmGtag: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  const isInitialized = useRef(false);
  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if ((isDev() && !RUN_ON_DEV_ENV) || !auth.uid || isInitialized.current || !isWindow) {
      return;
    }
    isInitialized.current = true;
    initHotjar();
    initGTag();
  }, [auth.uid]);

  const data: AnalyticsContextType = {
    isInitialized: isInitialized.current,
    confirmGtag,
  };

  return <AnalyticsContext.Provider value={data}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within a AnalyticsProvider");
  }
  return context;
};
