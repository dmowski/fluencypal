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
import { useStories } from './useStories';

export const Stories = () => {
  const { i18n } = useLingui();
  const [selectedImageImageId, setSelectedImageId] = useUrlState('storyImage', '', false);

  const auth = useAuth();

  const stories = useStories();
  const audio = useConversationAudio();

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
    const nextStory = stories.openNextStory();
    audio.music.stop();

    playStoryAudio(nextStory);
  };

  const onSelectImage = async (imageId: string) => {
    setSelectedImageId(imageId);
    await audio.initAudio();
    const story = stories.openStory(imageId);
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
            {!stories.selectedStory &&
              stories.stories.map((story) => {
                return <StoryPreview key={story.id} onSelectImage={onSelectImage} image={story} />;
              })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
