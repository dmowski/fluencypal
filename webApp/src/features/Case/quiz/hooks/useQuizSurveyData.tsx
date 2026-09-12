'use client';

import { useAuth } from '@/features/Auth/useAuth';
import { runWithFirestoreAuth } from '@/features/Firebase/runWithFirestoreAuth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useEffect, useRef } from 'react';
import { DocumentReference, getDoc, setDoc } from 'firebase/firestore';
import * as Sentry from '@sentry/nextjs';

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
    if (!surveyDocRef) throw new Error('updateSurvey | No survey doc ref');
    const updatedSurvey: T = {
      ...surveyDoc,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(surveyDocRef, updatedSurvey, { merge: true });
    console.log('✅ Survey doc updated: ' + label);
    return updatedSurvey;
  };

  const ensureSurveyDocExists = async () => {
    if (surveyDoc) return;
    if (!surveyDocRef) throw new Error('ensureSurveyDocExists | No survey doc ref');
    if ((await getDoc(surveyDocRef)).data()) return;

    await setDoc(surveyDocRef, initEmptyData);
    console.log('✅ Survey doc created', initEmptyData);
  };

  useEffect(() => {
    if (!auth.uid) return;
    void runWithFirestoreAuth(auth.getToken, ensureSurveyDocExists).catch((error) => {
      Sentry.captureException(error);
    });
  }, [auth.uid]);

  return {
    survey: surveyDoc || null,
    updateSurvey,
    surveyRef,
  };
}
