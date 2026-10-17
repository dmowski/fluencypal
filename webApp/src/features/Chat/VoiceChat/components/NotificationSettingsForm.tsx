'use client';

import { Button, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { RoomNotificationNarrowing, SpeakingNotificationPrefs } from '../types';

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

  return (
    <Stack data-testid="voice-notification-settings" sx={{ width: '100%', gap: '14px' }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {roomScoped ? i18n._('This room') : i18n._('Notifications')}
      </Typography>
      <Typography sx={{ opacity: 0.75 }}>
        {roomScoped
          ? i18n._('These choices can only make this room quieter than your main settings.')
          : i18n._('Choose how you want to hear about voice chat.')}
      </Typography>
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
        label={i18n._('Browser notifications')}
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
        label={i18n._('Inside the app')}
      />
      {!roomScoped ? (
        <Stack direction="row" sx={{ gap: '10px', flexWrap: 'wrap' }}>
          <TextField
            type="time"
            label={i18n._('Quiet from')}
            value={prefs.sleepStart}
            onChange={(event) =>
              onChangePrefs({
                ...prefs,
                sleepStart: event.target.value,
                timezoneOffsetMinutes: new Date().getTimezoneOffset(),
              })
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="time"
            label={i18n._('Quiet until')}
            value={prefs.sleepEnd}
            onChange={(event) =>
              onChangePrefs({
                ...prefs,
                sleepEnd: event.target.value,
                timezoneOffsetMinutes: new Date().getTimezoneOffset(),
              })
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      ) : null}
      <Typography sx={{ opacity: 0.75 }}>
        {i18n._(
          'During quiet hours, browser and email stay silent. Notes in the app still wait for you.',
        )}
      </Typography>
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
        label={i18n._('Reviews of new people')}
      />
      {!roomScoped ? (
        <FormControlLabel
          control={
            <Switch
              checked={prefs.newRooms}
              onChange={(_event, checked) => onChangePrefs({ ...prefs, newRooms: checked })}
            />
          }
          label={i18n._('New rooms')}
        />
      ) : null}
    </Stack>
  );
};
