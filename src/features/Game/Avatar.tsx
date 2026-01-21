import { Stack } from '@mui/material';

export const Avatar = ({
  url,
  avatarSize,
  onClick,
  isSelected,
  isOnline,
  isActive,
  activeColor,
}: {
  url: string;
  avatarSize: string;
  onClick?: () => void;
  isSelected?: boolean;
  isOnline?: boolean;
  isActive?: boolean;
  activeColor?: string;
}) => {
  return (
    <Stack
      sx={{
        img: {
          width: avatarSize || '90px',
          height: avatarSize || '90px',
          borderRadius: '50%',
          objectFit: 'cover',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          position: 'relative',
          zIndex: 1,
        },

        borderRadius: '50%',
        height: avatarSize || '90px',
        width: avatarSize || '90px',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: isActive
          ? `0px 0px 0px 2px ${activeColor || 'rgba(0, 185, 252, 1)'}`
          : isSelected
            ? '0px 0px 0px 4px rgba(0, 0, 0, 1), 0px 0px 0px 7px rgba(0, 185, 252, 1)'
            : 'none',

        ':after': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          borderRadius: '50%',
          boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
        },
      }}
      onClick={onClick}
    >
      <img src={url || undefined} />

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
