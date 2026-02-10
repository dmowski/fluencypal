import { useGame } from '@/features/Game/useGame';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useAccess } from '../useAccess';
import { useUsage } from '../useUsage';
import { AccessStatusIcon } from './AccessStatusIcon';

export const BalanceStatus = () => {
  const usage = useUsage();
  const game = useGame();
  const access = useAccess();

  const { i18n } = useLingui();

  const activeTill = usage.activeSubscriptionTill
    ? `${dayjs(usage.activeSubscriptionTill).format('DD MMMM (YYYY)')}`
    : null;

  const isGameWinner = game.isGameWinner;
  const balanceHours = usage.balanceHours;

  const isHaveAccess = access.isFullAppAccess;

  return (
    <Stack
      sx={{
        gap: '10px',
        width: '100%',
        paddingBottom: '0px',
      }}
    >
      <Typography variant="h3" component="h3" sx={{ marginBottom: '10px', fontWeight: 800 }}>
        {i18n._('Your access status')}
      </Typography>

      <Stack
        sx={{
          gap: '20px',
        }}
      >
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr',
            gap: '15px',
            alignItems: 'center',
          }}
        >
          <AccessStatusIcon
            state={usage.loading ? 'loading' : isHaveAccess ? 'full-access' : 'no-access'}
          />
          <Typography variant="h6" sx={{}}>
            {usage.loading
              ? i18n._('Loading...')
              : isHaveAccess
                ? i18n._('You have full access')
                : i18n._('You do not have full access')}
          </Typography>
        </Stack>
        <Stack
          sx={{
            maxWidth: '700px',
          }}
        >
          {isGameWinner ? (
            <Typography variant="body1">
              {i18n._(
                'You are a leader in leaderboard! Full access is active until you are on the top-5',
              )}
            </Typography>
          ) : activeTill ? (
            <Typography variant="body1">
              {i18n._('Your full access is active until {date}', { date: activeTill })}
            </Typography>
          ) : balanceHours > 0 ? (
            <Typography variant="body1">
              {i18n._('You have {hours} AI hours on your balance', {
                hours: balanceHours.toFixed(1),
              })}
            </Typography>
          ) : (
            <Typography variant="body1">
              {i18n._(
                'You can purchase a full access plan or get full access for free (more details in the FAQ section below).',
              )}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
