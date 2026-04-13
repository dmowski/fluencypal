import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { useProgressStats } from './useProgressStats';
import { useEffect, useState } from 'react';
import { useProgressEvaluation } from './useProgressEvaluation';
import { evaluateUserData } from './evaluateUserData';

export const useBackgroundProgressEvaluation = () => {
  const auth = useAuth();
  const progressStats = useProgressStats();
  const progressEvaluation = useProgressEvaluation();
  const userId = auth.uid;
  const collectionRef = db.collections.conversation(userId);
  const [conversations = [], loading] = useCollectionDataOnce(collectionRef);

  const [processStarted, setProcessStarted] = useState(false);
  const isReadyToProcess =
    conversations.length > 0 && !loading && !progressStats.loadingProgressStats && !processStarted;

  useEffect(() => {
    if (isReadyToProcess) {
      setProcessStarted(true);
      evaluateUserData({
        conversations,
        userDailyQuestions: [],
        isAlreadyEvaluated: progressStats.isAlreadyEvaluated,
        evaluateProgress: progressEvaluation.evaluateProgress,
        upsertProgressStat: progressStats.upsertProgressStat,
      });
    }
  }, [isReadyToProcess]);
};
