import { IconButton, Stack } from '@mui/material';
import { Languages } from 'lucide-react';

import { AudioPlayIcon } from '../../Audio/AudioPlayIcon';

type CorrectedActionsProps = {
  correctedMessage: string;
  onTranslate: () => void;
  isTranslating: boolean;
};

export const CorrectedActions = ({
  correctedMessage,
  onTranslate,
  isTranslating,
}: CorrectedActionsProps) => {
  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      <AudioPlayIcon text={correctedMessage} instructions="Calm and clear" voice={'shimmer'} />
      <IconButton onClick={onTranslate} disabled={isTranslating}>
        <Languages size={'16px'} style={{ opacity: 0.8 }} />
      </IconButton>
    </Stack>
  );
};
