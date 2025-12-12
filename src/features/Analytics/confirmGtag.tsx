"use client";

import { isDev } from "./isDev";
import * as Sentry from "@sentry/nextjs";
import { getParamsFromStorage } from "./useUserSource";

export const confirmGtag = async () => {
  if (isDev()) {
    console.log("Skipping gtag in dev mode");
    return;
  }

  const isWindow = typeof window !== "undefined";
  if (!isWindow) {
    console.error("confirmGtag called without window");
    return;
  }

  const storeInfo = getParamsFromStorage();

  const gtag = (window as any).gtag;
  if (!gtag) {
    console.error("gtag is not defined");
    Sentry.captureException("gtag is not defined");
    return;
  }

  try {
    console.log("Sending gtag conversion event");

    // Optional: log if we have Google Ads click IDs or not
    if (storeInfo) {
      const hasClickId = storeInfo.gclid || storeInfo.gbraid || storeInfo.wbraid;
      console.log("Stored user source:", storeInfo, "hasClickId:", !!hasClickId);
    } else {
      console.log("No stored user source found in localStorage");
    }

    const conversionParams: Record<string, any> = {
      send_to: "AW-16463260124/wRIsCLS2o7kaENzTpao9",
      value: 1.0,
      currency: "PLN",
    };

    if (storeInfo) {
      // Attach UTM & referrer info as custom params
      conversionParams.source_url_path = storeInfo.urlPath;
      conversionParams.source_referrer = storeInfo.referrer;
      conversionParams.source_utm_source = storeInfo.utmSource;
      conversionParams.source_utm_medium = storeInfo.utmMedium;
      conversionParams.source_utm_campaign = storeInfo.utmCampaign;
      conversionParams.source_utm_term = storeInfo.utmTerm;
      conversionParams.source_utm_content = storeInfo.utmContent;

      // Attach Google Ads identifiers (useful for debugging / future server-side use)
      if (storeInfo.gclid) conversionParams.source_gclid = storeInfo.gclid;
      if (storeInfo.gbraid) conversionParams.source_gbraid = storeInfo.gbraid;
      if (storeInfo.wbraid) conversionParams.source_wbraid = storeInfo.wbraid;
    }

    function gtag_report_conversion() {
      const callback = function () {};
      gtag("event", "conversion", {
        ...conversionParams,
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
