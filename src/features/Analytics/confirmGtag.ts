"use client";
import * as Sentry from "@sentry/nextjs";
import { isDev } from "./isDev";

export const confirmGtag = async () => {
  if (isDev()) {
    return;
  }
  const gtag = (window as any).gtag;
  if (!gtag) {
    console.error("gtag is not defined");
    Sentry.captureMessage("gtag is not defined");
    return;
  }

  try {
    gtag("event", "conversion", {
      send_to: "AW-16463260124/wRIsCLS2o7kaENzTpao9",
      value: 1.0,
      currency: "PLN",
    });
  } catch (error) {
    console.error("Error sending gtag event:", error);
    Sentry.captureException(error);
  }
};
