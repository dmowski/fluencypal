import { Button, Stack, Typography } from '@mui/material';
import { ReaderData } from './types';
import { ReaderHeader } from './ReaderHeader';
import { Mic, Pause } from 'lucide-react';

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

  const isPlaying = false;
  const activeParagraphIndex = 0;

  return (
    <Stack
      sx={{
        width: '100%',
        backgroundColor: '#F4E1C6',
        color: '#000',
        alignItems: 'center',
        padding: '80px 0px',
        height: 'auto',
        borderRadius: '16px',
        gap: '90px',
      }}
    >
      <Stack
        sx={{
          maxWidth: '900px',
          width: '100%',
          minWidth: 0,
        }}
      >
        <ReaderHeader
          title={data.title}
          subtitle={data.subtitle}
          activePage={activePage}
          pageCount={pageCount}
          category={data.category}
        />
      </Stack>

      <Stack
        sx={{
          width: '100%',
          alignItems: 'center',
        }}
      >
        <Stack sx={{ gap: '20px', width: '100%' }}>
          {paragraphs.map((paragraph, index) => (
            <Stack
              key={index}
              sx={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '20px',
              }}
            >
              <Stack
                className="buttonContainer"
                sx={{
                  width: '100px',
                  paddingTop: '10px',
                }}
              >
                {isPlaying && activeParagraphIndex === index && (
                  <Button
                    startIcon={<Pause size={16} />}
                    sx={{
                      backgroundColor: '#EB5452',
                      borderRadius: '50px',
                      color: '#fff',
                      boxShadow: 'none',
                      padding: '5px 2px 5px 0',
                    }}
                    variant="contained"
                  >
                    Pause
                  </Button>
                )}

                {!isPlaying && activeParagraphIndex === index && (
                  <Button
                    startIcon={<Mic size={16} />}
                    sx={{
                      backgroundColor: '#5285eb',
                      borderRadius: '50px',
                      color: '#fff',
                      boxShadow: 'none',
                      padding: '5px 2px 5px 0',
                    }}
                    variant="contained"
                  >
                    Read
                  </Button>
                )}
              </Stack>
              <Stack key={index} sx={{ width: '900px' }}>
                <ReaderParagraph key={index} text={paragraph} />
              </Stack>
              <Stack
                sx={{
                  width: '100px',
                }}
                className="annotation"
              ></Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
