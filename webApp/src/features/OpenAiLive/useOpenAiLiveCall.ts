'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import {
  OpenAiLiveApiError,
  requestOpenAiLiveClose,
  requestOpenAiLiveSession,
  requestOpenAiLiveUsage,
} from './api';
import { connectOpenAiLiveCall, LiveSocket } from './connectLiveCall';
import { appendLiveTranscript, LiveTranscriptLine } from './transcripts';
import { OpenAiLiveMode } from './types';

type EndReason = 'user' | 'balance' | 'remote' | 'unmount';

export const useOpenAiLiveCall = ({
  onBalance,
  onPaywall,
}: {
  onBalance: (balanceUsdMicros: number) => void;
  onPaywall: () => void;
}) => {
  const auth = useAuth();
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;
  const [lines, setLines] = useState<LiveTranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const socketRef = useRef<LiveSocket | null>(null);
  const sessionIdRef = useRef('');
  const endingRef = useRef(false);
  const getTokenRef = useRef(auth.getToken);
  getTokenRef.current = auth.getToken;
  const onBalanceRef = useRef(onBalance);
  onBalanceRef.current = onBalance;
  const onPaywallRef = useRef(onPaywall);
  onPaywallRef.current = onPaywall;

  const billAndClose = async (sessionId: string) => {
    const result = await requestOpenAiLiveClose(await getTokenRef.current(), sessionId);
    onBalanceRef.current(result.balanceUsdMicros);
    return result;
  };

  const endRef = useRef<(reason: EndReason) => Promise<void>>(async () => undefined);
  endRef.current = async (reason: EndReason) => {
    if (endingRef.current) return;
    endingRef.current = true;
    const socket = socketRef.current;
    const sessionId = sessionIdRef.current;
    socket?.requestClose();
    socket?.destroy();
    socketRef.current = null;
    if (reason !== 'unmount') {
      setPhase('idle');
      setStartedAt(null);
      setNeedsUnlock(false);
    }
    if (sessionId) {
      sessionIdRef.current = '';
      try {
        const result = await billAndClose(sessionId);
        if (result.shouldStop || reason === 'balance') onPaywallRef.current();
      } catch (closeError) {
        if (reason !== 'unmount') {
          setError(
            closeError instanceof Error ? closeError.message : 'Could not close the session',
          );
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      void endRef.current('unmount');
    };
  }, []);

  useEffect(() => {
    if (phase !== 'live') return;
    const tick = window.setInterval(() => {
      void (async () => {
        const sessionId = sessionIdRef.current;
        if (!sessionId || endingRef.current) return;
        try {
          const result = await requestOpenAiLiveUsage(await getTokenRef.current(), sessionId);
          onBalanceRef.current(result.balanceUsdMicros);
          if (result.shouldStop) {
            onPaywallRef.current();
            await endRef.current('balance');
          }
        } catch (usageError) {
          setError(usageError instanceof Error ? usageError.message : 'Could not update usage');
        }
      })();
    }, 5_000);
    const clock = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(clock);
    };
  }, [phase]);

  const start = async (mode: OpenAiLiveMode, voice: string) => {
    if (phase !== 'idle') return;
    endingRef.current = false;
    setError(null);
    setLines([]);
    setMuted(false);
    setNeedsUnlock(false);
    setPhase('connecting');
    try {
      await connectOpenAiLiveCall({
        mode,
        offer: async (sdp) => {
          const created = await requestOpenAiLiveSession(await getTokenRef.current(), {
            sdp,
            mode,
            voice,
          });
          if (endingRef.current) {
            await requestOpenAiLiveClose(await getTokenRef.current(), created.sessionId);
            throw new Error('Cancelled');
          }
          sessionIdRef.current = created.sessionId;
          return created;
        },
        onBind: (socket) => {
          if (endingRef.current) {
            socket.requestClose();
            socket.destroy();
            return;
          }
          socketRef.current = socket;
          sessionIdRef.current = socket.sessionId;
          if (mutedRef.current) socket.setMuted(true);
        },
        onEvent: (event) => {
          setLines((current) => appendLiveTranscript(current, event));
        },
        onStarted: () => {
          setStartedAt(Date.now());
          setPhase('live');
        },
        onRemoteClosed: () => {
          void endRef.current('remote');
        },
        onNeedsUnlock: () => setNeedsUnlock(true),
      });
    } catch (startError) {
      if (endingRef.current) {
        setPhase('idle');
        return;
      }
      socketRef.current?.destroy();
      socketRef.current = null;
      const sessionId = sessionIdRef.current;
      sessionIdRef.current = '';
      if (sessionId) {
        try {
          const result = await billAndClose(sessionId);
          onBalanceRef.current(result.balanceUsdMicros);
        } catch {
          // The start error is the one to show.
        }
      }
      if (startError instanceof OpenAiLiveApiError && startError.status === 402) {
        onPaywallRef.current();
        setError(null);
      } else {
        setError(
          startError instanceof Error ? startError.message : 'Could not start the conversation',
        );
      }
      setPhase('idle');
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    socketRef.current?.setMuted(next);
  };

  const unlockAudio = () => {
    void socketRef.current
      ?.playAudio()
      .then(() => setNeedsUnlock(false))
      .catch(() => undefined);
  };

  return {
    phase,
    muted,
    lines,
    error,
    needsUnlock,
    elapsedMs: startedAt ? now - startedAt : 0,
    start,
    toggleMute,
    unlockAudio,
    end: () => endRef.current('user'),
  };
};
