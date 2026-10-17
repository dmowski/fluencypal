'use client';

import { useState } from 'react';
import { Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Plus, Settings } from 'lucide-react';
import {
  emojiLanguageName,
  fullLanguageName,
  SupportedLanguage,
  supportedLanguagesToLearn,
} from '@/features/Lang/lang';
import { RoomListItem } from '../types';
import { RoomCard } from './RoomCard';

const languageChoices = (selected: SupportedLanguage): SupportedLanguage[] => {
  const choices = [...supportedLanguagesToLearn];
  if (!choices.includes(selected)) choices.unshift(selected);
  return choices;
};

export const RoomListView = ({
  rooms,
  isLoading,
  error,
  onOpenRoom,
  onCreate,
  onOpenSettings,
  language,
  onLanguageChange,
}: {
  rooms: RoomListItem[];
  isLoading: boolean;
  error: string;
  onOpenRoom: (roomId: string) => void;
  onCreate: () => void;
  onOpenSettings: () => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}) => {
  const { i18n } = useLingui();
  const [languageMenu, setLanguageMenu] = useState<HTMLElement | null>(null);

  return (
    <Stack data-testid="voice-chat-modal" sx={{ width: '100%', maxWidth: 760, gap: '16px' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack sx={{ gap: '4px' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('Voice chat')}
            </Typography>
            <Button
              data-testid="voice-room-list-language"
              aria-label={fullLanguageName[language]}
              aria-haspopup="listbox"
              onClick={(event) => setLanguageMenu(event.currentTarget)}
              sx={{
                minWidth: 0,
                padding: '0 2px',
                fontSize: '28px',
                lineHeight: 1,
                color: 'inherit',
              }}
            >
              {emojiLanguageName[language]}
            </Button>
            <Menu
              anchorEl={languageMenu}
              open={Boolean(languageMenu)}
              onClose={() => setLanguageMenu(null)}
            >
              {languageChoices(language).map((code) => (
                <MenuItem
                  key={code}
                  selected={code === language}
                  onClick={() => {
                    onLanguageChange(code);
                    setLanguageMenu(null);
                  }}
                >
                  {emojiLanguageName[code]} {fullLanguageName[code]}
                </MenuItem>
              ))}
            </Menu>
          </Stack>
          <Typography sx={{ opacity: 0.75 }}>
            {i18n._('Pick a room, listen, and leave a voice message when you are ready.')}
          </Typography>

          <Typography
            sx={{
              opacity: 0.75,
              border: '1px solid #333',
              borderRadius: '16px',
              padding: '10px',
              backgroundColor: 'rgba(36, 48, 68, 0.1)',
              fontSize: '14px',
              lineHeight: 1.5,
              fontWeight: 400,
              fontFamily: 'inherit',
              fontStyle: 'inherit',
              fontVariant: 'inherit',
              fontStretch: 'inherit',
              fontDisplay: 'inherit',
              maxWidth: '400px',
            }}
          >
            {i18n._(
              'That feature is in development. So it might be buggy or not work as expected. But you can try it and let me know what you think.',
            )}
          </Typography>
        </Stack>
        <IconButton
          aria-label={i18n._('Notification settings')}
          data-testid="voice-chat-settings"
          onClick={onOpenSettings}
        >
          <Settings />
        </IconButton>
      </Stack>
      {error ? (
        <Typography color="error" data-testid="voice-chat-error">
          {error}
        </Typography>
      ) : null}
      {isLoading ? <Typography>{i18n._('Loading rooms...')}</Typography> : null}
      {!isLoading && rooms.length === 0 ? (
        <Typography data-testid="voice-chat-empty">
          {i18n._('No rooms for this language yet. You can start one.')}
        </Typography>
      ) : null}
      <Stack sx={{ gap: '12px' }}>
        {rooms.map((item) => (
          <RoomCard key={item.room.id} item={item} onOpen={() => onOpenRoom(item.room.id)} />
        ))}
      </Stack>
      <Button
        data-testid="voice-chat-new-room"
        variant="contained"
        color="info"
        startIcon={<Plus size={18} />}
        onClick={onCreate}
        sx={{
          alignSelf: 'flex-start',
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 700,
        }}
      >
        {i18n._('New room')}
      </Button>
    </Stack>
  );
};
