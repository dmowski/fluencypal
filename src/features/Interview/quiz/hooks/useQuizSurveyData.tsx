import { useAuth } from "@/features/Auth/useAuth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useEffect, useRef } from "react";
import { DocumentReference, getDoc, setDoc } from "firebase/firestore";

interface CoreSurveyData {
  createdAtIso: string;
  updatedAtIso: string;
}

export function useQuizSurveyData<T extends CoreSurveyData>({
  surveyDocRef,
  initEmptyData,
}: {
  surveyDocRef: DocumentReference<T, any> | null;
  initEmptyData: T;
}) {
  const auth = useAuth();
  const [surveyDoc] = useDocumentData(surveyDocRef);

  const surveyRef = useRef<T | null>(surveyDoc || null);
  surveyRef.current = surveyDoc || null;

  const updateSurvey = async (surveyDoc: T, label: string) => {
    if (!surveyDocRef) throw new Error("updateSurvey | No survey doc ref");
    const updatedSurvey: T = {
      ...surveyDoc,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(surveyDocRef, updatedSurvey, { merge: true });
    console.log("✅ Survey doc updated: " + label);
    return updatedSurvey;
  };

  const ensureSurveyDocExists = async () => {
    if (surveyDoc) return;
    if (!surveyDocRef) throw new Error("ensureSurveyDocExists | No survey doc ref");
    if ((await getDoc(surveyDocRef)).data()) return;

    await setDoc(surveyDocRef, initEmptyData);
    console.log("✅ Survey doc created", initEmptyData);
  };

  useEffect(() => {
    if (auth.uid) ensureSurveyDocExists();
  }, [auth.uid]);

  return {
    survey: surveyDoc || null,
    updateSurvey,
    surveyRef,
  };
}
