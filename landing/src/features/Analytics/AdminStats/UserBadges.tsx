import { Stack, Tooltip, Typography } from '@mui/material';
import { Crown, HandCoins } from 'lucide-react';
import dayjs from 'dayjs';

interface UserBadgesProps {
  isFromChatGpt: boolean | undefined;
  isGameWinner: boolean;
  isActiveSubscriber: boolean;
  activeSubscriptionTill?: string | null;
}

export function UserBadges({
  isFromChatGpt,
  isGameWinner,
  isActiveSubscriber,
  activeSubscriptionTill,
}: UserBadgesProps) {
  return (
    <>
      {isFromChatGpt && (
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 0',
            color: '#1da1f2',
          }}
        >
          <Stack
            component={'img'}
            sx={{
              width: '50px',
              height: '50px',
            }}
            src="https://us1.discourse-cdn.com/openai1/original/4X/3/2/1/321a1ba297482d3d4060d114860de1aa5610f8a9.png"
          />
        </Stack>
      )}

      {isGameWinner && (
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 0',
            background: 'linear-gradient(120deg, #fda085, #8f361eff)',
            color: '#fff',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            justifyContent: 'center',
          }}
        >
          <Crown size={'25px'} />
        </Stack>
      )}

      {isActiveSubscriber && activeSubscriptionTill && (
        <Tooltip
          title={`Subscriber till: ${dayjs(activeSubscriptionTill).format('DD MMMM HH:mm')}`}
        >
          <Stack
            sx={{
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 0',
                background: 'linear-gradient(120deg, #ff6ec4, #1f1aa9ff)',
                color: '#fff',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                justifyContent: 'center',
              }}
            >
              <HandCoins size={'25px'} />
            </Stack>
            <Typography variant="caption" align="center">
              {dayjs(activeSubscriptionTill).format('DD MMM')}
            </Typography>
          </Stack>
        </Tooltip>
      )}
    </>
  );
}
