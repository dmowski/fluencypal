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
        gap: '5px',
        padding: '24px 15px 15px 15px',
        textAlign: 'left',
        color: 'inherit',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.05)',

        height: '100%',
        width: '100%',
        borderRadius: '12px',
        boxSizing: 'border-box',
        cursor: 'pointer',
        alignItems: 'center',
        //justifyContent: 'space-between',
        ':hover': {
          background: 'rgba(255, 255, 255, 0.1)',
        },

        '@media (max-width: 600px)': {
          padding: '20px 15px 10px 15px',
          gap: '0px',
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
