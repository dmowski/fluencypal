import { Stack } from '@mui/material';
import { StoreCard } from '@/features/uiKit/Card/StoreCard';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { INTERACTIVE_LESSON_CARD_IMAGE, INTERACTIVE_LESSON_DONE_CARD_IMAGE } from './constants';

export const InteractiveLessonDashboardView = ({
  title,
  subTitle,
  cardTitle,
  cardSubTitle,
  historyButtonTitle,
  badge,
  isDoneToday,
  onOpen,
  onHistoryClick,
}: {
  title: string;
  subTitle?: string;
  cardTitle: string;
  cardSubTitle: string;
  historyButtonTitle: string;
  badge?: string;
  isDoneToday: boolean;
  onOpen: () => void;
  onHistoryClick: () => void;
}) => {
  return (
    <Stack
      sx={{ gap: '20px' }}
      data-testid="interactive-lesson-dashboard-card"
    >
      <SectionHeader
        title={title}
        subTitle={subTitle}
        buttonTitle={historyButtonTitle}
        onButtonClick={onHistoryClick}
      />
      <StoreCard
        textColor="#fff"
        backgroundColor={isDoneToday ? 'rgba(16, 92, 46, 0.72)' : 'rgba(18, 32, 54, 0.72)'}
        previewImageUrl={isDoneToday ? INTERACTIVE_LESSON_DONE_CARD_IMAGE : INTERACTIVE_LESSON_CARD_IMAGE}
        title={cardTitle}
        subTitle={cardSubTitle}
        badge={badge}
        items={[]}
        itemsBackgroundColor="rgba(0, 0, 0, 0.2)"
        itemsViewMode="list"
        onClick={onOpen}
      />
    </Stack>
  );
};
