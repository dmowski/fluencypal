'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Typography, Divider } from '@mui/material';
import { useGameState } from '../hooks/useGameState';
import { WordCard } from './WordCard';
import { GameControls } from './GameControls';
import { Timer } from './Timer';
import { WordCounter } from './WordCounter';

export const GamePlay = () => {
  const {
    state,
    getCurrentPlayer,
    getCurrentTeam,
    getCurrentTurn,
    getNextWord,
    setCurrentWord,
    recordCorrect,
    recordSkip,
    endTurn,
  } = useGameState();

  const player = getCurrentPlayer();
  const team = getCurrentTeam();
  const turn = getCurrentTurn();

  const turnSettings = state.settings?.turnSettings;
  const isTimed = turnSettings?.type === 'timed';
  const duration = turnSettings?.duration ?? 60;
  const wordLimit = turnSettings?.wordCount ?? 10;

  const [remainingSeconds, setRemainingSeconds] = useState(duration);

  useEffect(() => {
    if (!turn || !isTimed || !turn.isActive) return;

    const startTime = turn.startTime;
    setRemainingSeconds(duration);

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const nextRemaining = Math.max(duration - elapsedSeconds, 0);
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) {
        clearInterval(interval);
        endTurn();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [turn?.startTime, isTimed, duration, endTurn]);

  useEffect(() => {
    if (!turn) return;
    if (turn.currentWord) return;
    const next = getNextWord();
    if (next) {
      setCurrentWord(next);
    }
  }, [turn, getNextWord, setCurrentWord]);

  const actionCount = turn?.actions.length ?? 0;
  const canContinue = Boolean(turn?.currentWord);

  const currentLabel = useMemo(() => {
    if (!state.settings) return '';
    if (state.settings.mode === 'teams') {
      return team?.name ?? 'Team';
    }
    return player?.name ?? 'Player';
  }, [state.settings, team?.name, player?.name]);

  const handleCorrect = () => {
    if (!turn?.currentWord) return;
    recordCorrect(turn.currentWord);

    if (!isTimed && actionCount + 1 >= wordLimit) {
      endTurn();
    }
  };

  const handleSkip = () => {
    if (!turn?.currentWord) return;
    recordSkip(turn.currentWord);

    if (!isTimed && actionCount + 1 >= wordLimit) {
      endTurn();
    }
  };

  if (!state.settings || !turn) {
    return (
      <Container maxWidth="md" data-testid="gameplay">
        <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
          <Typography variant="h4">Gameplay</Typography>
          <Typography variant="body1" color="text.secondary">
            Preparing your game...
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" data-testid="gameplay">
      <Stack spacing={4} alignItems="center" sx={{ py: 4 }}>
        <Stack spacing={0.5} alignItems="center">
          <Typography variant="subtitle2" color="text.secondary">
            {state.settings.mode === 'teams' ? 'Team' : 'Player'} turn
          </Typography>
          <Typography variant="h5" fontWeight="bold" data-testid="gameplay-current-player">
            {currentLabel}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          {isTimed ? (
            <Timer remainingSeconds={remainingSeconds} />
          ) : (
            <WordCounter current={actionCount} total={wordLimit} />
          )}
        </Stack>

        <Divider flexItem />

        <WordCard word={turn.currentWord || '...'} />

        <GameControls onCorrect={handleCorrect} onSkip={handleSkip} />

        {!canContinue && (
          <Typography variant="body2" color="text.secondary">
            Loading a word...
          </Typography>
        )}
      </Stack>
    </Container>
  );
};
