"use client";
import { createContext, useContext, ReactNode, JSX, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";
import { getDoc, setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { fullEnglishLanguageName, SupportedLanguage } from "@/common/lang";
import { db } from "../Firebase/db";
import dayjs from "dayjs";
import * as Sentry from "@sentry/nextjs";
import { useCurrency } from "../Landing/Price/useCurrency";

interface SettingsContextType {
  userCreatedAt: number | null;

  languageCode: SupportedLanguage | null;

  fullLanguageName: string | null;

  loading: boolean;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}

export const settingsContext = createContext<SettingsContextType>({
  languageCode: null,
  fullLanguageName: null,
  loading: true,

  userCreatedAt: null,
  setLanguage: async () => void 0,
});

function useProvideSettings(): SettingsContextType {
  const auth = useAuth();
  const userId = auth.uid;

  const userSettingsDoc = db.documents.userSettings(userId);
  const currency = useCurrency();

  const [userSettings, loading] = useDocumentData(userSettingsDoc);

  const setLanguage = async (languageCode: SupportedLanguage) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { languageCode }, { merge: true });
  };

  const confirmGtag = async () => {
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

  const initUserSettings = async () => {
    if (!userId || !userSettingsDoc) {
      return;
    }

    const data = await getDoc(userSettingsDoc);
    const isNew = !data.exists() || !data.data().createdAt;
    if (!isNew) {
      return;
    }

    await setDoc(
      userSettingsDoc,
      {
        createdAt: Date.now(),
        currency: currency.currency || null,
        email: auth.userInfo?.email || "",
      },
      { merge: true }
    );

    confirmGtag();
  };

  useEffect(() => {
    initUserSettings();
  }, [userId, userSettingsDoc]);

  const saveLoginTime = async () => {
    if (!userId || !userSettingsDoc) return;
    const lastLoginTimestamp = Date.now();
    const formattedLastLogin = dayjs(lastLoginTimestamp).format("YYYY-MM-DD HH:mm:ss");

    await setDoc(
      userSettingsDoc,
      { lastLoginAt: Date.now(), lastLoginAtDateTime: formattedLastLogin },
      { merge: true }
    );
  };

  useEffect(() => {
    setTimeout(() => {
      saveLoginTime();
    }, 1500);
  }, [userId, userSettingsDoc]);

  const userCreatedAt = userSettings?.createdAt || null;

  return {
    userCreatedAt,
    languageCode: userSettings?.languageCode || null,
    fullLanguageName: userSettings?.languageCode
      ? fullEnglishLanguageName[userSettings.languageCode]
      : null,
    loading: loading || !userId || !userSettingsDoc || !userSettings,
    setLanguage,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }): JSX.Element {
  const settings = useProvideSettings();

  return <settingsContext.Provider value={settings}>{children}</settingsContext.Provider>;
}

export const useSettings = (): SettingsContextType => {
  const context = useContext(settingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
