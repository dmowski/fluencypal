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
import { db } from "../Firebase/firebaseDb";
import { useCurrency } from "../User/useCurrency";
import { getCountryByIP } from "../User/getCountry";
import { countries } from "@/libs/countries";
import { AppMode, ConversationMode, InitUserSettings, UserSettings } from "@/common/user";
import { NativeLangCode } from "@/libs/language/type";
import { useUserSource } from "../Analytics/useUserSource";
import { isActiveBrowserTab } from "@/libs/isActiveBrowserTab";
import { AiVoice } from "@/common/ai";

interface SettingsContextType {
  userCreatedAt: number | null;

  languageCode: SupportedLanguage | null;

  fullLanguageName: string | null;

  loading: boolean;
  setLanguage: (language: SupportedLanguage) => Promise<SupportedLanguage>;
  setPageLanguage: (language: SupportedLanguage) => Promise<void>;
  setNativeLanguage: (language: NativeLangCode) => Promise<void>;

  userSettings: UserSettings | null;
  onDoneGameOnboarding: () => void;
  setAppMode: (mode: AppMode) => Promise<void>;
  appMode: AppMode;

  conversationMode: ConversationMode;
  setConversationMode: (mode: ConversationMode) => Promise<void>;

  setVoice: (voice: AiVoice) => Promise<void>;
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
  onDoneGameOnboarding: () => {
    throw new Error("onDoneGameOnboarding function is not implemented");
  },
  setAppMode: async () => {},
  appMode: "learning",

  conversationMode: "record",
  setConversationMode: async () => {},
  setVoice: async () => {},
});

function useProvideSettings(): SettingsContextType {
  const auth = useAuth();
  const userId = auth.uid;

  const userSettingsDoc = db.documents.userSettings(userId);
  const currency = useCurrency();
  const userSource = useUserSource();

  const [userSettings, loading] = useDocumentData(userSettingsDoc);

  const setLanguage = async (languageCode: SupportedLanguage) => {
    if (!userSettingsDoc) return "en";
    const langCodeValidated = supportedLanguages.find((lang) => lang === languageCode) || "en";
    await setDoc(userSettingsDoc, { languageCode: langCodeValidated }, { merge: true });
    return langCodeValidated;
  };

  const setAppMode = async (mode: AppMode) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { appMode: mode }, { merge: true });
  };

  const setConversationMode = async (mode: ConversationMode) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { conversationMode: mode }, { merge: true });
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

    const country = await getCountryByIP();
    const countryName = country
      ? countries.find((c) => c.alpha2 === country.toLowerCase())?.name || null
      : null;

    const settingsData: InitUserSettings = {
      createdAt: Date.now(),
      createdAtIso: new Date().toISOString(),
      currency: currency.currency || null,
      email: auth.userInfo?.email || null,
      country: country || null,
      countryName: countryName || null,
      userSource: userSource.userSource,
      teacherVoice: "shimmer",
    };

    await setDoc(userSettingsDoc, settingsData, { merge: true });
  };

  useEffect(() => {
    initUserSettings();
  }, [userId, userSettingsDoc]);

  const saveLastLoginTime = async () => {
    if (!userId || !userSettingsDoc || !isActiveBrowserTab()) return;
    const formattedLastLoginIso = new Date().toISOString();

    const browserInfo = getBrowserInfo();

    const partialData: Partial<UserSettings> = {
      lastLoginAtDateTime: formattedLastLoginIso,
      browserInfo,
    };

    await setDoc(userSettingsDoc, partialData, { merge: true });
  };

  const saveLoginTime = async () => {
    if (!userId || !userSettingsDoc) return;

    await saveLastLoginTime();

    const country = await getCountryByIP();
    const countryName = country
      ? countries.find((c) => c.alpha2 === country.toLowerCase())?.name || "Unknown"
      : "-";

    const photoUrl = auth.userInfo?.photoURL || "";
    const displayName = auth.userInfo?.displayName || "";
    await setDoc(userSettingsDoc, { country, countryName, photoUrl, displayName }, { merge: true });
  };

  useEffect(() => {
    setTimeout(() => {
      saveLoginTime();
    }, 1500);
  }, [userId, userSettingsDoc]);

  useEffect(() => {
    if (!userId || !userSettingsDoc) return;
    const interval = setInterval(() => {
      saveLastLoginTime();
    }, 60_000);
    return () => clearInterval(interval);
  }, [userId, userSettingsDoc]);

  const userCreatedAt = userSettings?.createdAt || null;

  const setPageLanguage = async (languageCode: SupportedLanguage) => {
    if (!userSettingsDoc) return;
    const langCodeValidated = supportedLanguages.find((lang) => lang === languageCode) || "en";
    await setDoc(userSettingsDoc, { pageLanguageCode: langCodeValidated }, { merge: true });
  };

  const setNativeLanguage = async (languageCode: NativeLangCode) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { nativeLanguageCode: languageCode }, { merge: true });
  };

  const onDoneGameOnboarding = () => {
    if (!userSettingsDoc) return;
    setDoc(userSettingsDoc, { isGameOnboardingCompleted: true }, { merge: true });
  };

  const pageLanguageCode = userSettings?.pageLanguageCode || "";

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow || !pageLanguageCode) return;

    localStorage.setItem("pageLanguageCode", pageLanguageCode);
  }, [pageLanguageCode]);

  const setVoice = async (voice: AiVoice) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { teacherVoice: voice }, { merge: true });
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
    onDoneGameOnboarding,
    setAppMode,
    appMode: clearAppMode(userSettings?.appMode || ""),

    conversationMode: userSettings?.conversationMode || "record",
    setConversationMode,
    setVoice,
  };
}

const clearAppMode = (mode: string): AppMode => {
  if (mode === "interview" || mode === "learning") {
    return mode;
  }
  return "learning";
};

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

const getBrowserInfo = (): string => {
  try {
    const navigatorInfo = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
    return navigatorInfo;
  } catch (error) {
    console.error("Error getting browser info:", error);
    return "unknown";
  }
};
