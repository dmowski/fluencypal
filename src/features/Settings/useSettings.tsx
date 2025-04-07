"use client";
import { createContext, useContext, ReactNode, JSX, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";
import { setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { fullEnglishLanguageName, SupportedLanguage } from "@/common/lang";
import { db } from "../Firebase/db";
import dayjs from "dayjs";

interface SettingsContextType {
  userCreatedAt: number | null;

  languageCode: SupportedLanguage | null;

  fullLanguageName: string | null;

  loading: boolean;
  setLanguage: (language: SupportedLanguage) => void;
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

  const [userSettings, loading] = useDocumentData(userSettingsDoc);

  const setLanguage = async (languageCode: SupportedLanguage) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { languageCode }, { merge: true });
  };

  const initUserSettings = async () => {
    if (
      !userId ||
      loading ||
      !userSettings ||
      !userSettingsDoc ||
      (userSettings.createdAt && userSettings.email)
    ) {
      return;
    }

    await setDoc(
      userSettingsDoc,
      {
        createdAt: userSettings.createdAt || Date.now(),
        email: userSettings.email || auth.userInfo?.email || "",
      },
      { merge: true }
    );
  };

  useEffect(() => {
    initUserSettings();
  }, [userSettings, loading, userId, userSettingsDoc]);

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
    saveLoginTime();
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
