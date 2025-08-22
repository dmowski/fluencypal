"use client";
import { Stack, Typography } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { maxContentWidth } from "../Landing/landingSettings";
import { useEffect, useRef, useState } from "react";
import { sendTelegramTokenRequest } from "@/app/api/telegram/token/sendTelegramTokenRequest";
import { TelegramAuthResponse } from "@/app/api/telegram/token/types";

interface TgAppPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const TgAppPage = ({ lang, defaultLangToLearn }: TgAppPageProps) => {
  const [response, setResponse] = useState<TelegramAuthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initToken = async (initData: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await sendTelegramTokenRequest({ initData });
      setResponse(res);
      if (res.error) {
        setError(`${res.error.code}: ${res.error.message}`);
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const isInitializing = useRef(false);

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow || isInitializing.current) return;
    const tg = (window as any).Telegram?.WebApp;
    const initData = tg?.initData; // raw querystring provided by Telegram
    console.log("initData", initData, tg);
    if (tg && initData) {
      isInitializing.current = true;
      initToken(initData);
    } else {
      setError("Not running inside Telegram WebApp");
    }
  }, []);

  return (
    <Stack sx={{}}>
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `#fff`,
            color: "#000",
            height: "max-content",
            minHeight: "100dvh",
            maxHeight: "2000px",
            position: "relative",
          }}
        >
          <Stack
            sx={{
              width: "100%",
              maxWidth: maxContentWidth,

              padding: "10px 20px 250px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
              opacity: 1,
            }}
          >
            <Stack
              gap={"30px"}
              sx={{
                width: "100%",
              }}
            >
              <Typography>Telegram App</Typography>
              {loading && <p>Authorizing with Telegram...</p>}
              {error && <p style={{ color: "red" }}>❌ {error}</p>}

              <pre style={{ textAlign: "left", fontSize: "0.8rem" }}>
                {response ? JSON.stringify(response, null, 2) : "No response yet"}
              </pre>
            </Stack>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};
