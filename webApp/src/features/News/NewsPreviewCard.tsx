'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

interface NewsPreviewCardProps {
  title: string;
  imageUrl?: string;
  subTitle?: string;
  /** ISO date string; displayed as "MMM D" (e.g. "May 20"). */
  dateIso?: string;
  onClick?: () => void;
  'data-testid'?: string;
}

const formatDay = (dateIso: string): string => {
  const d = new Date(dateIso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const NewsPreviewCard = ({
  title,
  imageUrl,
  subTitle,
  dateIso,
  onClick,
  'data-testid': testId,
}: NewsPreviewCardProps) => {
  const day = dateIso ? formatDay(dateIso) : '';

  return (
    <Stack
      component="button"
      data-testid={testId}
      onClick={onClick}
      sx={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        color: '#EBEBF5',
        backgroundColor: '#3d3c3c',
        width: '100%',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        position: 'relative',
        '@media (max-width: 600px)': {
          gap: '10px',
        },
      }}
    >
      {imageUrl ? (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '380px',
            flexShrink: 0,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            overflow: 'hidden',
            '@media (max-width: 600px)': {
              height: '200px',
            },
          }}
        >
          <Image
            src={imageUrl}
            loading="eager"
            alt={title}
            fill
            sizes="(max-width: 600px) 100vw, 500px"
            style={{ objectFit: 'cover' }}
          />
        </Box>
      ) : (
        <Stack
          sx={{
            height: '20px',
          }}
        />
      )}
      {day && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            '@media (max-width: 600px)': {
              top: '8px',
              left: '8px',
            },
          }}
        >
          {day}
        </Typography>
      )}
      <Stack
        sx={{
          padding: '20px 20px 25px 20px',
          gap: '4px',
          '@media (max-width: 600px)': {
            padding: '5px 12px 20px 12px',
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            lineHeight: 1.35,

            '@media (max-width: 600px)': {
              fontSize: '24px',
            },
          }}
        >
          {title}
        </Typography>
        {subTitle && (
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {subTitle}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};
