import { useLingui } from '@lingui/react';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { Check, Keyboard, Lightbulb, LogOut } from 'lucide-react';
import VideocamIcon from '@mui/icons-material/Videocam';
import { ConversationMode } from '@/common/user';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardIcon from '@mui/icons-material/Keyboard';

export const RecordingCanvasMenu = ({
  anchorElUser,
  setAnchorElUser,
  isFinishingProcess,
  isRecording,
  isAnalyzingResponse,
  isCallMode,
  isChatMode,

  toggleConversationMode,
  closeConversation,
  closeMenus,
}: {
  anchorElUser: HTMLElement | null;
  setAnchorElUser: (el: HTMLElement | null) => void;
  isFinishingProcess: boolean;
  isRecording: boolean;
  isAnalyzingResponse: boolean;
  isCallMode: boolean;
  isChatMode: boolean;

  toggleConversationMode: (mode: ConversationMode) => void;
  closeConversation: () => void;
  closeMenus: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Menu
      sx={{
        marginBottom: '130px',
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
      anchorEl={anchorElUser}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      keepMounted
      open={Boolean(anchorElUser)}
      onClose={() => setAnchorElUser(null)}
    >
      <MenuItem
        sx={{
          '--color': '#fb8874',
          padding: 'var(--item-padding)',
        }}
        disabled={isFinishingProcess}
        onClick={() => {
          closeConversation();
          closeMenus();
        }}
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

      <Divider />

      <TogglerMenuItem
        icon={<MicIcon />}
        text={i18n._('Voice records')}
        checked={!isCallMode && !isChatMode}
        onClick={() => {
          toggleConversationMode('record');
          closeMenus();
        }}
        disabled={isRecording || isAnalyzingResponse || (!isCallMode && !isChatMode)}
      />

      <TogglerMenuItem
        icon={<KeyboardIcon />}
        text={i18n._('Keyboard')}
        checked={isChatMode}
        onClick={() => {
          toggleConversationMode('chat');
          closeMenus();
        }}
        disabled={isRecording || isAnalyzingResponse || isChatMode}
      />

      <TogglerMenuItem
        icon={<VideocamIcon />}
        text={i18n._('Call')}
        checked={isCallMode}
        onClick={() => {
          toggleConversationMode('call');
          closeMenus();
        }}
        disabled={isRecording || isAnalyzingResponse || isCallMode}
      />
    </Menu>
  );
};

const TogglerMenuItem = ({
  icon,
  text,
  checked,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  text: string;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <MenuItem
      sx={{
        padding: 'var(--item-padding)',
        //minWidth: '250px',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}
      //disabled={disabled}
      onClick={onClick}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0px',
          paddingRight: '15px',
          width: '100%',
        }}
      >
        <ListItemIcon>
          {checked ? <RadioButtonCheckedIcon color="info" /> : <RadioButtonUncheckedIcon />}
        </ListItemIcon>

        <ListItemText>
          <Typography>{text}</Typography>
        </ListItemText>
      </Stack>

      <ListItemIcon>{icon}</ListItemIcon>
    </MenuItem>
  );
};
