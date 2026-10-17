'use client';

import {
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useLingui } from '@lingui/react';
import { RoomNotificationNarrowing, SpeakingNotificationPrefs } from '../types';

const quietTimeOptions = (): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      options.push({
        value,
        label: `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`,
      });
    }
  }
  return options;
};

const QUIET_TIMES = quietTimeOptions();

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <Stack sx={{ gap: '10px' }}>
    <Stack sx={{ gap: '4px' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '18px' }}>{title}</Typography>
      <Typography sx={{ opacity: 0.75 }}>{subtitle}</Typography>
    </Stack>
    {children}
  </Stack>
);

export const NotificationSettingsForm = ({
  prefs,
  narrowing,
  roomScoped,
  browserPermission,
  onChangePrefs,
  onChangeNarrowing,
  onEnableBrowser,
}: {
  prefs: SpeakingNotificationPrefs;
  narrowing: RoomNotificationNarrowing | null;
  roomScoped: boolean;
  browserPermission: NotificationPermission | 'unsupported';
  onChangePrefs: (prefs: SpeakingNotificationPrefs) => void;
  onChangeNarrowing: (narrowing: RoomNotificationNarrowing) => void;
  onEnableBrowser: () => void;
}) => {
  const { i18n } = useLingui();
  const room = narrowing;

  const kindOn = (kind: 'newMessages' | 'reviewJoiners' | 'newRooms') => {
    if (!prefs[kind]) return false;
    if (!roomScoped || !room || kind === 'newRooms') return prefs[kind];
    return room[kind];
  };

  const transportOn = (key: 'browserEnabled' | 'emailEnabled' | 'inAppEnabled') => {
    if (!prefs[key]) return false;
    if (!roomScoped || !room) return true;
    return room[key];
  };

  const setQuietTime = (key: 'sleepStart' | 'sleepEnd', value: string) => {
    onChangePrefs({
      ...prefs,
      [key]: value,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    });
  };

  return (
    <Stack
      data-testid="voice-notification-settings"
      sx={{ width: '100%', maxWidth: 640, gap: '28px' }}
    >
      <Stack sx={{ gap: '4px' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {roomScoped ? i18n._('This room') : i18n._('Notifications')}
        </Typography>
        <Typography sx={{ opacity: 0.75 }}>
          {roomScoped
            ? i18n._(
                'These choices only apply here. They can make this room quieter than your main settings. They cannot turn something back on.',
              )
            : i18n._(
                'Voice chat can reach you in three places. Pick where, when, and which notes you want.',
              )}
        </Typography>
      </Stack>

      <Section
        title={i18n._('Where notes show up')}
        subtitle={
          roomScoped
            ? i18n._('Turn a place off here if this room should stay quiet there.')
            : i18n._(
                'A browser alert appears on this device. Email goes to your inbox. A note inside the app waits on your home screen until you open it.',
              )
        }
      >
        {browserPermission !== 'granted' ? (
          <Button
            data-testid="voice-enable-notifications"
            variant="contained"
            color="info"
            onClick={onEnableBrowser}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            {browserPermission === 'denied'
              ? i18n._('Notifications are blocked in the browser')
              : i18n._('Turn on notifications')}
          </Button>
        ) : null}
        <FormControlLabel
          control={
            <Switch
              checked={transportOn('browserEnabled')}
              disabled={roomScoped && !prefs.browserEnabled}
              onChange={(_event, checked) => {
                if (roomScoped && room) onChangeNarrowing({ ...room, browserEnabled: checked });
                else onChangePrefs({ ...prefs, browserEnabled: checked });
              }}
            />
          }
          label={i18n._('Browser alerts')}
        />
        <FormControlLabel
          control={
            <Switch
              checked={transportOn('emailEnabled')}
              disabled={roomScoped && !prefs.emailEnabled}
              onChange={(_event, checked) => {
                if (roomScoped && room) onChangeNarrowing({ ...room, emailEnabled: checked });
                else onChangePrefs({ ...prefs, emailEnabled: checked });
              }}
            />
          }
          label={i18n._('Email')}
        />
        <FormControlLabel
          control={
            <Switch
              checked={transportOn('inAppEnabled')}
              disabled={roomScoped && !prefs.inAppEnabled}
              onChange={(_event, checked) => {
                if (roomScoped && room) onChangeNarrowing({ ...room, inAppEnabled: checked });
                else onChangePrefs({ ...prefs, inAppEnabled: checked });
              }}
            />
          }
          label={i18n._('Notes inside the app')}
        />
      </Section>

      {!roomScoped ? (
        <Section
          title={i18n._('Quiet hours')}
          subtitle={i18n._(
            'During this stretch, browser alerts and email stay silent. Notes inside the app still wait for you. Leave both as “Not set” if you always want to be reached.',
          )}
        >
          <Stack direction="row" sx={{ gap: '12px', flexWrap: 'wrap' }}>
            <TextField
              select
              label={i18n._('From')}
              value={prefs.sleepStart}
              onChange={(event) => setQuietTime('sleepStart', event.target.value)}
              sx={{ width: 180 }}
              slotProps={{ htmlInput: { 'data-testid': 'voice-quiet-from' } }}
            >
              <MenuItem value="">{i18n._('Not set')}</MenuItem>
              {QUIET_TIMES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={i18n._('Until')}
              value={prefs.sleepEnd}
              onChange={(event) => setQuietTime('sleepEnd', event.target.value)}
              sx={{ width: 180 }}
              slotProps={{ htmlInput: { 'data-testid': 'voice-quiet-until' } }}
            >
              <MenuItem value="">{i18n._('Not set')}</MenuItem>
              {QUIET_TIMES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Section>
      ) : null}

      <Section
        title={i18n._('What you want to hear about')}
        subtitle={
          roomScoped
            ? i18n._('Turn a kind of note off for this room only.')
            : i18n._(
                'Each switch is a kind of note. New rooms stay off until you ask for them, so a room someone else starts does not interrupt you.',
              )
        }
      >
        <FormControlLabel
          control={
            <Switch
              checked={kindOn('newMessages')}
              disabled={roomScoped && !prefs.newMessages}
              onChange={(_event, checked) => {
                if (roomScoped && room) onChangeNarrowing({ ...room, newMessages: checked });
                else onChangePrefs({ ...prefs, newMessages: checked });
              }}
            />
          }
          label={i18n._('New voice messages')}
        />
        <FormControlLabel
          control={
            <Switch
              checked={kindOn('reviewJoiners')}
              disabled={roomScoped && !prefs.reviewJoiners}
              onChange={(_event, checked) => {
                if (roomScoped && room) onChangeNarrowing({ ...room, reviewJoiners: checked });
                else onChangePrefs({ ...prefs, reviewJoiners: checked });
              }}
            />
          }
          label={i18n._('Someone wants to join, or your introduction was answered')}
        />
        {!roomScoped ? (
          <FormControlLabel
            control={
              <Switch
                checked={prefs.newRooms}
                onChange={(_event, checked) => onChangePrefs({ ...prefs, newRooms: checked })}
              />
            }
            label={i18n._('A new room was opened')}
          />
        ) : null}
      </Section>
    </Stack>
  );
};
