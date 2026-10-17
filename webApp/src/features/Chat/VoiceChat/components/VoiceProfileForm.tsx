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
}: {
  bio: string;
  isSaving: boolean;
  onSave: (next: { username: string; bio: string; avatarUrl: string }) => void;
}) => {
  const { i18n } = useLingui();
  const game = useGame();
  const [username, setUsername] = useState(game.myUserName || '');
  const [about, setAbout] = useState(bio);
  const [avatarUrl, setAvatarUrl] = useState(game.myAvatar || defaultAvatar);
  const choices = [avatarUrl, ...avatars.filter((url) => url !== avatarUrl)].slice(0, 12);

  return (
    <Stack data-testid="voice-profile-form" sx={{ width: '100%', maxWidth: 640, gap: '16px' }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {i18n._('My profile')}
      </Typography>
      <Typography sx={{ opacity: 0.75 }}>
        {i18n._('People in a room see your picture, your name, and this introduction.')}
      </Typography>
      <Stack direction="row" sx={{ gap: '10px', flexWrap: 'wrap' }}>
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
    </Stack>
  );
};
