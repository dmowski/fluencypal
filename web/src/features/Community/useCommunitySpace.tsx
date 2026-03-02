'use client';
import { createContext, JSX, ReactNode, useContext } from 'react';
import { useLingui } from '@lingui/react';
import { CommunitySpace } from './types';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';

interface CommunitySpaceContext {
  spaces: CommunitySpace[];
}

const CommunitySpaceContext = createContext<CommunitySpaceContext | null>(null);

const useProvideCommunitySpace = (): CommunitySpaceContext => {
  const auth = useAuth();
  const spacesDocRef = db.collections.communitySpaces(auth.uid);
  const [spaceData] = useCollectionDataOnce(spacesDocRef);

  return {
    spaces: spaceData || [],
  };
};

export function CommunitySpaceProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideCommunitySpace();

  return <CommunitySpaceContext.Provider value={hook}>{children}</CommunitySpaceContext.Provider>;
}

export const useCommunitySpace = (): CommunitySpaceContext => {
  const context = useContext(CommunitySpaceContext);
  if (!context) {
    throw new Error('useCommunitySpace must be used within a CommunitySpaceProvider');
  }

  return context;
};
