import { Stack, Typography } from '@mui/material';
import { ReaderData } from './types';
import { ReaderHeader } from './ReaderHeader';

export const ReaderParagraph = ({ text }: { text: string }) => (
  <Typography
    variant="body1"
    sx={{
      fontFamily: 'serif',
      fontSize: '36px',
      lineHeight: '1.5',
      textAlign: 'justify',
    }}
  >
    {text}
  </Typography>
);

export const Reader = ({ data }: { data: ReaderData }) => {
  const activePage = 1;
  const pageCount = 3;

  const paragraphs = data.content.split('\n').filter((paragraph) => paragraph.trim() !== '');

  return (
    <Stack
      sx={{
        width: '100%',
        backgroundColor: '#F4E1C6',
        color: '#000',
        alignItems: 'center',
        padding: '80px 20px',
        height: 'auto',
        borderRadius: '16px',
      }}
    >
      <Stack
        sx={{
          maxWidth: '900px',
          width: '100%',
          minWidth: 0,
          gap: '90px',
        }}
      >
        <ReaderHeader
          title={data.title}
          subtitle={data.subtitle}
          activePage={activePage}
          pageCount={pageCount}
          category={data.category}
        />
        <Stack sx={{ gap: '20px' }}>
          {paragraphs.map((paragraph, index) => (
            <ReaderParagraph key={index} text={paragraph} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
