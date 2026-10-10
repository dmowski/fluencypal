'use client';

import { Button } from '@mui/material';
import { ArrowUpRight, Video } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { primaryButtonSx } from './styles';

export const FluencyCallMeetButton = ({ meetUrl }: { meetUrl: string | null }) => {
  const { i18n } = useLingui();
  const label = i18n._('Open Google Meet');

  if (meetUrl) {
    return (
      <Button
        component="a"
        href={meetUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="fluency-call-open"
        data-analytics="community-call-meet"
        variant="contained"
        color="info"
        startIcon={<Video size={18} />}
        endIcon={<ArrowUpRight size={16} />}
        sx={primaryButtonSx}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      disabled
      data-testid="fluency-call-open"
      data-analytics="community-call-meet"
      variant="contained"
      color="info"
      startIcon={<Video size={18} />}
      endIcon={<ArrowUpRight size={16} />}
      sx={primaryButtonSx}
    >
      {label}
    </Button>
  );
};
