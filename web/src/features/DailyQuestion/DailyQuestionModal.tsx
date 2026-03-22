import { Stack, Typography } from '@mui/material';
import { DailyQuestionFullList } from './DailyQuestionBadge';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';

export const DailyQuestionModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="40px 0">
      <Stack
        sx={{
          maxWidth: '700px',

          gap: '30px',
          width: '100%',
        }}
      >
        <Stack
          sx={{
            padding: '0 10px',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._('Daily Questions')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            {i18n._('Answer a new question every day and see how your style improves!')}
          </Typography>
        </Stack>

        <DailyQuestionFullList />
      </Stack>
    </CustomModal>
  );
};
