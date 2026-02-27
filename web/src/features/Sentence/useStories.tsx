'use client';
import { createContext, useContext, ReactNode, JSX, useEffect, useMemo } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';
import { useUrlState } from '../Url/useUrlState';
import { db } from '../Firebase/firebaseDb';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { getDoc, setDoc } from 'firebase/firestore';
import { uniq } from '@/libs/uniq';
import { Story } from './types';
import { shuffleArray } from '@/libs/array';

interface StoriesContextType {
  loading: boolean;
  selectedStory: Story | null;
  stories: Story[];
  openStory: (id: string) => Story | null;
  openNextStory: () => Story | null;
  openRandomStory: () => Story | null;
}

const StoriesContext = createContext<StoriesContextType | null>(null);

function useProvideStories(): StoriesContextType {
  const settings = useSettings();
  const languageCode = settings.languageCode || 'en';

  const [selectedImageImageId, setSelectedImageId] = useUrlState('storyImage', '', false);

  const auth = useAuth();
  const collectionRef = db.collections.stories(auth.uid);
  const [databaseStories, loading] = useCollectionDataOnce(collectionRef);

  const increaseViewsCount = async () => {
    const storiesViewsStatsDocRef = db.documents.storyStats(auth.uid, selectedImageImageId || '');
    if (!auth.uid || !storiesViewsStatsDocRef) return;
    const newestDoc = getDoc(storiesViewsStatsDocRef);
    const newestData = (await newestDoc).data();

    const viewsUserIds: string[] = newestData?.viewsUserIds || [];
    if (viewsUserIds.includes(auth.uid)) {
      return;
    }

    const newCount = uniq([...viewsUserIds, auth.uid]);

    await setDoc(storiesViewsStatsDocRef, { viewsUserIds: newCount }, { merge: true });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (selectedImageImageId) {
        increaseViewsCount();
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [selectedImageImageId]);

  const storiesToShow = useMemo(() => {
    if (!databaseStories) return [];
    const allElements = [...(databaseStories || [])];
    const publishedStories = allElements.filter((s) => s.isPublished);

    const storiesToShow = shuffleArray(publishedStories);

    return storiesToShow;
  }, [databaseStories]);

  const selectedStory = useMemo(
    () => databaseStories?.find((story) => story.id === selectedImageImageId) || null,
    [databaseStories, selectedImageImageId],
  );

  const openStory = (id: string) => {
    setSelectedImageId(id);
    return databaseStories?.find((story) => story.id === id) || null;
  };

  const openRandomStory = () => {
    if (storiesToShow.length === 0) return null;
    const randomStory = storiesToShow[Math.floor(Math.random() * storiesToShow.length)];
    setSelectedImageId(randomStory.id);
    return randomStory;
  };

  const openNextStory = () => {
    if (storiesToShow.length === 0) return null;
    const currentIndex = storiesToShow.findIndex((img) => img.id === selectedImageImageId);
    const nextIndex = (currentIndex + 1) % storiesToShow.length;
    const nextImage = storiesToShow[nextIndex];
    setSelectedImageId(nextImage.id);
    return nextImage;
  };

  return {
    loading,
    selectedStory,
    stories: storiesToShow,
    openStory,
    openRandomStory,
    openNextStory,
  };
}

export function StoriesProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideStories();
  return <StoriesContext.Provider value={hook}>{children}</StoriesContext.Provider>;
}

export const useStories = (): StoriesContextType => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
};
