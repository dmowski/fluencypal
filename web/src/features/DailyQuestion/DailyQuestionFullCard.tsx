import { Stack, Typography } from '@mui/material';
import { FlatChat } from '../Chat/FlatChat';
import { ChatProvider } from '../Chat/useChat';
import { ColorIconTextList } from '../Survey/ColorIconTextList';
import { DailyQuestion } from './types';

export const DailyQuestionFullCard = ({
  question,
  backgroundColor,
  isShowFlameIcon,
  badge,
}: {
  question: DailyQuestion;
  backgroundColor: string;
  isShowFlameIcon: boolean;
  badge: string;
}) => {
  return (
    <ChatProvider
      metadata={{
        spaceId: 'daily-question-' + question.id,
        allowedUserIds: null,
        isPrivate: false,
        type: 'dailyQuestion',
      }}
    >
      <Stack
        sx={{
          padding: '0',
          color: '#fff',
          textDecoration: 'none',
          maxWidth: '700px',
          borderRadius: '15px',
          width: '100%',
          height: 'auto',
          cursor: 'initial',

          background: backgroundColor,
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
            padding: '21px 0 4px 0',
          },
        }}
      >
        <Stack
          sx={{
            width: '100%',
            gap: '40px',
          }}
        >
          <Stack
            sx={{
              padding: '25px 25px 0 25px',
              '@media (max-width:600px)': {
                padding: '15px 15px 0 15px',
              },
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
                {isShowFlameIcon && (
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
                  {badge}
                </Typography>
              </Stack>
            </Stack>

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
              {question.title}
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
              {question.description}
            </Typography>

            <Stack
              sx={{
                padding: '20px 0 10px 0',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <ColorIconTextList
                gap="8px"
                listItems={question.hints.map((hint) => ({
                  iconColor: 'rgba(255, 255, 255, 0.9)',
                  title: hint,
                  iconName: 'lightbulb',
                }))}
              />
            </Stack>
          </Stack>

          <Stack sx={{}}>
            <FlatChat />
          </Stack>
        </Stack>
      </Stack>
    </ChatProvider>
  );
};
