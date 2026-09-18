import { Stack } from '@mui/material';
import { StoreCard } from '@/features/uiKit/Card/StoreCard';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { INTERACTIVE_LESSON_CARD_IMAGE, INTERACTIVE_LESSON_DONE_CARD_IMAGE } from './constants';
import { lessonColor } from './lessonTheme';

export const InteractiveLessonDashboardView = ({
  title,
  subTitle,
  cardTitle,
  cardSubTitle,
  progressButtonTitle,
  badge,
  isDoneToday,
  onOpen,
  onProgressClick,
}: {
  title: string;
  subTitle?: string;
  cardTitle: string;
  cardSubTitle: string;
  progressButtonTitle: string;
  badge?: string;
  isDoneToday: boolean;
  onOpen: () => void;
  onProgressClick: () => void;
}) => {
  return (
    <Stack
      sx={{ gap: '20px' }}
      data-testid="interactive-lesson-dashboard-card"
    >
      <SectionHeader
        title={title}
        subTitle={subTitle}
        buttonTitle={progressButtonTitle}
        onButtonClick={onProgressClick}
      />
      <StoreCard
        textColor={lessonColor.textPrimary}
        backgroundColor={isDoneToday ? lessonColor.dashboardDone : lessonColor.dashboardIdle}
        previewImageUrl={isDoneToday ? INTERACTIVE_LESSON_DONE_CARD_IMAGE : INTERACTIVE_LESSON_CARD_IMAGE}
        title={cardTitle}
        subTitle={cardSubTitle}
        badge={badge}
        items={[]}
        itemsBackgroundColor={lessonColor.dashboardItems}
        itemsViewMode="list"
        onClick={onOpen}
      />
    </Stack>
  );
};
