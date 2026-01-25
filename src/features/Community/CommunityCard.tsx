import { Badge, Stack, Typography } from '@mui/material';

export const CommunityCard = ({
  title,
  onClick,
  badgeNumber,
  icon,
}: {
  title: string;
  onClick: () => void;
  badgeNumber?: number;
  icon: React.ReactNode;
}) => {
  return (
    <Stack
      component={'button'}
      onClick={onClick}
      sx={{
        gap: '15px',
        padding: '30px 15px',
        textAlign: 'left',
        color: 'inherit',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',

        height: '100%',
        width: '100%',
        borderRadius: '15px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        ':hover': {
          background: 'rgba(255, 255, 255, 0.1)',
        },

        '@media (max-width: 600px)': {
          padding: '20px 10px',
          gap: '10px',
          borderRadius: '10px',
          border: 'none',
        },
      }}
    >
      <Badge color="error" badgeContent={badgeNumber ?? 0}>
        <Stack
          sx={{
            padding: '5px',
          }}
        >
          {icon}
        </Stack>
      </Badge>
      <Typography
        sx={{
          fontSize: '15px',
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
  );
};
