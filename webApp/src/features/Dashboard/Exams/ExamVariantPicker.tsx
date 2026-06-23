'use client';

import { Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Shuffle } from 'lucide-react';
import { PolishB1VariantExamGroup } from '@/features/Quiz/exam/polishB1VariantExamGroup';

export const ExamVariantPicker = ({
  group,
  open,
  onClose,
  onSelectVariant,
  onSelectRandom,
  startingVariantId,
}: {
  group: PolishB1VariantExamGroup;
  open: boolean;
  onClose: () => void;
  onSelectVariant: (variantId: string) => void;
  onSelectRandom: () => void;
  startingVariantId: string | null;
}) => {
  const { i18n } = useLingui();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      data-testid="exam-variant-picker"
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ fontWeight: 700, paddingBottom: '8px' }}>{group.title}</DialogTitle>
      <DialogContent sx={{ paddingTop: '8px' }}>
        <Stack sx={{ gap: '16px', paddingBottom: '8px' }}>
          <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
            {i18n._(
              'Choose a variant or pick a random one. Each variant has {taskSummary}.',
              { taskSummary: group.taskSummary },
            )}
          </Typography>

          <Typography variant="body2" sx={{ color: '#EBEBF599' }}>
            {i18n._('Estimated time: ~{minutes} minutes', { minutes: group.estimatedMinutes })}
          </Typography>

          <Button
            variant="contained"
            color="info"
            startIcon={<Shuffle size={16} />}
            disabled={Boolean(startingVariantId)}
            onClick={onSelectRandom}
            data-testid="exam-variant-random"
            sx={{ alignSelf: 'flex-start' }}
          >
            {startingVariantId === 'random'
              ? i18n._('Starting...')
              : i18n._('Random variant')}
          </Button>

          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(5, 1fr)',
                sm: 'repeat(6, 1fr)',
                md: 'repeat(10, 1fr)',
              },
              gap: '8px',
            }}
            data-testid="exam-variant-grid"
          >
            {group.variants.map((variant) => (
              <Button
                key={variant.variantId}
                variant="outlined"
                color="inherit"
                disabled={Boolean(startingVariantId)}
                onClick={() => onSelectVariant(variant.variantId)}
                data-testid={`exam-variant-${variant.variantId}`}
                sx={{
                  minWidth: 0,
                  padding: '8px 4px',
                  fontSize: '0.875rem',
                }}
              >
                {startingVariantId === variant.variantId
                  ? i18n._('Starting...')
                  : variant.label.replace('Wariant ', '')}
              </Button>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
