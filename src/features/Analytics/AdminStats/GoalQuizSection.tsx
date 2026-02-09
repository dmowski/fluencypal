import { Stack, Typography, IconButton } from '@mui/material';
import { SquareArrowOutUpRight } from 'lucide-react';
import { UserStat } from '@/app/api/loadStats/types';
import { GoalPlan } from '../../Plan/types';

interface GoalQuizSectionProps {
  goalQuiz2: UserStat['goalQuiz2'];
  aiUserInfo?: UserStat['aiUserInfo'];
  onGoalClick: (goalData: GoalPlan) => void;
}

export function GoalQuizSection({ goalQuiz2, aiUserInfo, onGoalClick }: GoalQuizSectionProps) {
  if (goalQuiz2.length === 0) return null;

  return (
    <Stack
      sx={{
        backgroundColor: 'rgba(20, 79, 146, 1)',
        borderRadius: '8px',
        gap: '2px',
      }}
    >
      {goalQuiz2.map((quiz, index) => (
        <Stack
          key={index}
          sx={{
            flexDirection: 'row',
            padding: '10px',
            borderRadius: '8px 8px 0 0',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            ':hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
          }}
          onClick={() => {
            if (quiz.goalData) {
              onGoalClick(quiz.goalData);
            }
          }}
        >
          <Typography variant="h6">{quiz?.goalData?.title || ''}</Typography>

          <IconButton>
            <SquareArrowOutUpRight size={'18px'} />
          </IconButton>
        </Stack>
      ))}

      <Stack
        sx={{
          gap: '20px',
          padding: '10px',
        }}
      >
        <Typography variant="body1">{goalQuiz2[0]?.aboutUserTranscription || ''}</Typography>
        <Stack>
          <Typography variant="caption" sx={{}}>
            {goalQuiz2[0]?.aboutUserFollowUpQuestion.title}
          </Typography>
          <Typography variant="body1">
            {goalQuiz2[0]?.aboutUserFollowUpTranscription || ''}
          </Typography>
        </Stack>

        <Stack>
          <Typography variant="caption">{goalQuiz2[0]?.goalFollowUpQuestion.title}</Typography>
          <Typography variant="body1">{goalQuiz2[0]?.goalUserTranscription || ''}</Typography>
        </Stack>

        {aiUserInfo?.records && (
          <details open>
            <summary>AI User Info Records ({aiUserInfo.records.length})</summary>

            <Stack sx={{ gap: '10px', paddingTop: '10px' }}>
              {aiUserInfo?.records.map((record, index) => (
                <Typography
                  key={index}
                  variant="body1"
                  sx={{
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {record}
                </Typography>
              ))}
            </Stack>
          </details>
        )}
      </Stack>
    </Stack>
  );
}
