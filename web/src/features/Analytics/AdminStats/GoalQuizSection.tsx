import { Stack, Typography, IconButton, Button } from '@mui/material';
import { SquareArrowOutUpRight } from 'lucide-react';
import { UserStat } from '@/app/api/loadStats/types';
import { GoalPlan } from '../../Plan/types';
import { AdvancedUserRecord } from '@/features/User/userInfo';
import { useState } from 'react';
import { GrammarImprovesCardUi } from '@/features/Dashboard/Grammar/GrammarImprovesCard';
import { GrammarImprovementProvider } from '@/features/Dashboard/Grammar/useGrammarImprovement';
import { SupportedLanguage } from '@/features/Lang/lang';

interface GoalQuizSectionProps {
  goalQuiz2: UserStat['goalQuiz2'];
  userStat: UserStat;
  aiUserInfo?: UserStat['aiUserInfo'];
  onGoalClick: (goalData: GoalPlan) => void;
}

export function GoalQuizSection({
  goalQuiz2,
  aiUserInfo,
  onGoalClick,
  userStat,
}: GoalQuizSectionProps) {
  const grammarRecordsMap = aiUserInfo?.grammarRecordsMap;
  const allGrammarRecords = grammarRecordsMap
    ? (Object.values(grammarRecordsMap).flat() as AdvancedUserRecord[])
    : [];

  const [showGrammarCards, setShowGrammarCards] = useState(false);

  const languageUserCode: SupportedLanguage = userStat.userData.languageCode || 'en';

  const nativeLanguage =
    userStat.userData.nativeLanguageCode || userStat.userData.pageLanguageCode || 'en';

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

        <details open>
          <summary>User Records ({aiUserInfo?.advancedRecords?.length || 0})</summary>

          <Stack sx={{ gap: '10px', paddingTop: '10px' }}>
            {aiUserInfo?.advancedRecords?.map((record, index) => (
              <AdvancedUserRecordRow key={index} record={record} />
            ))}
          </Stack>
        </details>

        <details open>
          <summary>Grammar Records ({allGrammarRecords.length || 0})</summary>

          <Stack sx={{ gap: '10px', paddingTop: '10px', alignItems: 'flex-start' }}>
            <Button
              disabled={!allGrammarRecords.length}
              variant="contained"
              color="secondary"
              onClick={() => {
                setShowGrammarCards((prev) => !prev);
              }}
            >
              Show Grammar full ({languageUserCode})
            </Button>

            {showGrammarCards && (
              <Stack
                sx={{
                  width: '700px',
                  backgroundColor: `rgba(10, 18, 30, 1)`,
                  padding: '20px',
                }}
              >
                <GrammarImprovementProvider
                  grammarPointsOverride={allGrammarRecords}
                  languageCodeOverride={languageUserCode}
                  nativeLanguageCodeOverride={nativeLanguage}
                >
                  <GrammarImprovesCardUi />
                </GrammarImprovementProvider>
              </Stack>
            )}

            {allGrammarRecords.map((record, index) => (
              <AdvancedUserRecordRow key={index} record={record} />
            ))}
          </Stack>
        </details>
      </Stack>
    </Stack>
  );
}

export const AdvancedUserRecordRow = ({ record }: { record: AdvancedUserRecord }) => {
  return (
    <Stack
      sx={{
        padding: '8px',
        borderRadius: '4px',
        fontSize: '18px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}
    >
      <Typography>{record.value}</Typography>
      <Typography
        variant="caption"
        sx={{
          width: '160px',
          textAlign: 'right',
        }}
      >
        {record.createdAtDayIso}
      </Typography>
    </Stack>
  );
};
