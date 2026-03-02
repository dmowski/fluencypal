'use client';
import { createContext, JSX, ReactNode, useContext } from 'react';
import { CommunitySpace } from '../types';
import { useAuth } from '../../Auth/useAuth';
import { db } from '../../Firebase/firebaseDb';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { CommunitySpaceSettings } from '../types';

interface SaveSpaceInput {
  id?: string;
  title: string;
  description: string;
}

interface CommunitySpaceContext {
  spaces: CommunitySpace[];
  bookmarkedSpacesIds: string[];
  bookmarkedSpaces: CommunitySpace[];
  saveSpace: (input: SaveSpaceInput) => Promise<string | null>;
  deleteSpace: (spaceId: string) => Promise<void>;
  toggleBookmark: (spaceId: string) => Promise<void>;
}

const CommunitySpaceContext = createContext<CommunitySpaceContext | null>(null);

const useProvideCommunitySpace = (): CommunitySpaceContext => {
  const auth = useAuth();
  const spacesDocRef = db.collections.communitySpaces(auth.uid);
  const [spaceData] = useCollectionData(spacesDocRef);
  const communitySpaceSettingsDocRef = db.documents.communitySpaceSettings(auth.uid);
  const [communitySpaceSettingsData] = useDocumentData(communitySpaceSettingsDocRef);

  const bookmarkedSpacesIds = communitySpaceSettingsData?.bookmarkedSpacesIds || [];
  const spaces = spaceData || [];

  const bookmarkedSpaces = spaces.filter((space) => bookmarkedSpacesIds.includes(space.id));

  const saveSpace = async (input: SaveSpaceInput): Promise<string | null> => {
    if (!spacesDocRef || !auth.uid) return null;

    const nowIso = new Date().toISOString();
    const spaceId = input.id || Date.now().toString();
    const existingSpace = (spaceData || []).find((space) => space.id === spaceId);

    const payload: CommunitySpace = {
      id: spaceId,
      title: input.title.trim(),
      description: input.description.trim(),
      createdAtIso: existingSpace?.createdAtIso || nowIso,
      updatedAtIso: nowIso,
      createdByUserId: existingSpace?.createdByUserId || auth.uid,
    };

    const docRef = doc(spacesDocRef, spaceId);
    await setDoc(docRef, payload);

    return spaceId;
  };

  const deleteSpace = async (spaceId: string): Promise<void> => {
    if (!spacesDocRef) return;
    const docRef = doc(spacesDocRef, spaceId);
    await deleteDoc(docRef);
  };

  const toggleBookmark = async (spaceId: string): Promise<void> => {
    if (!communitySpaceSettingsDocRef) return;

    const currentBookmarkedIds = communitySpaceSettingsData?.bookmarkedSpacesIds || [];
    const isBookmarked = currentBookmarkedIds.includes(spaceId);

    const updatedBookmarkedIds = isBookmarked
      ? currentBookmarkedIds.filter((id) => id !== spaceId)
      : [...currentBookmarkedIds, spaceId];

    const payload: CommunitySpaceSettings = {
      bookmarkedSpacesIds: updatedBookmarkedIds,
    };

    await setDoc(communitySpaceSettingsDocRef, payload, { merge: true });
  };

  return {
    spaces,
    bookmarkedSpacesIds,
    bookmarkedSpaces,
    saveSpace,
    deleteSpace,
    toggleBookmark,
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
