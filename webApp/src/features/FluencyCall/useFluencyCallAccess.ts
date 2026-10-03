'use client';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { useAccess } from '@/features/Usage/useAccess';
import { isFluencyCallPassActive } from './pricing';

export function useFluencyCallAccess(now: Date) {
  const auth = useAuth();
  const access = useAccess();
  const accountRef = auth.uid ? db.documents.fluencyCallAccount(auth.uid) : null;
  const [account, loading] = useDocumentData(accountRef);
  const passActive = isFluencyCallPassActive(account?.activeUntilIso, now);
  const included = access.canReadCommunity;
  const canJoin = included || (access.canUseCommunity && passActive);

  return {
    canJoin,
    included,
    passActive,
    activeUntilIso: account?.activeUntilIso ?? null,
    ready: !access.communityAccessLoading && !(Boolean(auth.uid) && loading),
  };
}
