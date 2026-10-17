'use client';

import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { avatars, defaultAvatar } from '@/features/Game/avatars';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';

export const VoiceProfileForm = ({
  bio,
  isSaving,
  onSave,
  onDownload,
  onDelete,
}: {
  bio: string;
  isSaving: boolean;
  onSave: (next: { username: string; bio: string; avatarUrl: string }) => void;
  onDownload?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) => {
  const { i18n } = useLingui();
  const game = useGame();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [username, setUsername] = useState(game.myUserName || '');
  const [about, setAbout] = useState(bio);
  const [avatarUrl, setAvatarUrl] = useState(game.myAvatar || defaultAvatar);
  const choices = [avatarUrl, ...avatars.filter((url) => url !== avatarUrl)].slice(0, 12);

  return (
    <Stack data-testid="voice-profile-form" sx={{ width: '100%', maxWidth: 640, gap: '20px' }}>
      <Typography sx={{ opacity: 0.75 }}>
        {i18n._('People in a room see your picture, your name, and this introduction.')}
      </Typography>
      <Stack direction="row" sx={{ gap: '10px', flexWrap: 'wrap', padding: '10px 4px' }}>
        {choices.map((url) => (
          <Avatar
            key={url}
            url={url}
            avatarSize="64px"
            isSelected={url === avatarUrl}
            onClick={() => setAvatarUrl(url)}
          />
        ))}
      </Stack>
      <Stack sx={{ gap: '15px' }}>
        <TextField
          label={i18n._('Username')}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 40 } }}
        />
        <TextField
          label={i18n._('Bio')}
          value={about}
          multiline
          minRows={5}
          onChange={(event) => setAbout(event.target.value)}
          placeholder={i18n._("Introduce yourself and tell people what you're into.")}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </Stack>
      <Button
        data-testid="voice-profile-save"
        variant="contained"
        color="info"
        disabled={isSaving || username.trim().length < 2}
        onClick={() => onSave({ username: username.trim(), bio: about.trim(), avatarUrl })}
        sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700 }}
      >
        {isSaving ? i18n._('Saving...') : i18n._('Save')}
      </Button>
      <Stack sx={{ gap: '6px', paddingTop: '8px' }}>
        <Typography sx={{ fontSize: '13px', opacity: 0.7 }}>
          {i18n._('A text file of your bio, introductions, and messages.')}
        </Typography>
        <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="text"
            disabled={!onDownload || isSaving}
            onClick={() => void onDownload?.()}
            sx={{ textTransform: 'none' }}
          >
            {i18n._('Download my voice data')}
          </Button>
          <Button
            variant="text"
            color="inherit"
            disabled={!onDelete || isSaving}
            onClick={() => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                return;
              }
              setConfirmDelete(false);
              void onDelete?.();
            }}
            sx={{ textTransform: 'none' }}
          >
            {confirmDelete ? i18n._('Yes, delete my recordings') : i18n._('Delete my voice data')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
