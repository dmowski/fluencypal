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
        gap: '40px',
        marginTop: '20px',

        width: '100%',
        position: 'relative',
        flexDirection: 'row',
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
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._('No time to speak?')}
          </Typography>
          <Typography>{i18n._('Play stories and listen to them on the go')}</Typography>
        </Stack>
        <Button
          variant="outlined"
          color="info"
          endIcon={<ArrowRight />}
          onClick={stories.openNextStory}
        >
          {i18n._('See stories')}
        </Button>
      </Stack>
    </Stack>
  );
};
