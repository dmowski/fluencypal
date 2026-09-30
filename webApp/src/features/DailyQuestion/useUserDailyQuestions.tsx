'use client';

import { useMemo } from 'react';
import { orderBy, query } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { splitUserDailyQuestions } from './userDailyQuestion';

export const useUserDailyQuestions = () => {
  const auth = useAuth();
  const collectionRef = auth.uid ? db.collections.userDailyQuestions() : null;
  const questionsQuery = useMemo(
    () => (collectionRef ? query(collectionRef, orderBy('createdAtIso', 'desc')) : null),
    [collectionRef],
  );
  const [questions, loading] = useCollectionData(questionsQuery);
  const split = useMemo(() => splitUserDailyQuestions(questions || []), [questions]);
  const myToday = split.todays.find((question) => question.authorUserId === auth.uid) || null;

  return {
    todays: split.todays,
    previous: split.previous,
    myToday,
    loading,
  };
};
