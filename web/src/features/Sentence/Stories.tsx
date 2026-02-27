import { useLingui } from '@lingui/react';
import { Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { StoryPreview } from './StoryPreview';
import { StoryModal } from './StoryModal';
import { useStories } from './useStories';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export const Stories = () => {
  const { i18n } = useLingui();
  const stories = useStories();

  return (
    <>
      {stories.selectedStory && (
        <StoryModal
          data={stories.selectedStory}
          onClose={stories.closeStory}
          onNext={stories.openNextStory}
          onPrev={stories.onPrevStory}
        />
      )}
      <Stack
        sx={{
          alignItems: 'center',
          gap: '35px',
          marginTop: '20px',

          width: '100%',
          position: 'relative',
          flexDirection: 'row',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '28px 0 20px 20px',
          zIndex: 1,
          '@media (max-width:600px)': {
            //alignItems: 'flex-start',
            //backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderLeft: 'none',
            paddingLeft: '7px',
            borderRight: 'none',
            borderRadius: '0',
            //border: 'none',
          },
        }}
      >
        <Stack
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            overflow: 'hidden',
            borderRadius: '16px',
            zIndex: -1,
            opacity: 1,
            '@media (max-width:600px)': {
              borderRadius: '0',
            },
          }}
        >
          {stories.randomStoryWithVideo?.imageUrl && (
            <Image
              src={stories.randomStoryWithVideo?.imageUrl}
              alt="Stories background"
              fill
              sizes="20px"
              quality={40}
              style={{
                objectFit: 'cover',
                filter: 'blur(30px) brightness(0.3) contrast(0.94)',
                transform: 'scale(1.2) ',
              }}
            />
          )}
        </Stack>

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
              {stories.randomStoryWithVideo && (
                <>
                  <Stack
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      backgroundColor: 'rgba(0, 0, 0, 1)',
                      borderRadius: '8px',
                      width: '130px',
                      aspectRatio: '130 / 200',
                      '@media (max-width:400px)': {
                        width: '90px',
                      },
                    }}
                  >
                    <StoryPreview
                      onSelectImage={() => {
                        stories.openStory(stories.randomStoryWithVideo?.id || '');
                      }}
                      data={stories.randomStoryWithVideo}
                    />
                  </Stack>

                  <Stack
                    sx={{
                      position: 'absolute',

                      top: '-13px',
                      left: '0',
                      transform: 'rotate(0deg) scale(0.93)',
                      pointerEvents: 'none',
                      zIndex: 0,
                      width: '130px',
                      aspectRatio: '130 / 200',

                      backgroundColor: 'rgb(111, 6, 24)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.51)',
                      '@media (max-width:400px)': {
                        width: '90px',
                      },
                    }}
                  ></Stack>

                  <Stack
                    sx={{
                      position: 'absolute',
                      top: '-21px',
                      left: '0',
                      transform: 'rotate(0deg) scale(0.88)',
                      pointerEvents: 'none',
                      zIndex: -1,
                      width: '130px',
                      aspectRatio: '130 / 200',
                      backgroundColor: 'rgba(200, 2, 75, 0.72)',
                      border: '1px solid rgba(255, 255, 255, 0.51)',
                      borderRadius: '8px',
                      '@media (max-width:400px)': {
                        width: '90px',
                      },
                    }}
                  ></Stack>
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
            padding: '25px 0 30px 0',
          }}
        >
          <Stack
            sx={{
              padding: '0 10px 0 0',
              gap: '4px',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                '@media (max-width:600px)': {
                  fontSize: '1.5rem',
                  lineHeight: '1.8rem',
                },
                '@media (max-width:400px)': {
                  fontSize: '1.2rem',
                  lineHeight: '1.8rem',
                },
              }}
            >
              {i18n._('No time to speak?')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, textWrap: 'balance' }}>
              {i18n._(
                'Expand your vocabulary by listening to stories on the go. Good alternative to TikTok and Instagram reels',
              )}
            </Typography>
          </Stack>
          <Stack
            sx={{
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Button
              variant="outlined"
              color="info"
              endIcon={<ArrowRight />}
              onClick={() => {
                if (stories.randomStoryWithVideo) {
                  stories.openStory(stories.randomStoryWithVideo.id);
                } else {
                  stories.openRandomStory();
                }
              }}
              sx={{
                padding: '10px 30px',
                textAlign: 'left',
                '@media (max-width:600px)': {
                  padding: '8px 15px',
                },
              }}
            >
              {i18n._('Open')}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};
