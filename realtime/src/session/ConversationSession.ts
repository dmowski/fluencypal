import { randomUUID } from 'node:crypto';
import type { AuthUserInfo } from '../auth/types.js';
import { parseBinaryFrame } from '../protocol/audioCodec.js';
import type {
  ClientMessage,
  SessionStartConfig,
  ServerMessage,
  SessionUpdatePatch,
} from '../protocol/messages.js';
import { ConversationHistory } from './history.js';

export type SessionRuntimeConfig = SessionStartConfig & {
  correctionInstruction: string;
};

export type SendServerMessage = (message: ServerMessage) => void;

export class ConversationSession {
  readonly sessionId: string;
  readonly user: AuthUserInfo;
  readonly history = new ConversationHistory();
  readonly createdAt = Date.now();

  private config: SessionRuntimeConfig;
  private readonly send: SendServerMessage;
  private readonly abortController = new AbortController();
  private disposed = false;
  private pendingUserAudio: Buffer[] = [];
  private pendingUserText = '';

  constructor({
    sessionId,
    user,
    config,
    send,
  }: {
    sessionId: string;
    user: AuthUserInfo;
    config: SessionStartConfig;
    send: SendServerMessage;
  }) {
    this.sessionId = sessionId;
    this.user = user;
    this.config = {
      ...config,
      correctionInstruction: '',
    };
    this.send = send;
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

  handleClientMessage(message: ClientMessage): void {
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
        return;
      case 'assistant.instruction':
        this.applyInstruction(message.text, message.mode);
        return;
      case 'user.text':
        this.pendingUserText = message.text;
        return;
      case 'user.turn.commit':
        this.commitUserTurn(message.messageId);
        return;
      case 'user.turn.cancel':
        this.cancelUserTurn();
        return;
      case 'assistant.trigger':
        // Full pipeline wired in step 1.4
        return;
      case 'vision.frame':
        // Reserved for later JPEG-to-LLM support.
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
  }

  dispose(_reason?: string): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.pendingUserAudio = [];
    this.pendingUserText = '';
    this.abortController.abort();
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error('Session is closed');
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

  private commitUserTurn(messageId?: string): void {
    const id = messageId ?? randomUUID();
    const textFromAudio = this.flushPendingUserAudioPlaceholder();
    const text = this.pendingUserText || textFromAudio;

    if (!text) {
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

    this.pendingUserText = '';
  }

  private cancelUserTurn(): void {
    this.pendingUserAudio = [];
    this.pendingUserText = '';
  }

  /** Placeholder until STT is wired in step 1.4. */
  private flushPendingUserAudioPlaceholder(): string {
    if (this.pendingUserAudio.length === 0) {
      return '';
    }

    this.pendingUserAudio = [];
    return '';
  }
}
