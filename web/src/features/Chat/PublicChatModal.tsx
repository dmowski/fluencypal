import { Stack, Typography } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { ChatPage } from './ChatPage';
import { useLingui } from '@lingui/react';

export const PublicChatModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  return (
    <CustomModal isOpen={true} onClose={onClose} mobilePadding="40px 0">
      <Stack
        sx={{
          maxWidth: '700px',
          padding: '0',
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
            {i18n._('Community Chat')}
          </Typography>
        </Stack>

        <ChatPage type={'public'} />
      </Stack>
    </CustomModal>
  );
};
