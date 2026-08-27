import { useLingui } from '@lingui/react';
import {
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import ClosedCaptionDisabledIcon from '@mui/icons-material/ClosedCaptionDisabled';
import { Check, ChevronRight, Mic } from 'lucide-react';
import { useState } from 'react';
import {
  loadAudioInputDevices,
  readPreferredMicrophoneId,
  writePreferredMicrophoneId,
  type AudioInputDevice,
} from '@/libs/mic';

const MENU_ITEM_SX = {
  padding: 'var(--item-padding)',
};

const MENU_PAPER_SX = {
  backgroundColor: '#121212',
  padding: '5px 0 5px 0',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0px 0px 22px rgba(0, 0, 0, 0.5)',
  minWidth: 240,
};

export const CallSettingsMenu = ({
  anchorEl,
  onClose,
  isWebCamEnabled,
  onToggleWebCam,
  isVolumeOn,
  onToggleVolume,
  isSubtitlesEnabled,
  onToggleSubtitles,
  onSelectMicrophone,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  isWebCamEnabled: boolean;
  onToggleWebCam: () => void;
  isVolumeOn: boolean;
  onToggleVolume: () => void;
  isSubtitlesEnabled: boolean;
  onToggleSubtitles: () => void;
  onSelectMicrophone?: (deviceId: string | null) => void;
}) => {
  const { i18n } = useLingui();
  const [micMenuAnchor, setMicMenuAnchor] = useState<HTMLElement | null>(null);
  const [microphones, setMicrophones] = useState<AudioInputDevice[]>([]);
  const [isLoadingMicrophones, setIsLoadingMicrophones] = useState(false);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string | null>(
    readPreferredMicrophoneId(),
  );

  const isOpen = Boolean(anchorEl);
  const isMicMenuOpen = Boolean(micMenuAnchor);

  const closeMicMenu = () => setMicMenuAnchor(null);

  const openMicrophoneMenu = async () => {
    const anchor = anchorEl;
    onClose();
    if (!anchor) return;
    setSelectedMicrophoneId(readPreferredMicrophoneId());
    setMicMenuAnchor(anchor);
    setIsLoadingMicrophones(true);
    try {
      setMicrophones(await loadAudioInputDevices());
    } finally {
      setIsLoadingMicrophones(false);
    }
  };

  const selectMicrophone = (deviceId: string | null) => {
    writePreferredMicrophoneId(deviceId);
    setSelectedMicrophoneId(deviceId);
    onSelectMicrophone?.(deviceId);
    closeMicMenu();
  };

  return (
    <>
      <Menu
        data-testid="call-settings-menu"
        sx={{
          '--item-padding': '9px 10px 9px 20px',
        }}
        slotProps={{
          paper: {
            sx: MENU_PAPER_SX,
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
        open={isOpen}
        onClose={onClose}
      >
        <MenuItem data-testid="call-settings-webcam" sx={MENU_ITEM_SX} onClick={onToggleWebCam}>
          <ListItemIcon>{isWebCamEnabled ? <VideocamIcon /> : <VideocamOffIcon />}</ListItemIcon>
          <ListItemText>
            <Typography>
              {isWebCamEnabled ? i18n._('Turn off video') : i18n._('Turn on video')}
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem data-testid="call-settings-mute" sx={MENU_ITEM_SX} onClick={onToggleVolume}>
          <ListItemIcon>{isVolumeOn ? <VolumeUpIcon /> : <VolumeOffIcon />}</ListItemIcon>
          <ListItemText>
            <Typography>{isVolumeOn ? i18n._('Mute') : i18n._('Unmute')}</Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem
          data-testid="call-settings-captions"
          sx={MENU_ITEM_SX}
          onClick={onToggleSubtitles}
        >
          <ListItemIcon>
            {isSubtitlesEnabled ? <ClosedCaptionIcon /> : <ClosedCaptionDisabledIcon />}
          </ListItemIcon>
          <ListItemText>
            <Typography>
              {isSubtitlesEnabled ? i18n._('Turn off captions') : i18n._('Turn on captions')}
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem
          data-testid="call-settings-select-microphone"
          sx={MENU_ITEM_SX}
          onClick={() => {
            void openMicrophoneMenu();
          }}
        >
          <ListItemIcon>
            <Mic />
          </ListItemIcon>
          <ListItemText>
            <Typography>{i18n._('Select microphone')}</Typography>
          </ListItemText>
          <ChevronRight size={16} />
        </MenuItem>
      </Menu>

      <Menu
        data-testid="call-microphone-menu"
        sx={{
          '--item-padding': '9px 10px 9px 20px',
        }}
        slotProps={{
          paper: {
            sx: MENU_PAPER_SX,
          },
        }}
        anchorEl={micMenuAnchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={isMicMenuOpen}
        onClose={closeMicMenu}
        MenuListProps={{
          subheader: (
            <ListSubheader
              sx={{
                bgcolor: 'transparent',
                lineHeight: '32px',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              {i18n._('Microphone')}
            </ListSubheader>
          ),
        }}
      >
        {isLoadingMicrophones && (
          <MenuItem disabled sx={{ fontSize: 14 }}>
            {i18n._('Loading…')}
          </MenuItem>
        )}
        {!isLoadingMicrophones && (
          <MenuItem
            selected={!selectedMicrophoneId}
            onClick={() => selectMicrophone(null)}
            sx={{ fontSize: 14 }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {!selectedMicrophoneId ? <Check size={16} /> : null}
            </ListItemIcon>
            <ListItemText primary={i18n._('System default')} />
          </MenuItem>
        )}
        {!isLoadingMicrophones &&
          microphones.map((mic) => {
            const isSelected = selectedMicrophoneId === mic.deviceId;
            return (
              <MenuItem
                key={mic.deviceId}
                selected={isSelected}
                onClick={() => selectMicrophone(mic.deviceId)}
                sx={{ fontSize: 14 }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {isSelected ? <Check size={16} /> : null}
                </ListItemIcon>
                <ListItemText primary={mic.label} />
              </MenuItem>
            );
          })}
        {!isLoadingMicrophones && microphones.length === 0 && (
          <MenuItem disabled sx={{ fontSize: 14, whiteSpace: 'normal', maxWidth: 280 }}>
            {i18n._('No microphones found. Allow microphone access and try again.')}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
