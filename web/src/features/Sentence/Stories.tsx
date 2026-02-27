import { useLingui } from '@lingui/react';
import { Button, Typography } from '@mui/material';
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
import { ArrowRight } from 'lucide-react';

export const Stories = () => {
  const { i18n } = useLingui();

  const auth = useAuth();

  const stories = useStories();
  const audio = useConversationAudio();

  const closeStory = () => {
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
    stories.openStory(imageId);
    await audio.initAudio();
    const story = stories.openStory(imageId);
    playStoryAudio(story);
  };

  return (
    <Stack
      sx={{
        alignItems: 'center',
        gap: '40px',
        marginTop: '20px',

        width: '100%',
        position: 'relative',
        flexDirection: 'row',
      }}
    >
      <Stack
        sx={{
          position: 'relative',
        }}
      >
        <Stack sx={{}}>
          <Stack
            sx={{
              flexDirection: 'row',
              position: 'relative',
            }}
          >
            {!stories.selectedStory && stories.stories && (
              <>
                <Stack
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '20px',
                    transform: 'rotate(0deg) scale(0.9)',
                  }}
                >
                  <StoryPreview onSelectImage={() => {}} image={stories.stories[0]} />
                </Stack>
                <StoryPreview onSelectImage={() => {}} image={stories.stories[1]} />
                <Stack
                  sx={{
                    position: 'absolute',

                    top: 0,
                    left: '10px',
                    transform: 'rotate(0deg) scale(0.95)',
                  }}
                >
                  <StoryPreview onSelectImage={() => {}} image={stories.stories[2]} />
                </Stack>
              </>
            )}
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          width: '100%',
          alignItems: 'flex-start',
          gap: '15px',
        }}
      >
        <Stack>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._('No time to speak?')}
          </Typography>
          <Typography>{i18n._('Play stories and listen to them on the go')}</Typography>
        </Stack>
        <Button variant="outlined" color="info" endIcon={<ArrowRight />} onClick={onNext}>
          {i18n._('See stories')}
        </Button>
      </Stack>
    </Stack>
  );
};
