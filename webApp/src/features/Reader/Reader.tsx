import { Stack, Typography } from '@mui/material';
import { ReaderData } from './types';

export const Reader = ({ data }: { data: ReaderData }) => {
  return (
    <Stack
      sx={{
        width: '100%',
        backgroundColor: '#F4E1C6',
        color: '#000',
        alignItems: 'center',
        padding: '40px 20px',
        height: '100%',
      }}
    >
      <Stack
        sx={{
          maxWidth: '1200px',
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 'bold', padding: '20px', fontFamily: 'serif' }}>
          {data.title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontStyle: 'italic', padding: '0px 20px 20px 20px', fontFamily: 'serif' }}
        >
          {data.subtitle}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            padding: '0px 20px 20px 20px',
            fontFamily: 'serif',
            fontSize: '28px',
            lineHeight: '1.8',
          }}
        >
          {data.content}
        </Typography>
      </Stack>
    </Stack>
  );
};
