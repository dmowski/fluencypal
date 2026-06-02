import { randomUUID } from 'node:crypto';
import type { AuthUserInfo } from '../auth/types.js';
import { defaultProviderRegistry } from '../providers/registry.js';
import type { ProviderRegistry } from '../providers/types.js';
import { parseBinaryFrame } from '../protocol/audioCodec.js';
import type {
  ClientMessage,
  ConversationMode,
  ServerMessage,
  SessionStartConfig,
  SessionUpdatePatch,
} from '../protocol/messages.js';
import { ConversationHistory } from './history.js';
import { TurnPipeline } from './TurnPipeline.js';
import { RealtimeTurnDetector, computePcm16Rms, estimateBufferedSpeechMs } from './turnDetection.js';
import { isAbortError } from '../errors/isAbortError.js';
import { sessionLog, sessionWarn } from '../log/sessionLog.js';

export type SessionRuntimeConfig = SessionStartConfig & {
  correctionInstruction: string;
};

export type SendServerMessage = (message: ServerMessage) => void;
export type SendBinary = (chunk: Buffer) => void;

export class ConversationSession {
  readonly sessionId: string;
  readonly user: AuthUserInfo;
  readonly history = new ConversationHistory();
  readonly createdAt = Date.now();

  private config: SessionRuntimeConfig;
  private readonly send: SendServerMessage;
  private readonly sendBinary: SendBinary;
  private readonly pipeline: TurnPipeline;
  private readonly turnDetector = new RealtimeTurnDetector();
  private readonly abortController = new AbortController();
  private disposed = false;
  private pendingUserAudio: Buffer[] = [];
  private pendingUserText = '';
  private turnCommitInProgress = false;
  private pendingTurnCommit = false;
  private userSpeaking = false;
  private binaryChunkCount = 0;

  constructor({
    sessionId,
    user,
    config,
    send,
    sendBinary = () => {},
    providers = defaultProviderRegistry,
  }: {
    sessionId: string;
    user: AuthUserInfo;
    config: SessionStartConfig;
    send: SendServerMessage;
    sendBinary?: SendBinary;
    providers?: ProviderRegistry;
  }) {
    this.sessionId = sessionId;
    this.user = user;
    this.config = {
      ...config,
      correctionInstruction: '',
    };
    this.send = send;
    this.sendBinary = sendBinary;
    this.pipeline = new TurnPipeline(
      providers,
      { send, sendBinary },
      () => this.config,
      this.history,
      this.abortController.signal,
    );
  }

  get signal(): AbortSignal {
    return this.abortController.signal;
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

  get runtimeConfig(): Readonly<SessionRuntimeConfig> {
    return this.config;
  }

  async handleClientMessage(message: ClientMessage): Promise<void> {
    this.assertActive();

    switch (message.type) {
      case 'session.start':
        throw new Error('session.start is handled by the connection layer');
      case 'session.ping':
        this.send({ type: 'session.pong' });
        return;
      case 'session.end':
        this.dispose('client_end');
        this.send({ type: 'session.ended' });
        return;
      case 'session.update':
        this.applyConfigPatch(message.patch);
        if (message.patch.voiceEnabled === false) {
          this.pipeline.abortInFlight();
        }
        return;
      case 'assistant.instruction':
        this.applyInstruction(message.text, message.mode);
        return;
      case 'user.text':
        this.pendingUserText = message.text;
        return;
      case 'user.turn.commit':
        sessionLog(this.sessionId, 'turn.commit_requested', { messageId: message.messageId });
        await this.commitUserTurn(message.messageId);
        return;
      case 'user.turn.cancel':
        this.cancelUserTurn();
        return;
      case 'assistant.trigger':
        sessionLog(this.sessionId, 'assistant.trigger');
        try {
          await this.pipeline.generateAssistantResponse();
        } catch (error) {
          if (isAbortError(error)) {
            sessionLog(this.sessionId, 'turn.aborted');
            return;
          }
          throw error;
        }
        return;
      case 'vision.frame':
        return;
      default: {
        const _exhaustive: never = message;
        return _exhaustive;
      }
    }
  }

  handleBinaryAudio(chunk: Buffer): void {
    this.assertActive();

    if (this.config.micMuted) {
      return;
    }

    const frame = parseBinaryFrame(chunk);
    this.pendingUserAudio.push(frame.payload);
    this.binaryChunkCount += 1;

    if (this.binaryChunkCount === 1 || this.binaryChunkCount % 50 === 0) {
      sessionLog(this.sessionId, 'audio.chunk_received', {
        bytes: frame.payload.length,
        pendingChunks: this.pendingUserAudio.length,
        bufferedMs: estimateBufferedSpeechMs(this.pendingUserAudio),
        rms: Math.round(computePcm16Rms(frame.payload)),
        chunkCount: this.binaryChunkCount,
      });
    }

    if (this.config.mode === 'RealTimeConversation') {
      this.turnDetector.processChunk(frame.payload, {
        onSpeechStart: () => this.handleUserSpeechStart(),
        onSpeechEnd: () => this.handleUserSpeechEnd(),
        onTurnEnd: () => {
          sessionLog(this.sessionId, 'turn.end_detected', {
            bufferedMs: estimateBufferedSpeechMs(this.pendingUserAudio),
          });
          this.scheduleCommitUserTurn();
        },
      });
    }
  }

  dispose(_reason?: string): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.turnDetector.reset();
    this.pipeline.abortInFlight();
    this.pendingUserAudio = [];
    this.pendingUserText = '';
    this.abortController.abort();
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error('Session is closed');
    }
  }

  private handleUserSpeechStart(): void {
    const interrupted = this.pipeline.abortAssistantOutput();

    sessionLog(this.sessionId, 'turn.speech_start', {
      interrupted,
      pipelineBusy: this.pipeline.isBusy,
    });

    if (interrupted) {
      this.send({ type: 'assistant.interrupted' });
    }

    if (!this.userSpeaking) {
      this.userSpeaking = true;
      this.send({ type: 'user.speaking', active: true });
    }
  }

  private handleUserSpeechEnd(): void {
    sessionLog(this.sessionId, 'turn.speech_end');

    if (this.userSpeaking) {
      this.userSpeaking = false;
      this.send({ type: 'user.speaking', active: false });
    }
  }

  private applyConfigPatch(patch: SessionUpdatePatch): void {
    this.config = {
      ...this.config,
      ...patch,
    };
  }

  private applyInstruction(text: string, mode: 'replace' | 'append'): void {
    if (mode === 'replace') {
      this.config.correctionInstruction = text;
      return;
    }

    this.config.correctionInstruction = [this.config.correctionInstruction, text]
      .filter(Boolean)
      .join('\n');
  }

  private async commitUserTurn(messageId?: string): Promise<void> {
    if (this.turnCommitInProgress) {
      sessionLog(this.sessionId, 'turn.commit_queued');
      this.pendingTurnCommit = true;
      return;
    }

    const id = messageId ?? randomUUID();
    const audioChunks = this.pendingUserAudio;
    const audioBytes = audioChunks.reduce((total, chunk) => total + chunk.length, 0);
    const bufferedMs = estimateBufferedSpeechMs(audioChunks);
    this.pendingUserAudio = [];
    this.turnDetector.reset();

    let text = this.pendingUserText;
    this.pendingUserText = '';

    sessionLog(this.sessionId, 'turn.commit_start', {
      messageId: id,
      audioBytes,
      bufferedMs,
      pendingText: text.length > 0,
    });

    if (!text && audioChunks.length === 0) {
      sessionLog(this.sessionId, 'turn.commit_skipped', { reason: 'no_audio_or_text' });
      return;
    }

    this.turnCommitInProgress = true;

    try {
      if (!text && audioChunks.length > 0) {
        text = await this.pipeline.transcribeAudio(audioChunks);
        sessionLog(this.sessionId, 'turn.stt_done', {
          textLength: text.length,
          preview: text.slice(0, 80),
        });
      }

      if (!text) {
        sessionWarn(this.sessionId, 'turn.commit_skipped', {
          reason: 'empty_transcript',
          audioBytes,
          bufferedMs,
        });
        return;
      }

      this.history.append({
        id,
        role: 'user',
        text,
        createdAt: Date.now(),
      });

      this.send({
        type: 'transcript.done',
        messageId: id,
        role: 'user',
        text,
      });

      sessionLog(this.sessionId, 'turn.generating_assistant');
      await this.pipeline.generateAssistantResponse();
      sessionLog(this.sessionId, 'turn.commit_done', { messageId: id });
    } catch (error) {
      if (isAbortError(error)) {
        sessionLog(this.sessionId, 'turn.aborted', { messageId: id });
        return;
      }
      throw error;
    } finally {
      this.turnCommitInProgress = false;

      if (this.pendingTurnCommit) {
        this.pendingTurnCommit = false;
        await this.commitUserTurn();
      }
    }
  }

  private scheduleCommitUserTurn(): void {
    void this.commitUserTurn().catch((error) => this.handleTurnPipelineError(error));
  }

  private handleTurnPipelineError(error: unknown): void {
    if (isAbortError(error)) {
      sessionLog(this.sessionId, 'turn.aborted');
      return;
    }

    sessionWarn(this.sessionId, 'turn.pipeline_error', {
      message: error instanceof Error ? error.message : String(error),
    });
    this.send({
      type: 'error',
      code: 'pipeline.failed',
      message: 'Something went wrong processing your turn. Try again.',
    });
  }

  private cancelUserTurn(): void {
    this.pipeline.abortInFlight();
    this.turnDetector.reset();
    this.pendingUserAudio = [];
    this.pendingUserText = '';

    if (this.userSpeaking) {
      this.userSpeaking = false;
      this.send({ type: 'user.speaking', active: false });
    }
  }
}

export const isRealtimeConversationMode = (mode: ConversationMode): boolean =>
  mode === 'RealTimeConversation';
