import { Stack, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

const verifiedUserIds = ['Mq2HfU3KrXTjNyOpPXqHSPg5izV2'];

type Size = 'small' | 'normal' | 'large';

export const UserName = ({
  userId,
  userName,
  bold,
  size,
  center,
  hideBadge,
}: {
  userId: string;
  userName: string;
  bold?: boolean;
  size?: Size;
  center?: boolean;
  hideBadge?: boolean;
}) => {
  const isVerified = verifiedUserIds.includes(userId) && hideBadge !== true;

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: size === 'large' ? '6px' : '5px',
      }}
    >
      {center && (
        <Stack
          sx={{
            width: '6px',
          }}
        />
      )}
      <Typography
        variant={size === 'large' ? 'h4' : 'body1'}
        sx={{
          lineHeight: '1',
          fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '27px' : '1rem',
          fontWeight: bold ? '600' : '400',

          '@media (max-width: 600px)': {
            fontSize: size === 'large' ? '18px' : '1rem',
          },

          '@media (max-width: 350px)': {
            fontSize: size === 'large' ? '14px' : '12px',
          },
          '@media (max-width: 310px)': {
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }}
      >
        {userName}
      </Typography>
      <Badge size={size} isShow={isVerified} />
    </Stack>
  );
};

const Badge = ({ size, isShow, opacity }: { size?: Size; isShow: boolean; opacity?: number }) => {
  if (!isShow) return null;
  return (
    <VerifiedIcon
      sx={{
        color: '#29b3e5',
        fontSize: size === 'large' ? '20px' : '15px',
        opacity: opacity ?? 1,
        marginTop: size === 'large' ? '3px' : '0',
      }}
    />
  );
};
