'use client';

import { useRef, useState } from 'react';
import { useLingui } from '@lingui/react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import {
  CircleEllipsis,
  ImagePlus,
  Keyboard,
  Lightbulb,
  Mic,
  TextSearch,
  Video,
} from 'lucide-react';
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
}) {
  const { i18n } = useLingui();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const imageUploadRef = useRef<HTMLDivElement>(null);
  const videoUploadRef = useRef<HTMLDivElement>(null);
  const isOpen = Boolean(anchorEl);

  const closeMenu = () => setAnchorEl(null);

  const openHiddenButton = (container: HTMLDivElement | null) => {
    container?.querySelector('button')?.click();
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
        {showModeSwitch && onSwitchMode && (
          <MenuItem
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
