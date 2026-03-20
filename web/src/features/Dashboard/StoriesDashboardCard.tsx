import { useLingui } from '@lingui/react';
import { Stack } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useStories } from '../Sentence/useStories';

export const StoriesDashboardCard = () => {
  const { i18n } = useLingui();
  const stories = useStories();

  const currentStory = stories.randomStoryWithVideo;
  if (!currentStory) {
    return null;
  }

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Listening Practice')}
        subTitle={i18n._('Listen, read and learn with stories')}
        buttonTitle={i18n._('See all')}
        onButtonClick={() => {
          stories.openRandomStory();
        }}
      />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={'rgba(0, 0, 0, 0.5)'}
        label={''}
        previewImageUrl={currentStory.imageUrl || ''}
        previewVideoUrl={currentStory.videoUrl || ''}
        title={currentStory.title}
        subTitle={currentStory.subtitle || ''}
        items={[]}
        onClick={() => stories.openStory(currentStory.id)}
        itemsBackgroundColor={'rgba(32, 32, 32, 0.98)'}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
