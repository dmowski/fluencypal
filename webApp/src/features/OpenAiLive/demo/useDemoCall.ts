'use client';
import { sendSpeechStart } from '@/features/Analytics/Custom/sendSpeechStart';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { useEffect, useRef, useState } from 'react';
import { connectOpenAiLiveCall, LiveSocket } from '../connectLiveCall';
import { appendLiveTranscript, LiveTranscriptLine } from '../transcripts';
import { unlockTeacherAudio } from '../teacherPlayback';
import { OpenAiLiveApiError } from '../api';
import { demoRequest } from './api';
import { DEMO_DURATION_MS, DEMO_CONNECT_MS } from './policy';
import { sendCallState, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';

type DemoRun = {
  controller: AbortController;
  socket?: LiveSocket;
  sessionId?: string;
  deadline: number;
  ready: boolean;
  timer?: ReturnType<typeof setInterval>;
};

export const useDemoCall = () => {
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'live' | 'ended'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<LiveTranscriptLine[]>([]);
  const [remaining, setRemaining] = useState(DEMO_DURATION_MS);
  const [muted, setMuted] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const run = useRef<DemoRun | null>(null);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const end = (reason = 'demo-ended', update = true) => {
    const active = run.current;
    if (!active) return;
    run.current = null;
    clearInterval(active.timer);
    active.socket?.requestClose();
    active.controller.abort();
    active.socket?.destroy();
    if (active.sessionId)
      void demoRequest({ action: 'close', sessionId: active.sessionId }).catch(() => undefined);
    sendCallState({
      state: 'ended',
      conversationId: active.sessionId,
      reason,
      userMessageCount: linesRef.current.filter((line) => line.role === 'user').length,
    });
    if (update) setPhase(active.sessionId ? 'ended' : 'idle');
  };
  const endRef = useRef(end);
  endRef.current = end;
  useEffect(() => {
    const leave = () => endRef.current('demo-page-left', false);
    window.addEventListener('pagehide', leave);
    return () => {
      window.removeEventListener('pagehide', leave);
      leave();
    };
  }, []);

  const start = async (language: string) => {
    if (run.current) return;
    unlockTeacherAudio();
    const active: DemoRun = {
      controller: new AbortController(),
      deadline: Date.now() + 60_000,
      ready: false,
    };
    run.current = active;
    setError(null);
    setLines([]);
    setMuted(false);
    setNeedsUnlock(false);
    setRemaining(DEMO_DURATION_MS);
    setPhase('connecting');
    sendCallState({ state: 'connecting', reason: 'demo' });
    active.timer = setInterval(() => {
      if (run.current !== active) return;
      const left = Math.max(0, active.deadline - Date.now());
      if (active.ready) setRemaining(left);
      if (!left) {
        if (!active.ready)
          setError('Could not connect. Check microphone access and your connection.');
        end(active.ready ? 'demo-limit' : 'demo-connection-timeout');
      }
    }, 250);
    try {
      await connectOpenAiLiveCall({
        mode: 'talk',
        greet: false,
        signal: active.controller.signal,
        offer: async (sdp) => {
          const created = await demoRequest<{ sessionId: string; sdp: string }>({
            action: 'start',
            sdp,
            language,
            consent: true,
          });
          active.sessionId = created.sessionId;
          if (run.current !== active) {
            void demoRequest({ action: 'close', sessionId: created.sessionId }).catch(
              () => undefined,
            );
            throw new Error('Cancelled');
          }
          active.deadline = Date.now() + DEMO_CONNECT_MS;
          return created;
        },
        onBind: (socket) => {
          active.socket = socket;
        },
        onEvent: (event) => {
          if (
            run.current === active &&
            typeof event.type === 'string' &&
            event.type.includes('input_transcript') &&
            (event.text || event.delta || event.transcript)
          )
            sendSpeechStart('conversation');
          if (run.current === active) setLines((current) => appendLiveTranscript(current, event));
        },
        onStarted: () => {
          void demoRequest<{ remainingMs: number }>({
            action: 'ready',
            sessionId: active.sessionId,
          })
            .then((result) => {
              if (run.current !== active) return;
              active.ready = true;
              active.deadline = Date.now() + Math.min(DEMO_DURATION_MS, result.remainingMs);
              setPhase('live');
              sendAnalyticsEvent({ name: 'conversation_start', conversationId: active.sessionId });
              sendCallState({
                state: 'connected',
                conversationId: active.sessionId,
                reason: 'demo',
              });
            })
            .catch(() => {
              if (run.current !== active) return;
              setError('The demo could not connect. Please try the learning plan instead.');
              end('demo-ready-failed');
            });
        },
        onRemoteClosed: () => {
          if (run.current === active) end('demo-remote');
        },
        onNeedsUnlock: () => {
          if (run.current === active) setNeedsUnlock(true);
        },
      });
    } catch (cause) {
      if (run.current !== active) return;
      setError(cause instanceof Error ? cause.message : 'Could not start the demo.');
      sendUiError('demo-start-failed');
      end('demo-start-failed');
      if (cause instanceof OpenAiLiveApiError && cause.status === 429) setPhase('ended');
    }
  };
  return {
    phase,
    error,
    lines,
    remaining,
    muted,
    needsUnlock,
    start,
    end,
    toggleMute: () => {
      if (phase !== 'live') return;
      setMuted(!muted);
      run.current?.socket?.setMuted(!muted);
    },
    unlock: () => {
      void run.current?.socket
        ?.playAudio()
        .then(() => setNeedsUnlock(false))
        .catch(() => undefined);
    },
  };
};
