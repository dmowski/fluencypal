import { useLingui } from '@lingui/react';
import { ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { LogOut, Mic, Trophy } from 'lucide-react';

export const CallEndMenu = ({
  anchorEl,
  onClose,
  onExit,
  onSwitchMode,
  onShowResults,
  canShowResults,
  mode,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onExit: () => void;
  onSwitchMode: () => void;
  onShowResults: () => void;
  canShowResults: boolean;
  mode: 'call' | 'record';
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
        onClick={onExit}
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
            {i18n._('Exit')}
          </Typography>
        </ListItemText>
      </MenuItem>

      <MenuItem
        sx={{
          padding: 'var(--item-padding)',
        }}
        onClick={onSwitchMode}
      >
        <ListItemIcon>{mode === 'call' ? <Mic /> : <VideocamIcon />}</ListItemIcon>
        <ListItemText>
          <Typography>
            {mode === 'call' ? i18n._('Switch to voice records') : i18n._('Switch to Call mode')}
          </Typography>
        </ListItemText>
      </MenuItem>

      <MenuItem
        disabled={!canShowResults}
        sx={{
          padding: 'var(--item-padding)',
        }}
        onClick={onShowResults}
      >
        <ListItemIcon>
          <Trophy />
        </ListItemIcon>
        <ListItemText>
          <Typography>{i18n._('Show results')}</Typography>
        </ListItemText>
      </MenuItem>
    </Menu>
  );
};
