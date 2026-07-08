import { Stack } from '@mui/material';
import { DashboardBlur } from './DashboardBlur';

export const MainDashboardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        gap: '80px',
        '@media (max-width:600px)': {
          padding: '0 10px',
        },

        '@media (max-width:350px)': {
          padding: '0 5px',
        },
      }}
    >
      {children}
    </Stack>
  );
};

export const DashboardSectionContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        paddingBottom: '120px',
        paddingTop: '30px',

        '@media (max-width:600px)': {
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100px, rgba(0, 0, 0, 1) 100%)',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '700px',
          padding: '0 10px',
          gap: '40px',
          width: '100%',
          '@media (max-width:600px)': {
            padding: '0px',
          },
        }}
      >
        {children}
      </Stack>
      <DashboardBlur />
    </Stack>
  );
};
