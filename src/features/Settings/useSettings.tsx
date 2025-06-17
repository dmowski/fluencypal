"use client";
import { createContext, useContext, ReactNode, JSX, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";
import { getDoc, setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguages,
} from "@/features/Lang/lang";
import { db } from "../Firebase/db";
import dayjs from "dayjs";
import { useCurrency } from "../User/useCurrency";
import { confirmGtag } from "../Analytics/confirmGtag";
import { getCountryByIP } from "../User/getCountry";
import { countries } from "@/libs/countries";
import { UserSettings } from "@/common/user";

interface SettingsContextType {
  userCreatedAt: number | null;

  languageCode: SupportedLanguage | null;

  fullLanguageName: string | null;

  loading: boolean;
  setLanguage: (language: SupportedLanguage) => Promise<SupportedLanguage>;
  setPageLanguage: (language: SupportedLanguage) => Promise<void>;
  setNativeLanguage: (language: string) => Promise<void>;
  userSettings: UserSettings | null;
}

export const settingsContext = createContext<SettingsContextType>({
  languageCode: null,
  fullLanguageName: null,
  loading: true,

  userCreatedAt: null,
  setLanguage: async () => "en",
  setPageLanguage: async () => {},
  setNativeLanguage: async () => {},
  userSettings: null,
});

function useProvideSettings(): SettingsContextType {
  const auth = useAuth();
  const userId = auth.uid;

  const userSettingsDoc = db.documents.userSettings(userId);
  const currency = useCurrency();

  const [userSettings, loading] = useDocumentData(userSettingsDoc);

  const setLanguage = async (languageCode: SupportedLanguage) => {
    if (!userSettingsDoc) return "en";
    const langCodeValidated = supportedLanguages.find((lang) => lang === languageCode) || "en";
    await setDoc(userSettingsDoc, { languageCode: langCodeValidated }, { merge: true });
    return langCodeValidated;
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

    confirmGtag();
    const country = await getCountryByIP();
    const countryName = country
      ? countries.find((c) => c.alpha2 === country.toLowerCase())?.name || "Unknown"
      : "-";
    await setDoc(
      userSettingsDoc,
      {
        createdAt: Date.now(),
        currency: currency.currency || null,
        email: auth.userInfo?.email || "",
        country: country || null,
        countryName: countryName || null,
      },
      { merge: true }
    );
  };

  useEffect(() => {
    initUserSettings();
  }, [userId, userSettingsDoc]);

  const saveLoginTime = async () => {
    if (!userId || !userSettingsDoc) return;
    const lastLoginTimestamp = Date.now();
    const formattedLastLogin = dayjs(lastLoginTimestamp).format("YYYY-MM-DD HH:mm:ss");

    const country = await getCountryByIP();
    const countryName = country
      ? countries.find((c) => c.alpha2 === country.toLowerCase())?.name || "Unknown"
      : "-";

    await setDoc(
      userSettingsDoc,
      { lastLoginAt: Date.now(), lastLoginAtDateTime: formattedLastLogin, country, countryName },
      { merge: true }
    );
  };

  useEffect(() => {
    setTimeout(() => {
      saveLoginTime();
    }, 1500);
  }, [userId, userSettingsDoc]);

  const userCreatedAt = userSettings?.createdAt || null;

  const setPageLanguage = async (languageCode: SupportedLanguage) => {
    if (!userSettingsDoc) return;
    const langCodeValidated = supportedLanguages.find((lang) => lang === languageCode) || "en";
    await setDoc(userSettingsDoc, { pageLanguageCode: langCodeValidated }, { merge: true });
  };

  const setNativeLanguage = async (languageCode: string) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { nativeLanguageCode: languageCode }, { merge: true });
  };

  return {
    userCreatedAt,
    setNativeLanguage,
    languageCode: userSettings?.languageCode || null,
    fullLanguageName: userSettings?.languageCode
      ? fullEnglishLanguageName[userSettings.languageCode]
      : null,
    loading: loading || !userId || !userSettingsDoc || !userSettings || !userCreatedAt,
    setLanguage,
    setPageLanguage,
    userSettings: userSettings || null,
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
