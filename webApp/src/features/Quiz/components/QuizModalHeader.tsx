'use client';

import { IconButton, Stack, Typography } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useLingui } from '@lingui/react';

export const QuizModalHeader = ({
  sectionTitle,
  onBack,
}: {
  sectionTitle: string | null;
  onBack: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '16px 8px',
        minHeight: '56px',
      }}
      data-testid="quiz-modal-header"
    >
      <IconButton
        color="inherit"
        onClick={onBack}
        aria-label={i18n._('Back')}
        data-testid="quiz-modal-back"
        sx={{ position: 'absolute', left: 0, color: '#EBEBF5' }}
      >
        <NavigateBeforeIcon />
      </IconButton>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#EBEBF5' }}>
        {sectionTitle || i18n._('Quiz')}
      </Typography>
    </Stack>
  );
};
