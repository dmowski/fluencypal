"use client";
import { createContext, useContext, useMemo, ReactNode, JSX, useEffect } from "react";
import { useAuth } from "../Auth/useAuth";
import { doc, DocumentReference, setDoc } from "firebase/firestore";
import { firestore } from "../Firebase/init";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { UserSettings } from "@/common/user";
import { SupportedLanguage } from "@/common/lang";

interface SettingsContextType {
  language: SupportedLanguage | null;
  loading: boolean;
  setLanguage: (language: SupportedLanguage) => void;
}

export const settingsContext = createContext<SettingsContextType>({
  language: null,
  loading: true,
  setLanguage: async () => void 0,
});

function useProvideSettings(): SettingsContextType {
  const auth = useAuth();
  const userId = auth.uid;

  const userSettingsDoc = useMemo(() => {
    return userId ? (doc(firestore, `users/${userId}`) as DocumentReference<UserSettings>) : null;
  }, [userId]);

  const [userSettings, loading] = useDocumentData<UserSettings>(userSettingsDoc);

  const setLanguage = async (language: SupportedLanguage) => {
    if (!userSettingsDoc) return;
    await setDoc(userSettingsDoc, { language }, { merge: true });
  };

  const initUserSettings = async () => {
    if (!userId || loading || !userSettings || !userSettingsDoc || userSettings.createdAt) return;
    await setDoc(userSettingsDoc, { createdAt: Date.now() }, { merge: true });
  };

  useEffect(() => {
    initUserSettings();
  }, [userSettings, loading, userId, userSettingsDoc]);

  const saveLoginTime = async () => {
    if (!userId || !userSettingsDoc) return;
    await setDoc(userSettingsDoc, { lastLoginAt: Date.now() }, { merge: true });
  };

  useEffect(() => {
    saveLoginTime();
  }, [userId, userSettingsDoc]);

  return {
    language: userSettings?.language || null,
    loading,
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
