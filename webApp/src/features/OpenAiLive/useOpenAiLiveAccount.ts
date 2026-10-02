'use client';

import { useEffect, useRef, useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { requestOpenAiLiveWelcome } from './api';
import { OpenAiLiveAccount } from './types';

export const useOpenAiLiveAccount = () => {
  const auth = useAuth();
  const accountRef = auth.isFounder && auth.uid ? db.documents.openAiLiveAccount(auth.uid) : null;
  const [account, loadingDoc, docError] = useDocumentData(accountRef);
  const liveAccount = account as OpenAiLiveAccount | undefined;
  const [balanceUsdMicros, setBalanceUsdMicros] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const getTokenRef = useRef(auth.getToken);
  getTokenRef.current = auth.getToken;
  const welcomeStarted = useRef(false);

  useEffect(() => {
    if (typeof liveAccount?.balanceUsdMicros === 'number') {
      setBalanceUsdMicros(liveAccount.balanceUsdMicros);
    }
  }, [liveAccount?.balanceUsdMicros]);

  useEffect(() => {
    if (!auth.isFounder || !auth.uid || loadingDoc || liveAccount?.welcomeGrantedAt) return;
    if (welcomeStarted.current) return;
    welcomeStarted.current = true;
    void (async () => {
      try {
        const result = await requestOpenAiLiveWelcome(await getTokenRef.current());
        setBalanceUsdMicros(result.balanceUsdMicros);
        setError(null);
      } catch (welcomeError) {
        welcomeStarted.current = false;
        setError(
          welcomeError instanceof Error ? welcomeError.message : 'Could not add the trial balance',
        );
      }
    })();
  }, [auth.isFounder, auth.uid, liveAccount?.welcomeGrantedAt, loadingDoc]);

  return {
    balanceUsdMicros,
    setBalanceUsdMicros,
    loading: Boolean(auth.isFounder && auth.uid) && loadingDoc && balanceUsdMicros === null,
    error: error || (docError ? 'Could not load the live conversation balance' : null),
  };
};
