import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { dailyQuestions } from './dailyQuestions';
import dayjs from 'dayjs';
import { ColorIconTextList } from '@/features/Survey/ColorIconTextList';
import { ChatSection } from '@/features/Chat/ChatSection';
import { ChatProvider } from '@/features/Chat/useChat';
import { DailyQuestion } from './types';
import { PageContainer } from '@/features/Community/PageContainer';
import { useSettings } from '@/features/Settings/useSettings';

export const DailyQuestionBadge = () => {
  const settings = useSettings();
  const createdAt = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceUserCreatedAccount = createdAt ? dayjs().diff(dayjs(createdAt), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceUserCreatedAccount % questionsKeys.length;

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];
  const { i18n } = useLingui();

  if (!todaysQuestion) {
    return (
      <PageContainer>
        <Stack
          sx={{
            gap: '5px',
          }}
        >
          <Typography variant="h6">{i18n._('No daily question for today')}</Typography>
          <Typography variant="body2">
            {i18n._(
              'Sorry, there is no daily question available for today. Please check back tomorrow!',
            )}
          </Typography>
        </Stack>
      </PageContainer>
    );
  }

  return (
    <Stack
      sx={{
        gap: '90px',
      }}
    >
      <QuestionSection question={todaysQuestion} isOld={false} />

      {questionsKeys
        .filter((key, index) => index < questionIndex)
        .map((key) => {
          const question = dailyQuestions[key];
          return (
            <Stack key={question.id}>
              <QuestionSection question={question} isOld={true} />
            </Stack>
          );
        })}
    </Stack>
  );
};

const QuestionSection = ({ question, isOld }: { question: DailyQuestion; isOld: boolean }) => {
  return (
    <Stack>
      <ChatProvider
        metadata={{
          spaceId: 'daily-question-' + question.id,
          allowedUserIds: null,
          isPrivate: false,
          type: 'dailyQuestion',
        }}
      >
        <DailyQuestionBadgeComponent todaysQuestion={question} isOld={isOld} />
      </ChatProvider>
    </Stack>
  );
};

export const DailyQuestionBadgeComponent = ({
  todaysQuestion,
  isOld,
}: {
  todaysQuestion: DailyQuestion;
  isOld: boolean;
}) => {
  const { i18n } = useLingui();

  const content = (
    <>
      <Typography
        sx={{
          paddingTop: '10px',
          fontSize: '1.7rem',
          fontWeight: 560,
          lineHeight: 1.3,
          '@media (max-width:600px)': {
            fontSize: '1.5rem',
          },
        }}
      >
        {todaysQuestion.title}
      </Typography>

      <Typography
        sx={{
          paddingTop: '10px',
          fontSize: '0.9rem',
          fontWeight: 350,
          lineHeight: 1.3,
          color: '#fff',
          opacity: 0.96,
        }}
      >
        {todaysQuestion.description}
      </Typography>
    </>
  );

  return (
    <Stack
      sx={{
        padding: '21px 20px 24px 20px',
        color: '#fff',
        textDecoration: 'none',
        maxWidth: '700px',
        borderRadius: '15px',
        width: '100%',
        height: 'auto',
        cursor: 'initial',

        background: isOld ? 'rgba(25, 88, 115, 0.2)' : 'rgba(115, 25, 35, 0.2)',
        boxShadow: '0px 0px 0px 1px rgba(255, 255, 255, 0)',
        flexDirection: 'row',
        transition: 'all 0.3s ease',
        gap: '20px',
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'grid',
        minHeight: '120px',
        gridTemplateColumns: '1fr',
        '@media (max-width:600px)': {
          boxShadow: 'none',
          borderRadius: '0px',
        },
      }}
    >
      <Stack
        sx={{
          width: '100%',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            color: '#feb985ff',
            paddingBottom: '5px',
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {!isOld && (
              <img
                src="/icons/flame-icon.svg"
                style={{
                  width: 20,
                  height: 20,
                  position: 'relative',
                  top: '-2px',
                  left: '-1px',
                }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
              }}
            >
              {isOld ? i18n._('Previous Question') : i18n._("Today's Question")}
            </Typography>
          </Stack>
        </Stack>

        {content}

        <Stack
          sx={{
            padding: '20px 0 10px 0',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <ColorIconTextList
            gap="8px"
            listItems={todaysQuestion.hints.map((hint) => ({
              iconColor: 'rgba(255, 255, 255, 0.9)',
              title: hint,
              iconName: 'lightbulb',
            }))}
          />
        </Stack>

        <Stack
          sx={{
            gap: '20px',
            padding: '40px 0 0px 0',
          }}
        >
          {!isOld && (
            <Stack>
              <Typography variant="h6">{i18n._(`Community Responses:`)}</Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(`You can discuss the daily question here.`)}
              </Typography>
            </Stack>
          )}

          <ChatSection
            placeholder={i18n._('What do you think?')}
            titleContent={<Stack>{content}</Stack>}
            contextForAiAnalysis={todaysQuestion.title + '. ' + todaysQuestion.description}
            addNewPostButtonText={i18n._('Add Response')}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
