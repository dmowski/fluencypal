import { useLingui } from '@lingui/react';
import { ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { LogOut, Mic } from 'lucide-react';

export const CallEndMenu = ({
  anchorEl,
  onClose,
  onCloseConversation,
  onSwitchToVoiceRecords,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onCloseConversation: () => void;
  onSwitchToVoiceRecords: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Menu
      data-testid="call-end-menu"
      sx={{
        '--item-padding': '9px 10px 9px 20px',
      }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#121212',
            padding: '5px 0 5px 0',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0px 0px 22px rgba(0, 0, 0, 0.5)',
          },
        },
      }}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem
        sx={{
          '--color': '#fb8874',
          padding: 'var(--item-padding)',
        }}
        onClick={onCloseConversation}
      >
        <ListItemIcon>
          <LogOut color="var(--color)" />
        </ListItemIcon>
        <ListItemText>
          <Typography
            sx={{
              color: 'var(--color)',
            }}
          >
            {i18n._('Close')}
          </Typography>
        </ListItemText>
      </MenuItem>

      <MenuItem
        sx={{
          padding: 'var(--item-padding)',
        }}
        onClick={onSwitchToVoiceRecords}
      >
        <ListItemIcon>
          <Mic />
        </ListItemIcon>
        <ListItemText>
          <Typography>{i18n._('Switch to voice records')}</Typography>
        </ListItemText>
      </MenuItem>
    </Menu>
  );
};
