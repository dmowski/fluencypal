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
        transition: 'background-color 0.15s',
        width: '100%',
      }}
    >
      {imageUrl && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '380px',
            flexShrink: 0,
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
      )}
      <Stack sx={{ padding: '14px 5px', gap: '4px' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
          {title}
        </Typography>
        {subTitle && (
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {subTitle}
          </Typography>
        )}
        {day && (
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            {day}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};
