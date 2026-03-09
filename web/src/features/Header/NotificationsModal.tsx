import { Button, Checkbox, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';

import { useLingui } from '@lingui/react';
import { useSettings } from '../Settings/useSettings';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal = ({ onClose }: NotificationsModalProps) => {
  const { i18n } = useLingui();
  const settings = useSettings();

  return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          gap: '20px',
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '600px',
          '@media (max-width: 600px)': {},
        }}
      >
        <Stack>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
            }}
          >
            {i18n._(`Notification Settings`)}
          </Typography>
          <Typography variant="caption">{i18n._(`Manage your notification settings`)}</Typography>
        </Stack>

        <Stack
          sx={{
            width: '100%',
            gap: '10px',
          }}
        >
          <Stack
            sx={{
              width: '100%',
              gap: '20px',
              alignItems: 'flex-start',
            }}
          >
            <FormControlLabel
              checked={settings.isSendEmailNotifications}
              onChange={(e) =>
                settings.setIsSendEmailNotifications(!settings.isSendEmailNotifications)
              }
              control={<Checkbox size="large" />}
              label={<Typography>{i18n._(`Send me email notifications`)}</Typography>}
            />
            <Stack
              sx={{
                width: '100%',
                alignItems: 'flex-start',
              }}
            >
              <Button
                variant="contained"
                color="info"
                onClick={onClose}
                sx={{
                  minWidth: '300px',
                }}
              >
                {i18n._(`Close`)}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
