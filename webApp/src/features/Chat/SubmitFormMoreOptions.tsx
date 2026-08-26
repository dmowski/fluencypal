'use client';

import { useRef, useState } from 'react';
import { useLingui } from '@lingui/react';
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Check,
  ChevronRight,
  CircleEllipsis,
  ImagePlus,
  Keyboard,
  Lightbulb,
  Mic,
  TextSearch,
  Video,
} from 'lucide-react';
import {
  loadAudioInputDevices,
  readPreferredMicrophoneId,
  type AudioInputDevice,
} from '@/libs/mic';
import { UploadImageButton } from '../Game/UploadImageButton';
import { UploadVideoButton } from '../Video/UploadVideoButton';

export function SubmitFormMoreOptions({
  isTextMode,
  onSwitchMode,
  onAddImage,
  onAddVideo,
  onGenerateIdea,
  onCheckMessage,
  isModeSwitchDisabled,
  isGeneratingIdea,
  canGenerateIdea,
  canCheckMessage,
  showModeSwitch = true,
  microphoneDeviceId = null,
  onSelectMicrophone,
}: {
  isTextMode: boolean;
  onSwitchMode?: () => void;
  onAddImage: (url: string) => void;
  onAddVideo: (url: string) => void;
  onGenerateIdea?: () => void;
  onCheckMessage?: () => void;
  isModeSwitchDisabled?: boolean;
  isGeneratingIdea?: boolean;
  canGenerateIdea?: boolean;
  canCheckMessage?: boolean;
  showModeSwitch?: boolean;
  microphoneDeviceId?: string | null;
  onSelectMicrophone?: (deviceId: string | null) => void;
}) {
  const { i18n } = useLingui();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [micMenuAnchor, setMicMenuAnchor] = useState<HTMLElement | null>(null);
  const [microphones, setMicrophones] = useState<AudioInputDevice[]>([]);
  const [isLoadingMicrophones, setIsLoadingMicrophones] = useState(false);
  const imageUploadRef = useRef<HTMLDivElement>(null);
  const videoUploadRef = useRef<HTMLDivElement>(null);
  const isOpen = Boolean(anchorEl);
  const isMicMenuOpen = Boolean(micMenuAnchor);
  const showMicrophoneSelect = !isTextMode && !!onSelectMicrophone;
  const selectedMicrophoneId =
    microphoneDeviceId ?? (isMicMenuOpen ? readPreferredMicrophoneId() : null);

  const closeMenu = () => setAnchorEl(null);
  const closeMicMenu = () => setMicMenuAnchor(null);

  const openHiddenButton = (container: HTMLDivElement | null) => {
    container?.querySelector('button')?.click();
  };

  const openMicrophoneMenu = async () => {
    const anchor = anchorEl;
    closeMenu();
    if (!anchor) return;
    setMicMenuAnchor(anchor);
    setIsLoadingMicrophones(true);
    try {
      setMicrophones(await loadAudioInputDevices());
    } finally {
      setIsLoadingMicrophones(false);
    }
  };

  const selectMicrophone = (deviceId: string | null) => {
    onSelectMicrophone?.(deviceId);
    closeMicMenu();
  };

  return (
    <>
      <IconButton
        data-testid="submit-form-more-options"
        aria-label={i18n._('More options')}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <CircleEllipsis size={'18px'} color="rgba(255, 255, 255, 0.5)" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        data-testid="submit-form-more-options-menu"
        slotProps={{
          paper: { sx: { minWidth: 220 } },
        }}
      >
        {showModeSwitch &&
          onSwitchMode && [
            <MenuItem
              key="switch-mode"
              disabled={isModeSwitchDisabled}
              onClick={() => {
                onSwitchMode();
                closeMenu();
              }}
            >
              <ListItemIcon>{isTextMode ? <Mic size={18} /> : <Keyboard size={18} />}</ListItemIcon>
              <ListItemText>
                {isTextMode ? i18n._('Voice message') : i18n._('Text message')}
              </ListItemText>
            </MenuItem>,
            <Divider key="switch-mode-divider" />,
          ]}

        {showMicrophoneSelect && (
          <MenuItem
            data-testid="submit-form-select-microphone"
            disabled={isModeSwitchDisabled}
            onClick={() => {
              void openMicrophoneMenu();
            }}
          >
            <ListItemIcon>
              <Mic size={18} />
            </ListItemIcon>
            <ListItemText>{i18n._('Microphone')}</ListItemText>
            <ChevronRight size={16} />
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            closeMenu();
            openHiddenButton(imageUploadRef.current);
          }}
        >
          <ListItemIcon>
            <ImagePlus size={18} />
          </ListItemIcon>
          <ListItemText>{i18n._('Upload image')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();
            openHiddenButton(videoUploadRef.current);
          }}
        >
          <ListItemIcon>
            <Video size={18} />
          </ListItemIcon>
          <ListItemText>{i18n._('Upload video')}</ListItemText>
        </MenuItem>

        {isTextMode && onGenerateIdea && (
          <MenuItem
            disabled={isGeneratingIdea || !canGenerateIdea}
            onClick={() => {
              void onGenerateIdea();
              closeMenu();
            }}
          >
            <ListItemIcon>
              <Lightbulb size={18} />
            </ListItemIcon>
            <ListItemText>{i18n._('Suggest an idea')}</ListItemText>
          </MenuItem>
        )}

        {isTextMode && onCheckMessage && (
          <MenuItem
            disabled={!canCheckMessage}
            onClick={() => {
              void onCheckMessage();
              closeMenu();
            }}
          >
            <ListItemIcon>
              <TextSearch size={18} />
            </ListItemIcon>
            <ListItemText>{i18n._('Check my message')}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={micMenuAnchor}
        open={isMicMenuOpen}
        onClose={closeMicMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        data-testid="submit-form-microphone-menu"
        slotProps={{
          paper: { sx: { minWidth: 220 } },
        }}
        MenuListProps={{
          subheader: (
            <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '32px', fontSize: 12 }}>
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

      <Stack sx={{ display: 'none' }} aria-hidden>
        <div ref={imageUploadRef}>
          <UploadImageButton type="icon" onNewUploadUrl={onAddImage} />
        </div>
        <div ref={videoUploadRef}>
          <UploadVideoButton type="icon" onNewUploadUrl={onAddVideo} />
        </div>
      </Stack>
    </>
  );
}
