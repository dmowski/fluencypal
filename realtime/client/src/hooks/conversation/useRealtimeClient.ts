import { useCallback, useRef } from 'react';
import { debugLog } from '../../lib/debugLog.js';
import { RealtimeSessionClient } from '../../lib/sessionClient.js';
import { sessionStatusToneFromMessage, type StatusTone } from './types.js';

type RealtimeClientCallbacks = {
  micMuted: boolean;
  onSessionStatus: (text: string, tone: StatusTone) => void;
  onSessionReady: () => void;
  onTranscriptDelta: (messageId: string, role: 'user' | 'assistant', delta: string) => void;
  onTranscriptDone: (messageId: string, role: 'user' | 'assistant', text: string) => void;
  onUsage: (params: {
    stage: string;
    model: string;
    usageEvent: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
      audioDurationSeconds?: number;
    } | null;
    createdAt?: number;
  }) => void;
  onAssistantPlaybackEnded: () => void;
};

export const useRealtimeClient = (callbacks: RealtimeClientCallbacks) => {
  const clientRef = useRef<RealtimeSessionClient | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const getClient = useCallback((): RealtimeSessionClient => {
    if (!clientRef.current) {
      clientRef.current = new RealtimeSessionClient({
        onStatus: (status) => {
          callbacksRef.current.onSessionStatus(status, sessionStatusToneFromMessage(status));
        },
        onSessionReady: () => {
          callbacksRef.current.onSessionReady();
        },
        onTranscriptDelta: (messageId, role, delta) => {
          callbacksRef.current.onTranscriptDelta(messageId, role, delta);
        },
        onTranscriptDone: (messageId, role, text) => {
          callbacksRef.current.onTranscriptDone(messageId, role, text);
        },
        onUsage: (params) => {
          callbacksRef.current.onUsage(params);
        },
        onError: (message) => {
          debugLog('error', message);
          callbacksRef.current.onSessionStatus(`Error: ${message}`, 'error');
        },
        onAssistantPlaybackEnded: () => {
          callbacksRef.current.onAssistantPlaybackEnded();
        },
      });
    }
    return clientRef.current;
  }, []);

  const disconnectClient = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const isClientConnected = useCallback(() => clientRef.current?.isConnected ?? false, []);

  return { getClient, disconnectClient, isClientConnected, clientRef };
};
