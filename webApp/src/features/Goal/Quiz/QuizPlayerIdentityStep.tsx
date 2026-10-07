'use client';

import { useRef, useState } from 'react';
import { Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '../../Survey/InfoStep';
import { useAuth } from '@/features/Auth/useAuth';
import { avatars } from '@/features/Game/avatars';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import * as Sentry from '@sentry/nextjs';

const MIN_USERNAME_LENGTH = 3;

export const QuizPlayerIdentityStep = ({
  onContinue,
  isStepLoading,
}: {
  onContinue: () => void;
  isStepLoading: boolean;
}) => {
  const { i18n } = useLingui();
  const game = useGame();
  const auth = useAuth();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(avatars[0] ?? null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const avatarTouchStart = useRef<{ x: number; y: number } | null>(null);

  const trimmed = username.trim();
  const isTooShort = trimmed.length > 0 && trimmed.length < MIN_USERNAME_LENGTH;
  const isTaken = Boolean(
    trimmed.length >= MIN_USERNAME_LENGTH &&
    game.userNames &&
    Object.entries(game.userNames).some(([id, name]) => id !== auth.uid && name === trimmed),
  );
  // A stalled Firestore listener in an in-app webview must not keep Next disabled.
  const canContinue =
    Boolean(auth.uid) &&
    trimmed.length >= MIN_USERNAME_LENGTH &&
    !isTaken &&
    Boolean(selectedAvatar) &&
    !saving &&
    !isStepLoading;

  const save = async () => {
    if (savingRef.current || !canContinue || !selectedAvatar) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await game.updateUsername(trimmed);
      await game.setAvatar(selectedAvatar);
      onContinue();
    } catch (error) {
      Sentry.captureException(error);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const helperText = isTaken
    ? i18n._('Username is already taken')
    : isTooShort
      ? i18n._('Username must be at least 3 characters long.')
      : '';

  return (
    <Stack data-testid="quiz-player-identity" data-analytics-screen="quiz.playerIdentity">
      <InfoStep
        title={i18n._('Choose your name')}
        subTitle={i18n._('Pick a username and an avatar. Other people will see them.')}
        actionButtonTitle={i18n._('Next')}
        actionButtonAnalyticsId="quiz-player-identity"
        onClick={() => {
          void save();
        }}
        disabled={!canContinue}
        isStepLoading={isStepLoading || saving}
        subComponent={
          <Stack sx={{ gap: '18px', paddingTop: '24px', width: '100%', minWidth: 0 }}>
            <TextField
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={i18n._('Username')}
              aria-label={i18n._('Username')}
              autoComplete="off"
              fullWidth
              error={isTaken || isTooShort}
              helperText={helperText}
            />
            <Stack sx={{ gap: '8px', width: '100%', minWidth: 0 }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {i18n._('Avatar')}
              </Typography>
              <Stack
                data-testid="quiz-avatar-picker"
                role="listbox"
                aria-label={i18n._('Choose an avatar')}
                sx={{
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  gap: '14px',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  padding: '12px 4px 16px',
                  scrollSnapType: 'x proximity',
                }}
              >
                {avatars.map((url, index) => {
                  const isSelected = url === selectedAvatar;
                  return (
                    <Stack
                      key={url}
                      component="button"
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-label={i18n._('Avatar {number}', { number: index + 1 })}
                      data-selected={isSelected ? 'true' : 'false'}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onTouchStart={(event) => {
                        const touch = event.changedTouches[0];
                        if (!touch) return;
                        avatarTouchStart.current = { x: touch.clientX, y: touch.clientY };
                      }}
                      onTouchEnd={(event) => {
                        const start = avatarTouchStart.current;
                        avatarTouchStart.current = null;
                        const touch = event.changedTouches[0];
                        if (!start || !touch) return;
                        const moved = Math.hypot(touch.clientX - start.x, touch.clientY - start.y);
                        if (moved > 12) return;
                        if (event.cancelable) event.preventDefault();
                        setSelectedAvatar(url);
                      }}
                      onClick={() => setSelectedAvatar(url)}
                      sx={{
                        flex: '0 0 auto',
                        scrollSnapAlign: 'start',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        touchAction: 'manipulation',
                        padding: index === 0 ? '0 0 0 10px' : '0',
                      }}
                    >
                      <Avatar url={url} avatarSize="72px" isSelected={isSelected} />
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          </Stack>
        }
      />
    </Stack>
  );
};
