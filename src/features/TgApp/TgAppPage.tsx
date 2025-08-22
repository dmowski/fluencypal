"use client";
import { Button, Stack, Typography } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { maxContentWidth } from "../Landing/landingSettings";
import { useEffect, useRef, useState } from "react";
import { sendTelegramTokenRequest } from "@/app/api/telegram/token/sendTelegramTokenRequest";
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  retrieveLaunchParams,
  useSignal,
} from "@telegram-apps/sdk-react";
import { mockEnv } from "../Telegram/mockEnv";
import { init } from "../Telegram/init";
import { useAuth } from "../Auth/useAuth";
import { usePlan } from "../Plan/usePlan";
import { useSettings } from "../Settings/useSettings";
import { useRouter } from "next/navigation";
import { getUrlStart } from "../Lang/getUrlStart";

interface TgAppPageProps {
  lang: SupportedLanguage;
}
export const TgAppPage = ({ lang }: TgAppPageProps) => {
  const [isTelegramAuthLoading, setIsTelegramAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const plan = usePlan();
  const settings = useSettings();
  const isPlanLoading = plan.loading;
  const router = useRouter();
  const isAuth = auth.isAuthorized;

  const isAnyPlanForLearnLanguage = plan.latestGoal;
  const isNeedToRedirectToApp =
    !isPlanLoading && isAuth && isAnyPlanForLearnLanguage && !settings.loading;
  useEffect(() => {
    if (!isNeedToRedirectToApp) {
      return;
    }
    const pageLang = settings.userSettings?.pageLanguageCode || lang;

    // Redirect to APP if plan is present
    const newPath = `${getUrlStart(pageLang)}practice`;
    router.push(newPath);
  }, [isNeedToRedirectToApp]);

  const isNeedToRedirectToQuiz =
    !isPlanLoading && isAuth && !isAnyPlanForLearnLanguage && !settings.loading;

  useEffect(() => {
    if (!isNeedToRedirectToQuiz) {
      return;
    }
    const pageLang = settings.userSettings?.pageLanguageCode || lang;

    // Redirect to QUIZ if no plan is present
    const newPath = `${getUrlStart(pageLang)}quiz`;
    router.push(newPath);
  }, [isNeedToRedirectToQuiz]);

  const raw = useSignal(_initDataRaw);
  const isInitializing = useRef(false);

  const initToken = async (initData: string) => {
    try {
      setIsTelegramAuthLoading(true);
      setError(null);
      const res = await sendTelegramTokenRequest({ initData });
      console.log("Telegram auth response:", res);
      if (res.error) {
        setError(
          `${res.error.code}: ${res.error.message}${res.error.reason ? ` (${res.error.reason})` : ""}`
        );
      } else {
        const token = res.token;
        const result = await auth.signInWithCustomToken(token);
        console.log("auth result", result);
        if (!result.isDone) {
          setError(result.error || "Unknown error during sign-in");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setIsTelegramAuthLoading(false);
    }
  };

  useEffect(() => {
    mockEnv().then(() => {
      try {
        const launchParams = retrieveLaunchParams();
        const { tgWebAppPlatform: platform } = launchParams;
        const debug =
          (launchParams.tgWebAppStartParam || "").includes("debug") ||
          process.env.NODE_ENV === "development";

        init({
          debug,
          eruda: debug && ["ios", "android"].includes(platform),
          mockForMacOS: platform === "macos",
        });
      } catch (e) {
        setError("Failed to initialize Telegram Mini App");
        throw e;
      }
    });
  }, []);

  useEffect(() => {
    if (isInitializing.current || auth.isAuthorized || auth.loading) return;

    if (raw) {
      isInitializing.current = true;
      void initToken(raw);
    } else {
      setError("Not running inside Telegram WebApp");
    }
  }, [raw, auth.isAuthorized]);

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

              padding: "30px 20px 250px 20px",
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
              {auth.loading ? (
                <Typography>Loading.</Typography>
              ) : isTelegramAuthLoading ? (
                <p>Authorizing with Telegram...</p>
              ) : null}

              {error && <Typography color="error">❌ {error}</Typography>}

              <Button
                variant="text"
                onClick={() => {
                  auth.logout();
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};
