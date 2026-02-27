import { useLingui } from '@lingui/react';
import { Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { StoryPreview } from './StoryPreview';
import { StoryModal } from './StoryModal';
import { useStories } from './useStories';
import { ArrowRight } from 'lucide-react';

export const Stories = () => {
  const { i18n } = useLingui();
  const stories = useStories();

  return (
    <Stack
      sx={{
        alignItems: 'center',
        gap: '45px',
        marginTop: '20px',

        width: '100%',
        position: 'relative',
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '25px',
        '@media (max-width:400px)': {
          flexDirection: 'column',
          borderRadius: '0px',
          padding: '15px',
          alignItems: 'flex-start',
          gap: '15px',
        },
      }}
    >
      {stories.selectedStory && (
        <StoryModal
          data={stories.selectedStory}
          onClose={stories.closeStory}
          onNext={stories.openNextStory}
        />
      )}

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
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <StoryPreview
                    onSelectImage={() => {
                      stories.openStory(stories.stories[1].id);
                    }}
                    image={stories.stories[1]}
                  />
                </Stack>

                <Stack
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '20px',
                    transform: 'rotate(0deg) scale(0.9)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                >
                  <StoryPreview image={stories.stories[0]} />
                </Stack>

                <Stack
                  sx={{
                    position: 'absolute',

                    top: 0,
                    left: '10px',
                    transform: 'rotate(0deg) scale(0.95)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                >
                  <StoryPreview image={stories.stories[2]} />
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
            variant="h3"
            sx={{
              fontWeight: 800,
              '@media (max-width:600px)': {
                fontSize: '1.5rem',
                lineHeight: '1.8rem',
              },
            }}
          >
            {i18n._('No time to speak?')}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, textWrap: 'balance' }}>
            {i18n._(
              'Play stories and listen to them on the go. Good alternative to TikTok and Instagram reels',
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
            onClick={stories.openNextStory}
            sx={{
              padding: '10px 30px',
            }}
          >
            {i18n._('See stories')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
