import { Stack } from '@mui/material';

export const DashboardBlur = () => {
  return (
    <>
      <Stack
        sx={{
          position: 'absolute',
          top: '0px',
          right: '0',
          backgroundColor: '#4F46E5',
          height: '300px',
          width: '300px',
          borderRadius: '50%',
          filter: 'blur(200px)',
          zIndex: -1,
          opacity: 0.2,
          pointerEvents: 'none',
          '@media (max-width: 600px)': {
            width: '100px',
            backgroundColor: 'red',
            zIndex: -2,
            opacity: 0.4,
          },
        }}
      ></Stack>
      <Stack
        sx={{
          position: 'absolute',
          top: '300px',
          right: '0',
          backgroundColor: 'red',
          height: '300px',
          width: '300px',
          borderRadius: '50%',
          filter: 'blur(200px)',
          zIndex: 0,
          opacity: 0.3,
          pointerEvents: 'none',
          '@media (max-width: 600px)': {
            width: '50px',
            opacity: 0.2,
          },
        }}
      ></Stack>
      <Stack
        sx={{
          position: 'absolute',
          top: '900px',
          left: '0',
          backgroundColor: '#5533ff',
          height: '300px',
          width: '300px',
          borderRadius: '50%',
          filter: 'blur(300px)',
          zIndex: -1,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      ></Stack>
    </>
  );
};
