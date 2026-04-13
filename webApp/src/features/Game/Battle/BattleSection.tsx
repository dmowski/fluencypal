import { Stack, Typography } from '@mui/material';
import { useBattle } from './useBattle';
import { BattleCard } from './BattleCard';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { PageContainer } from '@/features/Community/PageContainer';
import { PositionChanged } from '../PositionChanged';

const defaultLimit = 1;

export const BattleSection = () => {
  const battles = useBattle();
  const { i18n } = useLingui();
  const auth = useAuth();
  const userId = auth.uid;

  const actualBattles = battles.battles
    .filter((battle) => {
      const isMyBattle = userId ? battle.usersIds.includes(userId) : false;
      return isMyBattle;
      //return true;
    })
    .sort((a, b) => {
      return b.updatedAtIso.localeCompare(a.updatedAtIso);
    });

  const battlesToShow = actualBattles.sort((a, b) => {
    const isAHidden = a.hiddenByUsersIds?.includes(userId) ? 1 : 0;
    const isBHidden = b.hiddenByUsersIds?.includes(userId) ? 1 : 0;
    const aUpdated = a.updatedAtIso;
    const bUpdated = b.updatedAtIso;

    if (isAHidden !== isBHidden) {
      return isAHidden - isBHidden;
    }

    return bUpdated.localeCompare(aUpdated);
  });

  const isNeedToShowMoreButton = battlesToShow.length < actualBattles.length;

  if (actualBattles.length === 0)
    return (
      <PageContainer>
        <Typography variant="h6">{i18n._('No debates yet')}</Typography>
        <Stack gap="20px">
          <Typography>
            {i18n._(
              'Open someones profile and press "Invite to a debate" button to start a debate!',
            )}
          </Typography>

          <Typography>
            {i18n._(
              'You both will be challenged to record answers to 2 questions. After that, AI will analyze your answers and tell who won the debate!',
            )}
          </Typography>

          <Typography>
            {i18n._(
              'The winner will earn 40 points. The more points you have, the higher your position in the ranking!',
            )}
          </Typography>

          <Typography>
            {i18n._(
              'Top 5 in the leaderboard get the full access to all the features of the app for free! So, start debating and climb the leaderboard!',
            )}
          </Typography>
        </Stack>

        <Stack
          sx={{
            paddingTop: '40px',
          }}
        >
          <PositionChanged />
        </Stack>
      </PageContainer>
    );

  return (
    <Stack
      sx={{
        gap: '5px',
        width: '100%',
        paddingBottom: '20px',
      }}
    >
      <Stack
        sx={{
          gap: '30px',
        }}
      >
        {battlesToShow.map((battle) => (
          <Stack key={battle.battleId}>
            <BattleCard battle={battle} />
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
