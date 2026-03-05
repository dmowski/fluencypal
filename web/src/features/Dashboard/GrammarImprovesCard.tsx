import { useLingui } from '@lingui/react';

import { Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useAiUserInfo } from '../Ai/useAiUserInfo';
import { AdvancedUserRecord } from '@/common/userInfo';
import { useAuth } from '../Auth/useAuth';

export const GrammarImprovesCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const userInfo = useAiUserInfo();
  const grammarPoints = userInfo.grammarRecords;

  if (!auth.isFounder) {
    return <></>;
  }

  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'flex-start',
        gap: '30px',

        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        //padding: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '40px 0px 0px 0px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          border: 'none',
        },
      }}
    >
      <Stack
        sx={{
          gap: '30px',
          padding: '30px 30px 30px 30px',
          '@media (max-width:600px)': {
            padding: '0px 20px 0 20px',
          },
        }}
      >
        <Stack
          sx={{
            gap: '10px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: '800',
              textWrap: 'balance',
              '@media (max-width:600px)': {
                fontSize: '2rem',
                lineHeight: '2.2rem',
              },
            }}
          >
            {i18n._('Improvement practice for you')}
          </Typography>

          <Typography
            sx={{
              opacity: 0.9,
            }}
          >
            {i18n._(
              'Based on your recent conversations, here are some tips to improve your grammar. Click on the tip to see more details!',
            )}
          </Typography>
        </Stack>

        <Stack
          sx={{
            gap: '20px',
          }}
        >
          {grammarPoints.length === 0 ? (
            <Typography sx={{ opacity: 0.8 }}>
              {i18n._('No grammar insights yet. Start chatting to get personalized tips!')}
            </Typography>
          ) : (
            grammarPoints.map((record, index) => (
              <GrammarImprovementCard key={index} record={record} />
            ))
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const GrammarImprovementCard = ({ record }: { record: AdvancedUserRecord }) => {
  return (
    <Stack
      sx={{
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px',
      }}
    >
      <Typography>{record.value}</Typography>
    </Stack>
  );
};
