import Image from 'next/image';
import { Stack } from '@mui/material';

export const Avatar = ({
  url,
  avatarSize = '90px',
  onClick,
  isSelected,
  isOnline,
  isActive,
  activeColor,
}: {
  url: string;
  avatarSize?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isOnline?: boolean;
  isActive?: boolean;
  activeColor?: string;
}) => {
  return (
    <Stack
      onClick={onClick}
      sx={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: '50%',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',

        boxShadow: isActive
          ? `0px 0px 0px 2px ${activeColor || 'rgba(0, 185, 252, 1)'}`
          : isSelected
            ? '0px 0px 0px 4px rgba(0, 0, 0, 1), 0px 0px 0px 7px rgba(0, 185, 252, 1)'
            : 'none',

        backgroundColor: 'rgba(255, 255, 255, 0.05)',

        ':after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: '50%',
          boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      {url && (
        <Image
          src={url}
          alt="Avatar"
          fill
          sizes={avatarSize}
          style={{
            objectFit: 'cover',
            zIndex: 1,
            borderRadius: '50%',
          }}
        />
      )}

      {isOnline && (
        <Stack
          sx={{
            display: 'block',
            width: '10px',
            height: '10px',
            borderRadius: '50px',
            backgroundColor: '#11ff22',
            boxShadow: '0px 0px 0px 2px #111',
            position: 'absolute',
            bottom: '1px',
            right: '1px',
            zIndex: 1,
          }}
        />
      )}
    </Stack>
  );
};
