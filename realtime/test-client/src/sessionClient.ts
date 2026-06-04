import { BARGE_IN_RMS_THRESHOLD, computeChunkRmsFromBuffer } from './audioCapture.js';
import { Mp3PlaybackQueue } from './audioPlayback.js';
import { unlockAudioPlayback } from './audioUnlock.js';
import { debugLog, debugLogVerbose } from './debugLog.js';

export type ServerMessage = {
  type: string;
  role?: 'user' | 'assistant';
  messageId?: string;
  delta?: string;
  text?: string;
  sessionId?: string;
  stage?: string;
  model?: string;
  usageEvent?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
  code?: string;
  message?: string;
  active?: boolean;
};

export type SessionClientHandlers = {
  onStatus: (status: string) => void;
  onSessionReady: (config: SessionStartConfig) => void;
  onTranscriptDelta: (messageId: string, role: 'user' | 'assistant', delta: string) => void;
  onTranscriptDone: (messageId: string, role: 'user' | 'assistant', text: string) => void;
  onUsage: (entry: {
    stage: string;
    model: string;
    usageEvent?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
      audioDurationSeconds?: number;
    };
    createdAt?: number;
  }) => void;
  onError: (message: string) => void;
};

export type SessionStartConfig = {
  languageCode: string;
  mode: 'PushToTalk' | 'RealTimeConversation';
  voiceEnabled: boolean;
  micMuted: boolean;
  systemInstruction: string;
  voice: 'shimmer' | 'ash' | 'marin' | 'verse';
};

const WS_LOG_SKIP = new Set(['transcript.delta', 'session.pong', 'user.speaking']);

export class RealtimeSessionClient {
  private socket: WebSocket | null = null;
  private readonly playback = new Mp3PlaybackQueue();
  private assistantSpeaking = false;
  private sessionConfig: SessionStartConfig | null = null;
  private audioChunksSent = 0;
  private audioChunksSkipped = 0;
  private messageChain: Promise<void> = Promise.resolve();
  private playCollectedPending = false;
  private ttsBytesReceived = 0;
  private playTask: Promise<void> = Promise.resolve();

  constructor(private readonly handlers: SessionClientHandlers) {}

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect(token: string, config: SessionStartConfig): void {
    this.disconnect();
    this.sessionConfig = config;
    this.audioChunksSent = 0;
    this.audioChunksSkipped = 0;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsBase = import.meta.env.VITE_REALTIME_WS_URL as string | undefined;
    const url = wsBase
      ? `${wsBase.replace(/\/$/, '')}/v1/session`
      : `${protocol}://${window.location.host}/v1/session`;
    debugLog('ws', 'connecting', { mode: config.mode, voiceEnabled: config.voiceEnabled });
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.addEventListener('open', () => {
      debugLog('ws', 'open');
      this.handlers.onStatus('Connected, starting session…');
      socket.send(
        JSON.stringify({
          type: 'session.start',
          token,
          config,
        }),
      );
    });

    socket.addEventListener('message', (event) => {
      void this.enqueueMessage(() => this.handleSocketMessage(event));
    });

    socket.addEventListener('close', (event) => {
      debugLog('ws', 'closed', {
        code: event.code,
        reason: event.reason || undefined,
        sent: this.audioChunksSent,
        skipped: this.audioChunksSkipped,
      });
      if (event.code !== 1000 && event.reason) {
        this.handlers.onError(`Connection closed: ${event.reason}`);
      } else {
        this.handlers.onStatus('Disconnected');
      }
      this.playback.reset();
      this.socket = null;
    });

    socket.addEventListener('error', () => {
      debugLog('ws', 'error');
      this.handlers.onError('WebSocket error');
    });
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendJson({ type: 'session.end' });
    }

    this.socket?.close();
    this.socket = null;
    this.playback.reset();
    this.sessionConfig = null;
    this.messageChain = Promise.resolve();
    this.playCollectedPending = false;
    this.assistantSpeaking = false;
    this.playTask = Promise.resolve();
  }

  sendJson(payload: unknown): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    const type =
      typeof payload === 'object' && payload && 'type' in payload
        ? String((payload as { type: unknown }).type)
        : 'unknown';
    if (type !== 'session.ping') {
      debugLogVerbose('ws', 'send', { type });
    }
    this.socket.send(JSON.stringify(payload));
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    if (!this.isConnected || !this.socket) {
      this.audioChunksSkipped += 1;
      return;
    }

    if (
      (this.playback.isPlaying || this.assistantSpeaking) &&
      computeChunkRmsFromBuffer(chunk) >= BARGE_IN_RMS_THRESHOLD
    ) {
      this.cancelAssistantAudio('local_barge_in');
    }

    this.audioChunksSent += 1;
    this.socket.send(chunk);
  }

  private cancelAssistantAudio(reason: string): void {
    this.playback.cancel();
    this.playCollectedPending = false;
    this.ttsBytesReceived = 0;
    this.playTask = Promise.resolve();
    debugLog('audio', reason);
  }

  private enqueueMessage(task: () => void | Promise<void>): Promise<void> {
    this.messageChain = this.messageChain
      .then(() => task())
      .catch((error) => {
        debugLog('error', 'message_handler', {
          message: error instanceof Error ? error.message : String(error),
        });
      });
    return this.messageChain;
  }

  private async handleSocketMessage(event: MessageEvent): Promise<void> {
    if (typeof event.data === 'string') {
      const message = JSON.parse(event.data) as ServerMessage;
      if (!WS_LOG_SKIP.has(message.type)) {
        const extra =
          message.type === 'transcript.done' && message.role
            ? { role: message.role, len: message.text?.length ?? 0 }
            : message.type === 'usage'
              ? { stage: message.stage }
              : message.code
                ? { code: message.code }
                : undefined;
        debugLog('ws', message.type, extra);
      }
      this.handleJsonMessage(message);
      return;
    }

    if (event.data instanceof Blob) {
      const buffer = await event.data.arrayBuffer();
      this.appendTtsChunk(buffer.byteLength);
      this.playback.append(buffer);
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      this.appendTtsChunk(event.data.byteLength);
      this.playback.append(event.data);
    }
  }

  private appendTtsChunk(bytes: number): void {
    const wasEmpty = this.ttsBytesReceived === 0;
    this.ttsBytesReceived += bytes;
    if (wasEmpty) {
      debugLogVerbose('audio', 'tts_stream_start');
    }
  }

  private schedulePlayCollected(): void {
    if (!this.playCollectedPending || this.assistantSpeaking || !this.playback.hasPendingChunks) {
      return;
    }

    this.playCollectedPending = false;
    const bytes = this.ttsBytesReceived;
    this.ttsBytesReceived = 0;

    this.playTask = this.playTask.then(async () => {
      await unlockAudioPlayback();
      try {
        await this.playback.playCollected();
        debugLog('audio', 'tts_played', { bytes });
      } catch (error) {
        debugLog('error', 'playback_failed', {
          message: error instanceof Error ? error.message : String(error),
        });
        this.handlers.onError(
          error instanceof Error ? error.message : 'Assistant audio could not play',
        );
      }
    });
  }

  sendTextTurn(text: string): void {
    this.sendJson({ type: 'user.text', text });
    this.sendJson({ type: 'user.turn.commit' });
  }

  updateSession(patch: Record<string, unknown>): void {
    this.sendJson({ type: 'session.update', patch });
  }

  private handleJsonMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'session.ready':
        this.handlers.onStatus(`Session ready (${message.sessionId ?? 'unknown'})`);
        if (this.sessionConfig) {
          this.handlers.onSessionReady(this.sessionConfig);
        }
        return;
      case 'transcript.delta':
        if (message.messageId && message.role && message.delta) {
          this.handlers.onTranscriptDelta(message.messageId, message.role, message.delta);
        }
        return;
      case 'transcript.done':
        if (message.messageId && message.role && message.text !== undefined) {
          this.handlers.onTranscriptDone(message.messageId, message.role, message.text);
        }
        return;
      case 'usage':
        this.handlers.onUsage({
          stage: message.stage ?? 'llm',
          model: message.model ?? 'unknown',
          usageEvent: message.usageEvent,
          createdAt: Date.now(),
        });
        return;
      case 'assistant.interrupted':
        this.cancelAssistantAudio('server_interrupted');
        return;
      case 'assistant.speaking':
        if (message.active) {
          // Stop any in-flight playback; binary chunks for this stream arrive after this signal.
          this.playback.stopInFlightOutput();
          this.assistantSpeaking = true;
        } else {
          this.assistantSpeaking = false;
          if (this.ttsBytesReceived > 0) {
            debugLog('audio', 'tts_stream_end', { bytes: this.ttsBytesReceived });
          }
          this.playCollectedPending = true;
          this.schedulePlayCollected();
        }
        return;
      case 'user.speaking':
        debugLogVerbose('user', message.active ? 'speaking' : 'silent');
        return;
      case 'error':
        debugLog('error', 'server', { code: message.code, message: message.message });
        this.handlers.onError(`${message.code ?? 'error'}: ${message.message ?? 'Unknown error'}`);
        return;
      case 'session.ended':
        this.handlers.onStatus('Session ended');
        return;
      default:
        return;
    }
  }
}
