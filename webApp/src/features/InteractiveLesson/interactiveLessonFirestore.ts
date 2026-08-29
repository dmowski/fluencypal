import { getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { sanitizeForFirestore } from '@/libs/sanitizeForFirestore';
import { SupportedLanguage } from '@/features/Lang/lang';
import { emptyLessonStore } from './lessonState';
import { parseInteractiveLessonStore } from './storage';
import { InteractiveLessonFirestoreDoc, InteractiveLessonStore } from './types';

export const getInteractiveLessonDocRef = (userId: string, languageCode: SupportedLanguage) => {
  return db.documents.interactiveLessonState(userId, languageCode);
};

export const loadInteractiveLessonStore = async (
  userId: string,
  languageCode: SupportedLanguage,
): Promise<InteractiveLessonStore> => {
  const docRef = getInteractiveLessonDocRef(userId, languageCode);
  if (!docRef) return emptyLessonStore();

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return emptyLessonStore();
  return parseInteractiveLessonStore(snapshot.data());
};

export const saveInteractiveLessonStore = async (
  userId: string,
  languageCode: SupportedLanguage,
  store: InteractiveLessonStore,
): Promise<void> => {
  const docRef = getInteractiveLessonDocRef(userId, languageCode);
  if (!docRef) return;

  const payload: InteractiveLessonFirestoreDoc = {
    ...store,
    languageCode,
    updatedAtIso: new Date().toISOString(),
  };

  await setDoc(docRef, sanitizeForFirestore(payload));
};
