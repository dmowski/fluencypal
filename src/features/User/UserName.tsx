import { Stack, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

const verifiedUserIds = ['Mq2HfU3KrXTjNyOpPXqHSPg5izV2'];

type Size = 'normal' | 'large';

export const UserName = ({
  userId,
  userName,
  bold,
  size,
  center,
}: {
  userId: string;
  userName: string;
  bold?: boolean;
  size?: Size;
  center?: boolean;
}) => {
  const isVerified = verifiedUserIds.includes(userId);

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: size === 'large' ? '6px' : '5px',
      }}
    >
      {center && <Badge size={size} isShow={isVerified} opacity={0} />}
      <Typography
        variant={size === 'large' ? 'h4' : 'body1'}
        sx={{
          lineHeight: '1',
          fontSize: size === 'large' ? '27px' : '1rem',
          fontWeight: bold ? '600' : '400',

          '@media (max-width: 600px)': {
            fontSize: size === 'large' ? '18px' : '1rem',
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
