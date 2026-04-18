import { Essay } from '@/features/Essay/Essay';
import { Stack, Typography } from '@mui/material';

export const EssayTest = () => {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        padding: '40px',
      }}
    >
      <Essay />
    </Stack>
  );
};
