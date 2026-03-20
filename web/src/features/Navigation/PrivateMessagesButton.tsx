import { Email } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';
import { useUrlState } from '../Url/useUrlState';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';
import { ChatPage } from '../Chat/ChatPage';

export const PrivateMessagesButton: React.FC = () => {
  const [isShow, setIsShow] = useUrlState('showPrivateMessages', false, false);
  const { i18n } = useLingui();

  return (
    <>
      {isShow && (
        <CustomModal isOpen={isShow} onClose={() => setIsShow(false)} mobilePadding="40px 0">
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
                {i18n._('Inbox')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {i18n._('Here you can see your private messages with other users.')}
              </Typography>
            </Stack>
            <ChatPage type={'private'} />
          </Stack>
        </CustomModal>
      )}

      <IconButton onClick={() => setIsShow(true)}>
        <Email
          sx={{
            opacity: 0.7,
          }}
        />
      </IconButton>
    </>
  );
};
