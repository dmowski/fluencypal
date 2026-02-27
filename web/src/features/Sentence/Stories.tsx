import { useLingui } from '@lingui/react';
import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { useAuth } from '../Auth/useAuth';
import { Story } from './types';
import { useUrlState } from '../Url/useUrlState';
import { sleep } from '@/libs/sleep';
import { StoryPreview } from './StoryPreview';
import { db } from '../Firebase/firebaseDb';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import { getDoc, setDoc } from 'firebase/firestore';
import { StoryModal } from './StoryModal';
import { uniq } from '@/libs/uniq';
import { shuffleArray } from '@/libs/array';

export const Stories = () => {
  const { i18n } = useLingui();
  const [selectedImageImageId, setSelectedImageId] = useUrlState('storyImage', '', false);

  const auth = useAuth();
  const collectionRef = db.collections.stories(auth.uid);
  const [databaseStories] = useCollectionDataOnce(collectionRef);
  const audio = useConversationAudio();

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

    const limit = 7;

    const storiesToShow = shuffleArray(publishedStories).slice(0, limit);

    return storiesToShow;
  }, [databaseStories]);

  const selectedStory = useMemo(
    () => databaseStories?.find((story) => story.id === selectedImageImageId) || null,
    [databaseStories, selectedImageImageId],
  );

  const closeStory = () => {
    setSelectedImageId('');
    audio.music.stop();
  };

  const playStoryAudio = async (story?: Story | null) => {
    if (!story || !story.audioUrl) {
      return;
    }
    const audioUrl = story.audioUrl;
    await sleep(500);
    audio.music.play(audioUrl);
    audio.music.setVolume(0.1);
  };

  const onNext = async () => {
    await audio.initAudio();
    const currentIndex = storiesToShow.findIndex((img) => img.id === selectedImageImageId);
    const nextIndex = (currentIndex + 1) % storiesToShow.length;
    const nextImage = storiesToShow[nextIndex];
    setSelectedImageId(nextImage.id);

    audio.music.stop();

    playStoryAudio(nextImage);
  };

  const onSelectImage = async (imageId: string) => {
    setSelectedImageId(imageId);
    await audio.initAudio();
    const story = storiesToShow.find((s) => s.id === imageId);
    playStoryAudio(story);
  };

  return (
    <Stack
      sx={{
        alignItems: 'flex-start',
        gap: '0px',
        marginTop: '20px',

        width: '100%',
        position: 'relative',
      }}
    >
      {selectedStory && <StoryModal data={selectedStory} onClose={closeStory} onNext={onNext} />}
      <Stack
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          flexDirection: 'row',
          padding: '5px 10px 0px 10px',
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            opacity: 0.8,
          }}
        >
          {i18n._('Expand vocabulary with stories')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          position: 'relative',
          width: '99%',
          overflow: 'hidden',
          height: 'calc(100% + 20px)',
        }}
      >
        <Stack
          sx={{
            overflowX: 'scroll',
            paddingBottom: '15px',
            paddingRight: '10px',

            // Scrollbar styles
            '&::-webkit-scrollbar': {
              height: '0px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(100, 100, 100, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'rgba(100, 100, 100, 0.1)',
            },
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '6px 15px 20px 7px',
              width: 'max-content',
              minHeight: '220px',
            }}
          >
            {!selectedStory &&
              storiesToShow.map((story) => {
                return <StoryPreview key={story.id} onSelectImage={onSelectImage} image={story} />;
              })}
          </Stack>
        </Stack>

        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            width: '80px',
            height: '100%',
            position: 'absolute',
            zIndex: 122,
            top: 0,
            color: '#fff',
            right: '-2px',
            border: 'none',
            background:
              'linear-gradient(90deg, rgba(10, 18, 30, 0.1) 0%, rgba(10, 18, 30, 1) 90%, rgba(10, 18, 30, 1) 100%)',
            cursor: 'pointer',
          }}
        ></Stack>
      </Stack>
    </Stack>
  );
};
