import { useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import { doc, DocumentReference, setDoc } from "firebase/firestore";
import { firestore } from "../Firebase/init";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { UserSettings } from "@/common/user";
import { SupportedLanguage } from "@/common/lang";

export const useSettings = () => {
  const auth = useAuth();
  const userId = auth.uid;

  const userSettingsDoc = useMemo(() => {
    return userId ? (doc(firestore, `users/${userId}`) as DocumentReference<UserSettings>) : null;
  }, [userId]);

  const [userSettings, loading] = useDocumentData(userSettingsDoc);

  const setLanguage = (language: SupportedLanguage) => {
    if (!userSettingsDoc) return;

    setDoc(userSettingsDoc, { language }, { merge: true });
  };

  const language = userSettings?.language || null;

  return { language, loading, setLanguage };
};
