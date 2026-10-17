'use client';

import { useState } from 'react';
import { Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Pencil, Plus, Settings } from 'lucide-react';
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
  hasBio = true,
  onEditProfile,
}: {
  rooms: RoomListItem[];
  isLoading: boolean;
  error: string;
  onOpenRoom: (roomId: string) => void;
  onCreate: () => void;
  onOpenSettings: () => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  hasBio?: boolean;
  onEditProfile?: () => void;
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
        </Stack>
        <IconButton
          aria-label={i18n._('Notification settings')}
          data-testid="voice-chat-settings"
          onClick={onOpenSettings}
        >
          <Settings />
        </IconButton>
      </Stack>
      {!hasBio ? (
        <Stack
          data-testid="voice-finish-profile"
          sx={{ gap: '5px', width: 640, padding: '10px 0' }}
        >
          <Typography sx={{ fontWeight: 500 }}>{i18n._('Finish your profile')}</Typography>
          <Stack
            data-testid="voice-add-bio"
            role="button"
            tabIndex={0}
            onClick={onEditProfile}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onEditProfile?.();
            }}
            sx={{
              width: '100%',
              maxWidth: '200px',
              alignItems: 'center',
              textAlign: 'center',
              borderRadius: '18px',
              padding: '16px 12px 12px 12px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
              gap: '12px',
            }}
          >
            <Stack
              sx={{
                padding: '15px',
                backgroundColor: '#101010',
                borderRadius: '116px',
              }}
            >
              <Pencil size={17} />
            </Stack>
            <Stack sx={{ gap: '2px', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 600, textAlign: 'center' }}>
                {i18n._('Add bio')}
              </Typography>
              <Typography variant="caption" sx={{ textAlign: 'center' }}>
                {i18n._("Introduce yourself and tell people what you're into.")}
              </Typography>
            </Stack>
            <Typography
              sx={{
                color: '#222',
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '7px 8px',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'center',
                width: '100%',
              }}
            >
              {i18n._('Add bio')}
            </Typography>
          </Stack>
        </Stack>
      ) : null}
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
