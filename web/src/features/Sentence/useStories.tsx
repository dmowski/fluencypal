'use client';
import { createContext, useContext, ReactNode, JSX, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';
import { useUrlState } from '../Url/useUrlState';
import { db } from '../Firebase/firebaseDb';
import { useCollectionDataOnce, useCollectionOnce } from 'react-firebase-hooks/firestore';
import { getDoc, setDoc } from 'firebase/firestore';
import { uniq } from '@/libs/uniq';
import { Story, StoryStat } from './types';
import { shuffleArray } from '@/libs/array';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { sleep } from '@/libs/sleep';

interface StoriesContextType {
  loading: boolean;
  selectedStory: Story | null;
  stories: Story[];
  randomStoryWithVideo: Story | null;
  rotateRandomStoryWithVideo: () => void;
  openStory: (id: string) => Promise<Story | null>;
  openNextStory: () => Promise<Story | null>;
  onPrevStory: () => Promise<Story | null>;
  openRandomStory: () => Promise<Story | null>;
  closeStory: () => void;
  isVideoVolumeEnabled: boolean;
  setIsVideoVolumeEnabled: (enabled: boolean) => void;
  isVideoPaused: boolean;
  setIsVideoPaused: (paused: boolean) => void;
  playStoryAudio: (story?: Story | null) => Promise<void>;
  storiesStatsMap: Record<string, StoryStat>;
}

const StoriesContext = createContext<StoriesContextType | null>(null);

function useProvideStories(): StoriesContextType {
  const settings = useSettings();
  const languageCode = settings.languageCode || 'en';
  const audio = useConversationAudio();

  const [isVideoVolumeEnabled, setIsVideoVolumeEnabled] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(true);

  const [selectedImageImageId, setSelectedImageId] = useUrlState('storyImage', '', false);

  const playStoryAudio = async (story?: Story | null) => {
    if (!story || !story.audioUrl) {
      return;
    }
    const audioUrl = story.audioUrl;
    audio.music.stop();
    await sleep(500);
    audio.music.play(audioUrl);
    audio.music.setVolume(0.1);
  };

  const closeStory = () => {
    audio.music.stop();
    setSelectedImageId('');
  };

  const auth = useAuth();
  const collectionRef = db.collections.stories(auth.uid);
  const statsCollectionRef = db.collections.storyStats(auth.uid);
  const [databaseStories, loading] = useCollectionDataOnce(collectionRef);
  const [storiesStats] = useCollectionOnce(statsCollectionRef);

  const storiesStatsMap = useMemo(() => {
    if (!storiesStats) return {};
    const map: Record<string, StoryStat> = {};
    storiesStats.forEach((stat) => {
      const id = stat.id;
      map[id] = stat.data();
    });
    return map;
  }, [storiesStats]);

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

  const { storiesToShow, defaultRandomStoryWithVideo } = useMemo(() => {
    if (!databaseStories) return { storiesToShow: [], defaultRandomStoryWithVideo: null };
    const allElements = [...(databaseStories || [])];
    const publishedStories = allElements.filter((s) => s.isPublished);

    const storiesToShow = shuffleArray(publishedStories);

    const randomStoryWithVideo = storiesToShow.find((story) => story.videoUrl) || null;

    return { storiesToShow, defaultRandomStoryWithVideo: randomStoryWithVideo };
  }, [databaseStories]);

  const [rotatedRandomStoryWithVideo, setRotatedRandomStoryWithVideo] = useState<Story | null>(
    null,
  );

  const rotateRandomStoryWithVideo = () => {
    if (storiesToShow.length === 0) return null;
    const storiesWithVideo = storiesToShow.filter((story) => story.videoUrl);
    if (storiesWithVideo.length === 0) return null;
    const randomStoryWithVideo =
      storiesWithVideo[Math.floor(Math.random() * storiesWithVideo.length)];
    setRotatedRandomStoryWithVideo(randomStoryWithVideo);
  };

  const selectedStory = useMemo(
    () => databaseStories?.find((story) => story.id === selectedImageImageId) || null,
    [databaseStories, selectedImageImageId],
  );

  const openStory = async (id: string) => {
    setSelectedImageId(id);
    audio.initAudio();
    const story = databaseStories?.find((story) => story.id === id) || null;

    if (story) {
      playStoryAudio(story);
    }
    return story;
  };

  const openRandomStory = async () => {
    if (storiesToShow.length === 0) return null;
    await audio.initAudio();
    const randomStory = storiesToShow[Math.floor(Math.random() * storiesToShow.length)];
    setSelectedImageId(randomStory.id);

    playStoryAudio(randomStory);
    return randomStory;
  };

  const openNextStory = async () => {
    if (storiesToShow.length === 0) return null;
    await audio.initAudio();
    const currentIndex = storiesToShow.findIndex((img) => img.id === selectedImageImageId);
    const nextIndex = (currentIndex + 1) % storiesToShow.length;
    const nextStory = storiesToShow[nextIndex];
    setSelectedImageId(nextStory.id);

    if (isVideoVolumeEnabled) {
      playStoryAudio(nextStory);
    }
    return nextStory;
  };

  const onPrevStory = async () => {
    if (storiesToShow.length === 0) return null;
    await audio.initAudio();
    const currentIndex = storiesToShow.findIndex((img) => img.id === selectedImageImageId);
    const prevIndex = (currentIndex - 1 + storiesToShow.length) % storiesToShow.length;
    const prevStory = storiesToShow[prevIndex];
    setSelectedImageId(prevStory.id);

    if (isVideoVolumeEnabled) {
      playStoryAudio(prevStory);
    }
    return prevStory;
  };

  return {
    loading,
    selectedStory,
    stories: storiesToShow,
    randomStoryWithVideo: rotatedRandomStoryWithVideo || defaultRandomStoryWithVideo,
    rotateRandomStoryWithVideo,
    openStory,
    openRandomStory,
    openNextStory,
    closeStory,
    onPrevStory,
    isVideoVolumeEnabled,
    setIsVideoVolumeEnabled,
    isVideoPaused,
    setIsVideoPaused,
    playStoryAudio,
    storiesStatsMap,
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
