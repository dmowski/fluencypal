"use client";
import { Button, Stack, Typography } from "@mui/material";

import { SupportedLanguage } from "@/features/Lang/lang";
import { maxContentWidth } from "../Landing/landingSettings";
import { useEffect, useRef, useState } from "react";
import { sendTelegramTokenRequest } from "@/app/api/telegram/token/sendTelegramTokenRequest";
import {
  initDataRaw as _initDataRaw,
  initDataState as _initDataState,
  useSignal,
  isTMA,
} from "@telegram-apps/sdk-react";
import { useAuth } from "../Auth/useAuth";
import { usePlan } from "../Plan/usePlan";
import { useSettings } from "../Settings/useSettings";
import { useRouter } from "next/navigation";
import { getUrlStart } from "../Lang/getUrlStart";
import { useLingui } from "@lingui/react";
import { useWindowSizes } from "../Layout/useWindowSizes";

interface TgAppPageProps {
  lang: SupportedLanguage;
}

export const TgAppPage = ({ lang }: TgAppPageProps) => {
  const { i18n } = useLingui();
  const [isTelegramAuthLoading, setIsTelegramAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const { topOffset } = useWindowSizes();

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
    const newPath = `${getUrlStart(pageLang)}quiz2`;
    router.push(newPath);
  }, [isNeedToRedirectToQuiz]);

  const raw = useSignal(_initDataRaw);
  const isInitializing = useRef(false);

  const initToken = async (initData: string) => {
    try {
      setIsTelegramAuthLoading(true);
      setError(null);
      const res = await sendTelegramTokenRequest({ initData });
      if (res.error) {
        setError(
          `${res.error.code}: ${res.error.message}${res.error.reason ? ` (${res.error.reason})` : ""}`
        );
      } else {
        const token = res.token;
        const result = await auth.signInWithCustomToken(token);
        if (result.error) {
          setError(result.error || i18n._("Unknown error during sign-in"));
        }
      }
    } catch (err: any) {
      setError(err?.message || i18n._("Unknown error"));
    } finally {
      setIsTelegramAuthLoading(false);
    }
  };

  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) {
      setError(i18n._("Wrong Link"));
      return;
    }
  }, []);

  useEffect(() => {
    if (isInitializing.current || auth.isAuthorized || auth.loading) {
      return;
    }

    if (raw) {
      isInitializing.current = true;
      void initToken(raw);
    } else {
      setError(i18n._("Not running inside Telegram App"));
    }
  }, [raw, auth.isAuthorized, auth.loading]);

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
            backgroundColor: `rgba(255, 255, 255, 0.2)`,
            color: "#fff",
            height: "max-content",
            minHeight: "100dvh",
            maxHeight: "2000px",
            position: "relative",
            paddingTop: topOffset,
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
                <Typography>{i18n._("Loading.")}</Typography>
              ) : isTelegramAuthLoading ? (
                <Typography>{i18n._("Loading..")}</Typography>
              ) : (
                <Typography>{i18n._("Loading...")}</Typography>
              )}

              {error && <Typography color="error">❌ {error}</Typography>}

              <Button
                variant="text"
                onClick={async () => {
                  await auth.logout();
                  setTimeout(() => {
                    window.location.reload();
                  }, 300);
                }}
                style={{
                  opacity: 0.5,
                }}
              >
                {i18n._("Refresh")}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};
