import { useLingui } from '@lingui/react';
import { Badge, Stack, Typography } from '@mui/material';
import { Gem, Lock, Rocket, Sparkle } from 'lucide-react';

export const CommunityCard = ({
  title,
  onClick,
  badgeNumber,
  icon,
  isLocked,
  onLockedClick,
  isPremium,
}: {
  title: string;
  onClick: () => void;
  badgeNumber?: number;
  icon: React.ReactNode;
  isLocked?: boolean;
  onLockedClick?: () => void;
  isPremium?: boolean;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack
      component={'button'}
      onClick={isLocked ? onLockedClick : onClick}
      sx={{
        gap: '5px',
        padding: '24px 15px 15px 15px',
        textAlign: 'left',
        color: 'inherit',
        background: isLocked ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.01)',
        border: '1px solid rgba(255, 255, 255, 0.05)',

        height: '100%',
        width: '100%',
        borderRadius: '12px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        alignItems: 'center',
        position: 'relative',

        '@media (max-width: 600px)': {
          padding: '20px 15px 10px 15px',
          gap: '0px',
          borderRadius: '10px',
          border: 'none',
        },
      }}
    >
      {isLocked && (
        <Stack
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: isLocked ? 'rgba(11, 136, 232, 0.5)' : 'rgba(181, 16, 199, 0)',
            color: isLocked ? '#fff' : 'rgb(255, 255, 255)',
            padding: isLocked ? '2px 6px' : '7px 7px',
            borderRadius: isLocked ? '4px' : '6px',
            flexDirection: 'row',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          {isPremium ? <Sparkle size={'19px'} /> : <Lock size={'11px'} />}
          {isLocked && (
            <Typography
              sx={{
                fontSize: '10px',
                color: '#fff',
              }}
            >
              {i18n._('Locked')}
            </Typography>
          )}
        </Stack>
      )}
      <Badge color="error" badgeContent={badgeNumber ?? 0}>
        <Stack
          sx={{
            padding: '5px',
          }}
        >
          {icon}
        </Stack>
      </Badge>
      <Stack
        sx={{
          minHeight: '50px',
          justifyContent: 'center',
          //border: '1px solid red',
        }}
      >
        <Typography
          sx={{
            fontSize: '13px',
            textTransform: 'uppercase',
            opacity: 0.8,
            textAlign: 'center',

            '@media (max-width: 600px)': {
              fontSize: '13px',
            },
          }}
        >
          {title}
        </Typography>
      </Stack>
    </Stack>
  );
};
