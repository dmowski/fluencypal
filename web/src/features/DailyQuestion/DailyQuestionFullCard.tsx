import { Stack } from '@mui/material';
import { FlatChat } from '../Chat/FlatChat';
import { ChatProvider } from '../Chat/useChat';
import { DailyQuestion } from './types';
import { getDailyQuestionImage } from './data';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { useLingui } from '@lingui/react';
import { dailyQuestions } from './dailyQuestions';
import { useSettings } from '../Settings/useSettings';

export const DailyQuestionFullCard = ({
  question,
  badge,
  onClick,
}: {
  question: DailyQuestion;
  badge?: string;
  onClick?: () => void;
}) => {
  const previewImageUrl = getDailyQuestionImage(question);
  const settings = useSettings();
  const languageToLearn = settings.languageCode || 'en';
  const spaceIdPrefix = languageToLearn === 'en' ? '' : languageToLearn + '-';
  const spaceId = `${spaceIdPrefix}daily-question-${question.id}`;
  const { i18n } = useLingui();
  const questionIndex = Object.values(dailyQuestions).findIndex((q) => q.id === question.id);

  if (settings.loading) {
    return <></>;
  }

  return (
    <ChatProvider
      metadata={{
        spaceId: spaceId,
        allowedUserIds: null,
        isPrivate: false,
        type: 'dailyQuestion',
      }}
    >
      <StoreCard
        badge={badge}
        textColor={'#fff'}
        backgroundColor={'rgba(0, 0, 0, 0.5)'}
        label={i18n._('Question') + ' #' + (questionIndex + 1)}
        previewImageUrl={previewImageUrl}
        title={question.title}
        subTitle={question.description}
        items={[]}
        onClick={onClick}
        itemsBackgroundColor={'rgba(32, 32, 32, 0.98)'}
        itemsViewMode={'list'}
      >
        <Stack
          sx={{
            backgroundColor: 'rgba(32, 32, 32, 0.98)',
            borderRadius: '0 0 16px 16px',
          }}
        >
          <FlatChat />
        </Stack>
      </StoreCard>
    </ChatProvider>
  );
};
