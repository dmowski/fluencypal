import { Stack, Typography } from '@mui/material';
import { ReaderData } from './types';
import { ReaderHeader } from './ReaderHeader';

export const Reader = ({ data }: { data: ReaderData }) => {
  const activePage = 1;
  const pageCount = 3;
  return (
    <Stack
      sx={{
        width: '100%',
        backgroundColor: '#F4E1C6',
        color: '#000',
        alignItems: 'center',
        padding: '80px 20px',
        height: '100%',
      }}
    >
      <Stack
        sx={{
          maxWidth: '1200px',
          gap: '60px',
        }}
      >
        <ReaderHeader
          title={data.title}
          subtitle={data.subtitle}
          activePage={activePage}
          pageCount={pageCount}
          category={data.category}
        />
        <Typography
          variant="body1"
          sx={{
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
